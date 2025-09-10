import express from "express"
import helmet from "helmet"
import logger from "./common/utils/logger.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createBasicRateLimiter } from "./middlewares/rate.limit.js"
import errorHandler from "./middlewares/error.handler.js"
import { requestLogger } from "./middlewares/request.logger.js"
import { connectToDb } from "./common/config/db.config.js"
import authRoutes from "./routes/auth.route.js"
import accountRoutes from "./routes/account.route.js"
import paymentRoutes from "./routes/payment.route.js"
import plansRoute from "./routes/plans.route.js"
import "./workers/transaction.worker.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "https://ife-global-jkv6.vercel.app",
  "https://ife-elroiglobal.com"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.set("trust proxy", 1)
app.use(createBasicRateLimiter(100, 15 * 60 * 1000))
app.use(requestLogger)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to the API and server is running on port 5000",
    status: "success"
  })
})
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/subscribe", accountRoutes)
app.use("/api/v1/payment", paymentRoutes)
app.use("/api/v1/plans", plansRoute)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectToDb()
    app.listen(process.env.PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} at ${process.env.PORT}`)
    })
  } catch (err) {
    logger.error("Failed to start server:", err)
    process.exit(1)
  }
}

startServer()

process.on("unhandledRejection", (reason, promise) => {
  disconnectRedis()
  logger.error("unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  logger.error("uncaughtException", error)
  process.exit(1)
})
