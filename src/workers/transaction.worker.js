import { Queue, Worker } from "bullmq"
import { redis } from "../config/redis.config.js"
import Account from "../models/account.model.js"
import Transaction from "../models/transaction.model.js"
import logger from "../utils/logger.js"

export const transactionQueue = new Queue("transactionQueue", {
    connection: redis,
})

const worker = new Worker("transactionQueue", async (job) => {
    try{
        const { reference, amountPaid, eventData } = job.data
        const transaction = await Transaction.findOne({ reference }).lean()
        if(!transaction || transaction.status === "success") return 

        const account = await Account.findOne({ user: transaction.user }).lean()
        if(!account) return 

        account.wallet_balance += amountPaid
        account.total_funding += amountPaid
        await account.save()

        transaction.status = "success"
        transaction.metadata = {
            ...transaction.metadata,
            monnifyPaymentDetails: eventData,
            dateVerified: new Date().toISOString()
        }
        await transaction.save()

       logger.info(`funded ${amountPaid} to wallet, reference: ${reference}`)
    } catch(error){
        logger.error("Worker failed to process job:", error)
        throw error 
    } 
}, { connection: redis, attempts: 3, backoff: 100000, timeout: 300000 })

worker.on("completed", (job) => {
    logger.info(`Job completed: ${job.id}`)
})

worker.on("failed", (job, error) => {
    logger.error(`Job completed: ${job.id}`, error)
})