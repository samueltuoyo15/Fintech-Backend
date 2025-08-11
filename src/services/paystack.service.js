import axios from "axios"
import { paystackConfig } from "./paystack.auth.js"
import  logger from "../common/utils/logger.js"

const initializeTransaction = async (data) => {
    logger.info("Initializing a transaction")
    if(!data) throw new Error("Customer info is required")
        try {
            const response = await axios.post(`${paystackConfig.baseUrl}/transaction/initialize`, {
                email: data.customerEmail,
                amount: data.amount * 100,
                reference: data.paymentReference,
                callback_url: data.redirectUrl,
                metadata: {
                    description: data.paymentDescription,
                    custom_fields: []
                }
            }, {
                headers: {
                    Authorization: `Bearer ${paystackConfig.secretKey}`, 
                }
            })
            logger.info("Paystack response:", response.data)
            return response.data
        } catch(error) {
            logger.error("Error initializing transaction:", error.response.data || error.response.message)
            throw new Error("Failed to initialize transaction")
        } 

}

export default initializeTransaction