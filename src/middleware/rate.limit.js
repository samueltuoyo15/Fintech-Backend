import { rateLimit } from "express-rate-limit"
import logger from "../utils/logger.js"

export const createBasicRateLimiter = (maxRequests, time) => {
  return rateLimit({
    max: maxRequests,
    windowMs: time,
    message: "Too many Request, Please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded on ${req.originalUrl} by ${req.ip || req.socket.remoteAddress}`)
    res.status(429).json({ success: false, message: "Too many requests. Try again later"})
  }
  })
}

