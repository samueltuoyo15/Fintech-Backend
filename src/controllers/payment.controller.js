import crypto from "crypto"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import { initializeTransaction } from "../services/monnify.service.js"
import { nanoid } from "nanoid"
import logger from "../common/utils/logger.js"
import { transactionQueue } from "../queues/transaction.worker.js"
import dotenv from "dotenv"
dotenv.config()

const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY
const verifyTransaction = async (req, res) => {
    const signature = req.headers["monnify-signature"]
    const payload = JSON.stringify(req.body)

    const expectedSignature = crypto.createHmac("sha512", MONNIFY_SECRET_KEY).update(payload).digest("hex")
    if(signature !== expectedSignature){
        logger.warn("Invalid Monnify webhook signature")
        return res.status(430).json({ success: false, error: "Invalid signature"})
    }

    const { eventType, eventData } = req.body
    if(eventType !== "SUCCESSFUL_TRANSACTION"){
        return res.status(200).json({ message: "Webhook acknowledged: Skipped processing" })
    }

    try {
        const reference = eventData.paymentReference
        const amountPaid = eventData.amountPaid
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
          eventData
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
  const { email, amount } = req.body
  const userId = req.user._id

  if (!email || !amount) {
    return res.status(400).json({ error: "Email and Amount are required" })
  }

  if(amount < 100){
    return res.status(400).json({ error: "Amount to be funded must be greater than 100NGN"})
  }
  
  try {
    
    const userAccount = await Account.findOne({ user: userId })
    if (!userAccount) {
      return res.status(404).json({ error: "Account not found" })
    }

    const paymentRef = "REF_" + nanoid()

    const response = await initializeTransaction({
      amount: parseFloat(amount),
      customerEmail: email,
      paymentReference: paymentRef,
      paymentDescription: "Wallet Funding",
      currencyCode: "NGN",
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl: `${process.env.FRONTEND_DOMAIN}/dashboard`
    })

    const transaction = await Transaction.create({
      user: userId,
      type: "funding",
      amount: parseFloat(amount),
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
      checkoutUrl: response.responseBody.checkoutUrl,
      reference: paymentRef
    })
  } catch (error) {
    console.error("Error funding account:", error || error?.response?.data || error.message)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


export { fundAccount, verifyTransaction }