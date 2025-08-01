import mongoose from "mongoose"
import logger from "../utils/logger.js"
import retry from "async-retry"
import dotenv from "dotenv"
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) throw new Error("MONGODB_URI missing in env")

export const connectToDb = async () => {
  try {
    await retry(
      async () => {
        await mongoose.connect(MONGODB_URI)
        logger.info("Connected to MongoDB")
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (error) => logger.warn("Retrying DB connection...", error),
      }
    )
  } catch (error) {
    logger.error("Failed to connect to MongoDB after retries", error)
    process.exit(1)
  }
}

export const disconnectFromDb = async () => {
  if (mongoose.connection.readyState !== 0) { 
    await mongoose.disconnect()
    logger.info("Disconnected from MongoDB")
  }
}