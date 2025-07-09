import axios from "axios"
import { getMonnifyToken } from "./monnify.auth.service.js"


const initializeTransaction = async (data) => {
  if(!data) throw new Error("Customer info is required")
 const token = await getMonnifyToken()
 try {
    const res = await axios.post("https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction", data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return res.data
  } catch (error) {
    console.error("Error initializing transaction:", error.response ? error.response.data : error.message)
    throw new Error("Failed to initialize transaction")
 }
}

export { initializeTransaction }