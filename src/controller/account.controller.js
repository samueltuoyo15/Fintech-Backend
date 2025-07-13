import logger from "../utils/logger.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import { dataPlans } from "../utils/plans.js"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

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

    const selectedPlan = dataPlans.find((p) => p.id === Number(plan))
    logger.info("selected plan", selectedPlan)
    if (!selectedPlan) {
      return res.status(400).json({ error: "Data plan is not available." })
    }

    if (account.wallet_balance < selectedPlan.amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." })
    }

    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/data`, {
      network,
      mobile_number: phone,
      plan,
      ported_number
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    if (response.status === 201) {
      account.wallet_balance -= response.data.plan_amount
      account.total_funding += response.data.plan_amount
      const paymentRef = "REF_" + nanoid()

      const transaction = await Transaction.create({
        user: userId,
        type: "data",
        amount: response.data.plan_amount || 0,
        status: "success",
        reference: paymentRef,
        metadata: {
          status: "successful",
          plan: plan,
          network: response.data.network,
          plan_amount: response.data.plan_amount,
          plan_name: response.data.plan_name,
          date: response.data.create_date,
          ported_number: !!ported_number
        }
      })

      account.transactions.push(transaction._id)
      await account.save()

      logger.info("Data subscription successful:", response.data)
      return res.status(200).json({ success: true, message: `You succesfully purchased data of plan of ${response.data.plan_name}.` })
    } else {
      return res.status(response.status).json({ error: "Failed to subscribe to data" })
    }
  } catch (error) {
    console.error("error buying data:", error)
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
    return res.status(400).json({ error: "Amount to be funded must be greater than 100NGN"})
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
    return res.status(400).json({ error: "Amount to be funded must be greater than 100NGN"})
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
    return res.status(400).json({ error: "Amount to be funded must be greater than 100NGN"})
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

export {
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
  validateMeter
}
