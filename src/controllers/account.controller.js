import logger from "../common/utils/logger.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import { nanoid } from "nanoid"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const getAllTransactions = async (req, res) => {
  const { userId } = req.params
  try {
    const account = await Account.findOne({ user: userId }).populate("transactions").lean()
    if (!account) return res.status(404).json({ error: "Account not found" })
    return res.status(200).json({ suceess: true, transactions: account })
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyDataSubcription = async (req, res) => {
  logger.info("Received request for data subscription")
  const paymentRef = "REF_" + nanoid()
  const { phone, service, plan_amount, network } = req.body
  const userId = req.user._id

  if (!phone || !network || !plan_amount || !service) {
    return res.status(400).json({ error: "Network, phone service and plan_amount are required" })
  }

  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })


    if (account.wallet_balance < plan_amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" })
    }

    const response = await axios.get(`${process.env.VTU_AFRICA_DOMAIN}/data/`, {
      params: {  
        apikey: process.env.VTUAFRICA_API_KEY,
        service,
        MobileNumber: phone,
        DataPlan: plan_amount.toString(),
        ref: `REF_${Date.now()}`,
   
      },
      paramsSerializer: params => {
        return Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
      }
    })

    if (isNaN(plan_amount)) {
      return res.status(500).json({ error: "Invalid amount received from data API" })
    }

    account.wallet_balance -= Number(Number(response.data.description.Amount_Charged))

    const transaction = await Transaction.create({
      user: userId,
      type: "data",
      amount: Number(response.data.description.Amount_Charged),
      status: "success",
      reference: paymentRef,
      metadata: {
        status: "successful",
        plan: `${response.data.description.ProductName} - ${response.data.description.DataSize}`,
        service: service,
        plan_amount: Number(response.data.description.Amount_Charged),
        plan_name: response.data.description.ProductName,
        date: response.data.description.transaction_date,
      }
    })

    account.transactions.push(transaction._id)
    await account.save()
 
    console.log("Data subscription successful", response.data.description)

    return res.status(201).json({
      success: true,
      message: `You successfully purchased data plan of ${response.data.description.ProductName} - ${response.data.description.DataSize} valid for: ${response.data.description.Validity}`
    })
  } catch (err) {
    console.error("error buying data:", err)
    await Transaction.create({
      user: userId,
      type: "data",
      status: "failed",
      reference: paymentRef,
      metadata: {
        service: service,
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


const getAllDataTransactions = async (req, res) => {
  const { userId } = req.params
  try {
    const account = await Account.findOne({ user: userId }).populate("transactions")
    if (!account) return res.status(404).json({ error: "Account not found" })

    const dataTransactions = account.transactions.filter(t => t.type === "data")
    return res.status(200).json(dataTransactions)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const queryDataTransaction = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "data" }).lean()
    if (!transaction) return res.status(404).json({ error: "Data transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyAirtimeSubscription = async (req, res) => {
  logger.info("Received request for airtime subscription")
  const { network, phone, amount } = req.body
  const userId = req.user._id
  
   const paymentRef = "REF_" + nanoid()

  if (!network || !phone || !amount) {
    return res.status(400).json({ error: "Network, phone, airtime type, amount, and ported number are required" })
  }

    if(amount < 100){
    return res.status(400).json({ error: "Amount must be greater than 100NGN"})
  }

  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })
  
    if (account.wallet_balance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." })
    }

    
    const response = await axios.get(`${process.env.VTU_AFRICA_DOMAIN}/airtime/`, {
      params: {  
        apikey: process.env.VTUAFRICA_API_KEY,
        network,
        phone,
        amount,
        ref: `REF_${Date.now()}` 
      },
      paramsSerializer: params => {
        return Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
      }
    })

      account.wallet_balance -= amount

      const transaction = await Transaction.create({
        user: userId,
        type: "airtime",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {
          network: response.data.network,
          date: response.data.create_date
        }
      })

      account.transactions.push(transaction._id)
      await account.save()

      logger.info("airtime sent successfully", response.data)
      return res.status(200).json({ success: true, message: "Airtime sent successfully"})
  } catch (error) {
    console.error("error buying airtime:", error)
     await Transaction.create({
      user: userId,
      type: "airtime",
      status: "failed",
      amount,
      reference: paymentRef,
      metadata: {
        network,
        phone, 
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: error || "Internal server error" })
  }
}

const queryAirtimeTransaction = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "airtime" }).lean()
    if (!transaction) return res.status(404).json({ error: "Airtime transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const payElectricityBills = async (req, res) => {
  const { disco_name, meter_number, meter_type, amount } = req.body
  const userId = req.user._id
 const paymentRef = "REF_" + nanoid()
  if (!disco_name || !amount || !meter_number || !meter_type) {
    return res.status(400).json({ error: "Disco name, amount, meter number, and meter type are required" })
  }
    if(amount < 100){
    return res.status(400).json({ error: "Amount must be greater than 100NGN"})
  }

  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })

    if (account.wallet_balance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." })
    }

     const response = await axios.get(`${process.env.VTU_AFRICA_DOMAIN}/electric/`, {
      params: {  
        apikey: process.env.VTUAFRICA_API_KEY,
        service: disco_name,
        meterNo: meter_number,
        metertype: meter_type,
        amount,
        ref: `REF_${Date.now()}` 
      },
      paramsSerializer: params => {
        return Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
      }
    })
      console.log("Electircity bill payment", response.data.description)
      account.wallet_balance -= amount

      const transaction = await Transaction.create({
        user: userId,
        type: "electricity",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {
          date: Date.now(),
          disco_name,
          meter_type,
          meter_number,
        }
      })

      account.transactions.push(transaction._id)
      await account.save()
      return res.status(200).json({ success: true, message: "electricity bill payment was successful"})
  } catch (error) {
    console.error("error paying electric bills", error)
     await Transaction.create({
      user: userId,
      type: "electricity",
      status: "failed",
      amount,
      reference: paymentRef,
      metadata: {
        disco_name,
        meter_type,
        meter_number,
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const queryElectricityBill = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "electricity" }).lean()
    if (!transaction) return res.status(404).json({ error: "Electricity transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyCableSubscription = async (req, res) => {
  const { cable_name, smart_card_number, variation } = req.body
  const userId = req.user._id
   const paymentRef = "REF_" + nanoid()
  if (!cable_name || !smart_card_number || !variation) {
    return res.status(400).json({ error: "Cable name, cable plan, smart card number, variation, and user ID are required" })
  }

  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })

    if (account.wallet_balance < 100) {
      return res.status(400).json({ error: "Insufficient wallet balance." })
    }

    const response = await axios.get(`${process.env.EXTERNAL_BACKEND_DOMAIN}/merchant-verify`, {
      params: {
      serviceName: "CableTV",
      service: cable_name,
      smartNo: smart_card_number,
      variation,
      },
       paramsSerializer: params => {
        return Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
      }   
    })

      account.wallet_balance -= Number(response.data.description.Amount_Charged)

      const transaction = await Transaction.create({
        user: userId,
        type: "cable",
        amount:  Number(response.data.description.Amount_Charged),
        status: "success",
        reference: paymentRef,
        metadata: {
         cable_name,
         smart_card_number,
         product_name: response.data.description.productName,
         date: Date.now()
        }
      })

      account.transactions.push(transaction._id)
      await account.save()
      return res.status(200).json(response.data)
  } catch (error) {
    console.error("failed to subscribe to cable", error)
     await Transaction.create({
      user: userId,
      type: "cable",
      status: "failed",
      reference: paymentRef,
      metadata: {
        cable_name,
        smart_card_number,
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const queryCableSubscription = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "cable" }).lean()
    if (!transaction) return res.status(404).json({ error: "Cable transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const purchaseAirtime2Cash = async (req, res) => {
  logger.info("Airtme to cash endpoint hit")

  const { network, phone_number, amount, } = req.body
  const userId = req.user._id
  if(!network || !phone_number || !amount){
    return res.status(400).json({ success: false, error: "Incomplete Request Body"})
  }
  try {

    const account = await Account.findOne({ user: userId }).populate("user")

    if (!account) return res.status(404).json({ error: "Account not found" })

    if (account.wallet_balance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." })
    }

    // const response = await axios.get(`https://vtuafrica.com.ng/portal/api-test/airtime-cash/?apikey=${process.env.VTUAFRICA_API_KEY}&network=${network}&sender=${account.user.email}&sendernumber=${phone_number}&amount=${amount}&sitephone=${process.env.VTUAFRICA_AIRTME2_CASH_PHONE_NUMBER}&ref=${"REF_" + nanoid()}&webhookURL=http://testlink.com/webhook/`)
    // console.log(response.data)
    return res.status(200).json({ success: true, message: "Airtime to Cash was successful!"})
  } catch(error){
    logger.error("Failed to purchase airtime to cash service")
    return res.status(500).json({ success: false, error: "Failed to purchase airtme to cash service"})
  }
}

const purchaseBulkSms = async (req, res) => {
  logger.info("Bulk SMS endpoint hit")
  try {
    const { message, phone_numbers } = req.body
    const userId = req.user._id

    if (!message || !phone_numbers || phone_numbers.length === 0) {
      return res.status(400).json({ success: false, error: "Message and phone numbers are required" })
    }

    const account = await Account.findOne({ user: userId }) 
    if(!account) return res.status(404).json({ success: false, error: "Account not found" })

    if (account.wallet_balance < 100) {
      return res.status(400).json({ success: false, error: "Insufficient wallet balance" })
    }

    const CHARGE_PER_SMS = 4 
    const totalCharge = CHARGE_PER_SMS * phone_numbers.length

    if (account.wallet_balance < totalCharge) {
      return res.status(400).json({ success: false, error: `Insufficient balance. Required: ${totalCharge}, Available: ${account.wallet_balance}` })
    }

    const response = await axios.get(`${process.env.VTU_AFRICA_DOMAIN}/sms/`, {
      params: {  
        apikey: process.env.VTUAFRICA_API_KEY,
        message: message,
        sendto: phone_numbers.join(","),
        sender: "VTUAFRICA",
        ref: `REF_${Date.now()}` 
      },
      paramsSerializer: params => {
        return Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
      }
    })

    if(response.data.code === 102) {
      logger.info("Bulk SMS response:", response.data.description.message)
      return res.status(402).json({ success: false, error: response.data.description.message })
    }

    account.wallet_balance -= totalCharge

    const transaction = await Transaction.create({
      user: userId,
      type: "bulk_sms",
      amount: -totalCharge,
      status: "success",
      reference: `SMS_${nanoid()}`,
      metadata: {
        receipients: phone_numbers,
        date: Date.now(),
        message_length: message.length,
      }
    })
    account.transactions.push(transaction._id)
      await account.save()
    return res.status(200).json({ success: true, data: "Message sent successfully to all the provided numbers", charge: totalCharge, })
  } catch (error){
    console.error("Failed to send bulk SMS", error.message)
    return res.status(500).json({ success: false, error })
  }
}


export {
  getAllTransactions,
  buyDataSubcription,
  getAllDataTransactions,
  queryDataTransaction,
  buyAirtimeSubscription,
  queryAirtimeTransaction,
  payElectricityBills,
  queryElectricityBill,
  buyCableSubscription,
  queryCableSubscription,
  purchaseAirtime2Cash,
  purchaseBulkSms
}
