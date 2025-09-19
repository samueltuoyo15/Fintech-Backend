import crypto from "crypto"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import initializeTransaction from "../services/paystack.service.js"
import { nanoid } from "nanoid"
import logger from "../common/utils/logger.js"
import { transactionQueue } from "../workers/transaction.worker.js"
import { paystackConfig } from "../services/paystack.auth.js"
import dotenv from "dotenv"
dotenv.config()

const verifyTransactionWithWebhook = async (req, res) => {
    const signature = req.headers["x-paystack-signature"]
    const payload = JSON.stringify(req.body)

    const expectedSignature = crypto.createHmac("sha512", paystackConfig.secretKey).update(payload).digest("hex")
    if(signature !== expectedSignature){
        logger.warn("Invalid Paystack webhook signature")
        return res.status(430).json({ success: false, error: "Invalid signature"})
    }

    const { event, data } = req.body
    if(event !== "charge.success"){
        return res.status(200).json({ message: "Paystack Webhook acknowledged: Skipped processing" })
    }

    try {
        const reference = data.reference
        const amountPaid = data.amount / 100
        const transaction = await Transaction.findOne({ reference }).lean()
        if(!transaction){
            logger.warn(`transaction not found for reference: ${reference}`)
            return res.status(404).json({ success: false, error: "Transaction not found"})
        }

        if(transaction.status === "success"){
            logger.warn(`Transaction already marked successful: ${reference}`)
            return res.status(200).json({ message: "Transaction has been proccessed ealier"})
        }  

        await transactionQueue.add("process-wallet-funding", {
          reference: reference,
          amountPaid: amountPaid,
          eventData: data
        }, { jobId: reference })

        logger.info(`Transaction verified successfully: ${reference}`)
        return res.status(200).json({ success: true, message: `Transaction verified successfully`})
    } catch (error) {
      logger.error("Error processing Monnify webhook:", error)
      return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


const fundAccount = async (req, res) => {
  logger.info("Received request to fund account")
  const { amount } = req.body
  const userId = req.user._id

  if (!amount || typeof amount !== "number" || isNaN(amount)) {
    return res.status(400).json({ error: "Valid amount is required" })
  }

  if(amount < 100){
    return res.status(400).json({ error: "Amount to be funded must be greater than 100NGN"})
  }
  
  try {
    
    const userAccount = await Account.findOne({ user: userId }).populate("user")
    if (!userAccount) {
      return res.status(404).json({ error: "Account not found" })
    }

    const paymentRef = "REF_" + nanoid()

    const response = await initializeTransaction({
      amount: parseFloat(amount + 50),
      customerEmail: userAccount.user.email,
      paymentReference: paymentRef,
      paymentDescription: "Wallet Funding",
      redirectUrl: `${process.env.FRONTEND_DOMAIN}/dashboard`
    })

    const transaction = await Transaction.create({
      user: userId,
      type: "funding",
      amount: parseFloat(amount - 50),
      status: "pending",
      reference: paymentRef,
      metadata: {
        status: "successful",
        date: new Date().toISOString()
      }
    })

    userAccount.transactions.push(transaction._id)
    await userAccount.save()

    logger.info("Initialized transaction successfully")
    return res.status(200).json({
      message: "Transaction initialized. Please complete payment.",
      checkoutUrl: response.data.authorization_url,
      reference: paymentRef
    })
  } catch (error) {
    console.error("Error funding account:", error || error?.response?.data || error.message)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


export { fundAccount, verifyTransactionWithWebhook }