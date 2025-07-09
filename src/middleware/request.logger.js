import logger from "../utils/logger.js"

export const requestLogger = (req, res, next) => {
  const timestamps = new Date().toISOString()
  const method = req.method
  const url = req.url
  const userAgent = req.get("User-Agent")
  
  logger.info(`[${timestamps}] ${method} ${url} - User-Agent: ${userAgent}`)
  next()
}
