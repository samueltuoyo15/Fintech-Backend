import logger from "../common/utils/logger.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import { dataPlans } from "../common/utils/plans.js"
import { nanoid } from "nanoid"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const getAllTransactions = async (req, res) => {
  const { userId } = req.params
  try {
    const account = await Account.findOne({ user: userId }).populate("transactions")
    if (!account) return res.status(404).json({ error: "Account not found" })
    return res.status(200).json({ suceess: true, transactions: account })
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


const buyDataSubcription = async (req, res) => {
  logger.info("Received request for data subscription")

  const { network, phone, plan, ported_number } = req.body
  const userId = req.user._id

  if (!network || !phone || !plan || typeof ported_number === "undefined") {
    return res.status(400).json({ error: "Network, phone, plan, and ported_number are required" })
  }

  try {
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })

    const selectedPlan = dataPlans.find(p => p.id === Number(plan))
    logger.info("selected plan", selectedPlan)

    if (!selectedPlan) {
      return res.status(400).json({ error: "Data plan is not available" })
    }

    if (account.wallet_balance < selectedPlan.amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" })
    }

    let response

    try {
      response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/data`, {
        network,
        mobile_number: phone,
        plan,
        ported_number
      }, {
        headers: {
          Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
        },
        timeout: 10000
      })
    } catch (apiError) {
      const status = apiError.response?.status || 500
      const message = apiError.response?.data?.error || "Failed to connect to data provider"
      logger.error("Data API error", apiError.response?.data || apiError.message)
      return res.status(status).json({ error: message })
    }

    const data = response.data

    const rawAmount = data.plan_amount ?? selectedPlan.amount
    const amount = parseFloat(rawAmount)

    if (isNaN(amount)) {
      return res.status(500).json({ error: "Invalid amount received from data API" })
    }

    account.wallet_balance -= amount
    account.total_funding += amount

    const paymentRef = "REF_" + nanoid()

    const transaction = await Transaction.create({
      user: userId,
      type: "data",
      amount,
      status: "success",
      reference: paymentRef,
      metadata: {
        status: "successful",
        plan: plan,
        network: data.network,
        plan_amount: amount,
        plan_name: data.plan_name,
        date: data.create_date,
        ported_number: !!ported_number
      }
    })

    account.transactions.push(transaction._id)
    await account.save()

    logger.info("Data subscription successful", data)

    return res.status(201).json({
      success: true,
      message: `You successfully purchased data of plan ${data.plan_name}`
    })
  } catch (err) {
    console.error("error buying data:", err)
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
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "data" })
    if (!transaction) return res.status(404).json({ error: "Data transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyAirtimeSubscription = async (req, res) => {
  logger.info("Received request for airtime subscription")
  const { network, phone, amount, airtime_type, ported_number } = req.body
  const userId = req.user._id
  if (!network || !phone || !amount || !airtime_type || typeof ported_number === "undefined") {
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

    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/topup`, {
      network,
      mobile_number: phone,
      amount,
      airtime_type,
      ported_number
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    if (response.status === 201) {
      account.wallet_balance -= amount
      account.total_funding += amount

      const paymentRef = "REF_" + nanoid()
      const transaction = await Transaction.create({
        user: userId,
        type: "airtime",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {
          status: "successful",
          network: response.data.network,
          date: response.data.create_date,
          ported_number: !!ported_number
        }
      })

      account.transactions.push(transaction._id)
      await account.save()

      return res.status(200).json(response.data)
    } else {
      return res.status(response.status).json({ error: "Failed to subscribe to airtime" })
    }
  } catch (error) {
    console.error("error buying airtime:", error)
    return res.status(500).json({ success: false, error: error || "Internal server error" })
  }
}

const queryAirtimeTransaction = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "airtime" })
    if (!transaction) return res.status(404).json({ error: "Airtime transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const payElectricityBills = async (req, res) => {
  const { disco_name, amount, meter_number, meter_type } = req.body
  const userId = req.user._id
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

    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/billpayment`, {
      disco_name,
      amount,
      meter_number,
      meter_type
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    if (response.status === 201) {
      account.wallet_balance -= amount
      account.total_funding += amount
      const paymentRef = "REF_" + nanoid()

      const transaction = await Transaction.create({
        user: userId,
        type: "electricity",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {}
      })

      account.transactions.push(transaction._id)
      await account.save()
      return res.status(200).json(response.data)
    } else {
      return res.status(response.status).json({ error: "Failed to pay electricity bill" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const queryElectricityBill = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "electricity" })
    if (!transaction) return res.status(404).json({ error: "Electricity transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyCableSubscription = async (req, res) => {
  const { cable_name, cable_plan, smart_card_number, amount } = req.body
  const userId = req.user._id
  if (!cable_name || !cable_plan || !smart_card_number || !amount) {
    return res.status(400).json({ error: "Cable name, cable plan, smart card number, amount, and user ID are required" })
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

    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/cablesub`, {
      cable_name,
      cable_plan,
      smart_card_number
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    if (response.status === 201) {
      account.wallet_balance -= amount
      account.total_funding += amount
      const paymentRef = "REF_" + nanoid()

      const transaction = await Transaction.create({
        user: userId,
        type: "cable",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {}
      })

      account.transactions.push(transaction._id)
      await account.save()
      return res.status(200).json(response.data)
    } else {
      return res.status(response.status).json({ error: "Failed to subscribe to cable" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const queryCableSubscription = async (req, res) => {
  const { userId, transactionId } = req.params
  try {
    const transaction = await Transaction.findOne({ _id: transactionId, user: userId, type: "cable" })
    if (!transaction) return res.status(404).json({ error: "Cable transaction not found" })
    return res.status(200).json(transaction)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const validateUIC = async (req, res) => {
  const { smart_card_number, cable_name } = req.params
  if (!smart_card_number || !cable_name) {
    return res.status(400).json({ error: "Smart card number and cable name are required" })
  }
  try {
    const response = await axios.get(`${process.env.EXTERNAL_BACKEND_DOMAIN}/validateiuc?smart_card_number=${smart_card_number}&&cable_name=${cable_name}`, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })
    return res.status(200).json(response.data)
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const validateMeter = async (req, res) => {
  const { meter_number, disco_name, meter_type } = req.params
  if (!meter_number || !disco_name || !meter_type) {
    return res.status(400).json({ error: "Meter number, disco name, and meter type are required" })
  }

  try {
    const response = await axios.get(`${process.env.EXTERNAL_BACKEND_DOMAIN}/validatemeter?meternumber=${meter_number}&disconame=${disco_name}&metertype=${meter_type}`, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    return res.status(200).json(response.data)
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

    const response = await axios.get(`https://vtuafrica.com.ng/portal/api/sms/`, {
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
  validateUIC,
  validateMeter,
  purchaseAirtime2Cash,
  purchaseBulkSms
}
