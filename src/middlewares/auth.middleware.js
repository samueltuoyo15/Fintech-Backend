  import User from "../models/user.model.js"
  import jwt from "jsonwebtoken"
  import dotenv from "dotenv"
  dotenv.config()

  export const authenticateUser = (req, res, next) => {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]
    const refreshToken = req.cookies.accessToken 
    if (!accessToken || typeof accessToken !== "string") {
      res.status(401).json({ message: "Unauthorized. No token provided." })
      return 
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY)
      req.user = decoded 
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: "Invalid access token" })
    }
  }