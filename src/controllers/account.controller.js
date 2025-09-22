import logger from "../common/utils/logger.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import { nanoid } from "nanoid"
import axios from "axios"
import { redis } from "../common/config/redis.config.js"
import { dataPlans, resultCheckerPlans, rechargeCardPinPlans } from "../common/utils/plans.js"
import dotenv from "dotenv"
dotenv.config()

const getAllReferrals = async (req, res) => {
  const userId = req.user._id
  const { page = 1, limit = 10, search = "" } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)
  const cacheKey = `referrals:${userId}:page=${page}:limit=${limit}:search=${search}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) return res.status(200).json({ success: true, referrals: JSON.parse(cached), total: JSON.parse(cached).length, cached: true })

    const searchQuery = search ? { "metadata.referee_username": { $regex: search, $options: "i" } } : {}

    const referrals = await Transaction.find({ user: userId, type: "referral", ...searchQuery }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean()
    const total = await Transaction.countDocuments({ user: userId, type: "referral", ...searchQuery })

    if (!referrals.length) return res.status(404).json({ success: false, message: "No referrals found" })

    const mappedReferrals = referrals.map(r => ({
      username: r.metadata?.referee_username || "N/A",
      email: r.metadata?.referree_email || "N/A",
      full_name: r.metadata?.referre_full_name || "N/A"
    }))

    await redis.set(cacheKey, JSON.stringify(mappedReferrals), "EX", 300)

    return res.status(200).json({ success: true, referrals: mappedReferrals, total, cached: false })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}


const getAllTransactions = async (req, res) => {
  const userId = req.user._id
  const { page = 1, limit = 50, type } = req.query
  const skip = (parseInt(page) -1) * parseInt(limit)
  const cacheKey = `transactions:${userId}:page=${page}:limit=${limit}:type=${type || "All"}`
  
  try {
    const cached = await redis.get(cacheKey)
    if(cached) return res.status(200).json({ success: true, transactions: JSON.parse(cached), cached: true })
    
    const query = { user: userId }
    if (type && type !== "All") query.type = type

    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean()
    if (transactions.length === 0) return res.status(404).json({ success: false, message: "Transactions not found" })

    await redis.set(cacheKey, JSON.stringify(transactions), "EX", 120)
    return res.status(200).json({ success: true, transactions, cached: false })
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const buyDataSubcription = async (req, res) => {
  logger.info("Received request for data subscription")
  const paymentRef = "REF_" + nanoid()
  const { phone, network_id, id, Ported_number } = req.body
  const userId = req.user._id

  if (!phone || !network_id || !id || Ported_number == null) {
    return res.status(400).json({ error: "phone, network_id, id, ported_number are required" })
  }



  try {
    const selectedPlan = dataPlans.find(plan => plan.id === id && plan.network_id === network_id)
    if (!selectedPlan) {
      return res.status(404).json({ error: "Data plan not found" })
    }
    const account = await Account.findOne({ user: userId })
    if (!account) return res.status(404).json({ error: "Account not found" })


    if (account.wallet_balance < selectedPlan.amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" })
    }
      console.log({
    phone,
    network_id,
    id,
    Ported_number
  })
    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/data/`, {
      mobile_number: phone,
      network: network_id,
      plan: id,
      Ported_number: Ported_number
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })

    if (response.data.error) {
        console.error("Provider Error:", response.data.error)
        return res.status(400).json({ success: false, error: response.data.error })
    }    

    console.log(response)
    account.wallet_balance -= selectedPlan.amount
    account.total_spent += selectedPlan.amount

    const transaction = await Transaction.create({
      user: userId,
      type: "data",
      amount: selectedPlan.amount,
      status: "success",
      reference: paymentRef,
      metadata: {
        status: "successful",
        plan: `${response.data.plan_network} - ${response.data.plan_name}`,
        plan_amount: selectedPlan.amount,
        plan_name: response.data.plan_name,
        date: response.data.create_date,
        ported_number: Ported_number,
      }
    })

    account.transactions.push(transaction._id)
    await account.save()
 
    return res.status(201).json({
      success: true,
      message: `You successfully purchased data plan of ${response.data.plan_network} - ${response.data.plan_name} valid for: ${selectedPlan.validity}`
    })
  
  } catch (err) {
    console.error("error buying data:", err.response ? err.response.data : err.message)
    await Transaction.create({
      user: userId,
      type: "data",
      status: "failed",
      amount: 0,
      reference: paymentRef,
      metadata: {
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: "internal server error" })
  }
}

