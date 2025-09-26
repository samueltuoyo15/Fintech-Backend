import { Queue, Worker } from "bullmq"
import { redis } from "../common/config/redis.config.js"
import axios from "axios"
import logger from "../common/utils/logger.js"

export const emailQueue = new Queue("emailQueue", {
    connection: redis,
})

const worker = new Worker("emailQueue", async (job) => {
    try{
        const { email, verificationLink } = job.data
        const url = `https://fintech-backend-woad.vercel.app/send?email=${encodeURIComponent(email)}&link=${encodeURIComponent(verificationLink)}`

        await axios.get(url)
        logger.info(`Email sent to ${email} for job ${job.id}`)
    } catch(error){
        logger.error("Worker failed to process job:", error)
        throw error
    }
}, { connection: redis, attempts: 5, backoff: 100000, timeout: 300000 })

worker.on("completed", (job) => {
    logger.info(`Job completed: ${job.id}`)
})

worker.on("failed", (job, error) => {
    console.error(`Job failed: ${job.id}`, error)
})

