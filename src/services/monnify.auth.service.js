import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

export const getMonnifyToken = async () => {
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")
    
    try {
        const res = await axios.post("https://sandbox.monnify.com/api/v1/auth/login", null, {
        headers: {
            Authorization: `Basic ${auth}`
        }
        })
        return res.data.responseBody.accessToken
    } catch (error) {
        console.error("Error fetching Monnify token:", error)
        throw new Error("Failed to fetch Monnify token")
    }
}