import { rateLimit } from "express-rate-limit"
import RedisStore from "rate-limit-redis"
import { redis } from "../config/redis.config.js"
import logger from "../utils/logger.js"

export const createBasicRateLimiter = (maxRequests, time) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args)
    }),
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