const buyAirtimeSubscription = async (req, res) => {
  logger.info("Received request for airtime subscription")
  const { network_id, phone, amount } = req.body
  const userId = req.user._id
  
   const paymentRef = "REF_" + nanoid()

  if (!network_id || !phone || !amount) {
    return res.status(400).json({ error: "Network Id, phone, and amount are required" })
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

    
     const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/topup/`, {
      mobile_number: phone,
      network: network_id,
      amount,
      Ported_number: true,
      airtime_type: "VTU"
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })
    console.log("Airtime response", response.data)
      account.wallet_balance -= amount
      account.total_spent += amount

      const transaction = await Transaction.create({
        user: userId,
        type: "airtime",
        amount: amount,
        status: "success",
        reference: paymentRef,
        metadata: {
          network: response.data.plan_network,
          date: response.data.create_date
        }
      })

      account.transactions.push(transaction._id)
      await account.save()

      logger.info("airtime sent successfully", response.data)
      return res.status(200).json({ success: true, message: "Airtime sent successfully"})
  } catch (error) {
    console.error("error buying airtime:", error?.response.error || error?.message)
     await Transaction.create({
      user: userId,
      type: "airtime",
      status: "failed",
      amount,
      reference: paymentRef,
      metadata: {
        network_id,
        phone, 
        date: Date.now()
      }
    })
    return res.status(500).json({ success: false, error: error || "Internal server error" })
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
      return res.status(200).json({ success: true, message: "success"})
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

      if (account.wallet_balance < 50) {
      return res.status(400).json({ success: false, error: `Insufficient balance. Required: ${totalCharge}, Available: ${account.wallet_balance}` })
    }

 
    console.log(req.body)
     const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/sendsms/`, {
      sender: "IFE_GLOBALS",
      recetipient: phone_numbers,
      message,
      DND: true,
 
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })
    
    console.log(response)

    account.wallet_balance -= 4
    account.total_spent += 4
    const transaction = await Transaction.create({
      user: userId,
      type: "bulk_sms",
      amount: -4,
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
    return res.status(200).json({ success: true, message: "Message sent successfully to all the provided numbers", charge: 4, })
  } catch (error){
    console.error("failed to send bulk sms:", error)
  
    return res.status(500).json({ success: false, error: error.response.data })
  }
}

const resultCheck = async (req, res) => {
  logger.info("Result check endpoint hit")
  try {
    const { quantity, exam_name } = req.body
    const userId = req.user._id

    if (!quantity || !exam_name) {
      return res.status(400).json({ success: false, error: "Quantity, and exam name are required" })
    }
      if(quantity < 1){
    return res.status(400).json({ error: "Quantity must be at least 1"})
  }

     const selectedPlan = resultCheckerPlans.find(plan => plan.exam_name === exam_name)
    if (!selectedPlan) {
      return res.status(404).json({ error: "Plan not found" })
    }
      const totalPrice = selectedPlan.price * quantity
      console.log("Total price:", totalPrice)
    const account = await Account.findOne({ user: userId }) 
    if(!account) return res.status(404).json({ success: false, error: "Account not found" })

    if (account.wallet_balance < totalPrice) {
      return res.status(400).json({ success: false, error: `Insufficient wallet balance: ${account.wallet_balance.toLocaleString("en-NG", { style: "currency", currency: "NGN"})}` })
    }
  
    const response = await axios.post(`${process.env.EXTERNAL_BACKEND_DOMAIN}/epin/`, {
      exam_name,
      quantity,
    }, {
      headers: {
        Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`
      }
    })
    console.log(response.data.error)

    account.wallet_balance -= totalPrice
    account.total_spent += totalPrice
    const transaction = await Transaction.create({
      user: userId,
      type: "result-checker",
      amount: -totalPrice,
      status: "success",
      reference: `RESULT_CHECKER_${nanoid()}`,
      metadata: {
        exam_name,
        date: Date.now(),
        //pins: response.data.description.pins,
        quantity: quantity
      }
    })
    account.transactions.push(transaction._id)
    await account.save()
    return res.status(200).json({ success: true, message: "Result checker pins generated successfully", charge: totalPrice })
  } catch (error){
    if(error?.response?.data) {
      console.error("Failed to send epin details", error?.response?.data)
      return res.status(503).json({ success: false, error: "Service currently unavailable, contact the admin to fund main account" })
    }
    return res.status(500).json({ success: false, error: "internal server error" })
  }
}

const rechargeCardPins = async (req, res) => {
  logger.info("recharge check endpoint hit")
  try {
    const { plan_id, quantity, network_id } = req.body
    console.log("request received", req.body)
    const userId = req.user._id

    if (!quantity || !network_id || !plan_id) {
      return res.status(400).json({ success: false, error: "Quantity, network, and plan are required" })
    }

    if (quantity < 1 || quantity > 200) {
      return res.status(400).json({ error: "Quantity must be between 1 and 200" })
    }

    const selectedPlan = rechargeCardPinPlans.find(plan => 
      plan.network_id === network_id && plan.plan_id === plan_id
    )
    
    if (!selectedPlan) {
      return res.status(404).json({ error: "Plan not found" })
    }

    const totalPrice = selectedPlan.amount * quantity

    const account = await Account.findOne({ user: userId })
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" })
    }

    if (account.wallet_balance < totalPrice) {
      return res.status(400).json({ success: false, error: "Insufficient wallet balance" })
    }

    const response = await axios.post(
      `${process.env.EXTERNAL_BACKEND_DOMAIN}/rechargepin/`,
      {
        network_id,
        network_amount: selectedPlan.plan_id,
        quantity,
        name_on_card: "User Purchase"
      },
      {
        headers: {
          Authorization: `Token ${process.env.EXTERNAL_BACKEND_API_KEY}`  
        }
      }
    )

    console.log("External API response:", response.data)

    // account.wallet_balance -= totalPrice
    // account.total_spent += totalPrice

    // const transaction = await Transaction.create({
    //   user: userId,
    //   type: "recharge-card-pin",
    //   amount: -totalPrice,
    //   status: "success",
    //   reference: `RECHARGE_CARD_PIN_${Date.now()}`,
    //   metadata: {
    //     network: selectedPlan.network_name,
    //     date: Date.now(),
    //     quantity,
    //     // pins: response.data.pins || response.data.description?.pins,
    //     // external_reference: response.data.ReferenceID
    //   }
    // })
    
    // account.transactions.push(transaction._id)
    // await account.save()

    return res.status(200).json({
      success: true,
      message: "Recharge card pins purchased successfully",
      data: {
        // pins: response.data.pins || response.data.description?.pins,
        // ReferenceID: response.data.ReferenceID,
        amount_charged: totalPrice
      }
    })
  } catch (error) {
    console.error("Recharge card pin error:", error)
    
    if (error?.response?.data) {
      console.error("External API failed", error.response.data)
      return res.status(503).json({
        success: false,
        error: "Service currently unavailable, contact the admin to fund main account"
      })
    }
    
    console.error(error)
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    })
  }
}

export {
  getAllTransactions,
  getAllReferrals,
  buyDataSubcription,
  buyAirtimeSubscription,
  payElectricityBills,
  buyCableSubscription,
  purchaseBulkSms,
  resultCheck,
  rechargeCardPins,
  validateMeter,
  validateUIC
}
