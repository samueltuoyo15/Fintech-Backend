import logger from "../common/utils/logger.js"
import User from "../models/user.model.js"
import Account from "../models/account.model.js"
import RefreshToken from "../models/refresh.token.model.js"
import sendEmailVerification from "../services/email.service.js"
import { generateAccessToken, generateRefreshToken, generateMailToken } from "../common/utils/generate.token.js"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
  logger.info("Registering new user endpoint hit!")
  const { full_name, username, email, phone, address, referral_username, password } = req.body

  if (!full_name || !username || !email || !phone || !address || !password) {
    logger.error("All fields are required")
    return res.status(422).json({ success: false, message: "All fields are required" })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      logger.warn("User already exists:", existingUser)
      return res.status(409).json({ success: false, message: "User already exists" })
    }

    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "Username already taken" })
    }

    const newUser = await User.create({
      full_name,
      username,
      email,
      phone,
      address,
      referral_username,
      password
    })

    const referralLink = `https://ife-elroiglobal.com/signup?referral=${username}`
    const newAccount = await Account.create({ user: newUser._id, referral_link: referralLink })
    newUser.account = newAccount._id
    await newUser.save()

    const emailToken = generateMailToken(newUser._id, newUser.email)
    const verificationLink = `${process.env.FRONTEND_DOMAIN}/login?token=${emailToken}`
    await sendEmailVerification(newUser.email, verificationLink)

    if (referral_username?.trim() && referral_username.trim() !== username) {
      const referrer = await User.findOne({ username: referral_username.trim() })
      if (referrer) {
        const referrerAccount = await Account.findOne({ user: referrer._id })
        if (referrerAccount) {
          referrerAccount.total_referral += 1
          referrerAccount.total_referral_bonus += 200
          referrerAccount.wallet_balance += 200
          await referrerAccount.save()
        }
      }
    }

    logger.debug("New user created successfully")
    return res.status(201).json({ success: true, message: "User registered successfully. Kindly check you email and verify your account" })
  } catch (error) {
    console.error("Error registering user:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const verifyUserEmail = async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ success: false, message: "Missing token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await User.findById(decoded._id)

    if (!user) {
      logger.warn("Verification failed: user not found")
      return res.status(404).json({ success: false, message: "Invalid verification link" })
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: "User already verified" })
    }

    user.is_verified = true
    await user.save()

    logger.info("User email verified successfully")

    return res.status(200).json({ success: true, message: "Email verified successfully. You can now login." })
  } catch (error) {
    logger.error("Verification error", error)
    return res.status(400).json({ success: false, message: "Invalid or expired token" })
  }
}

const loginUser = async (req, res) => {
  logger.info("Login user endpoint hit!")
  const { username, password } = req.body

  if (!username || !password) {
    logger.error("Username and password are required")
    return res.status(422).json({ success: false, message: "Username and password are required" })
  }

  try {
    const user = await User.findOne({ username }).select("+password").populate("account")
    if (!user) {
      logger.error("User not found:", username)
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if(!user.is_verified){
      logger.warn("user account is not verified yet")
      return res.status(401).json({ success: false, message: "Account not verified yet. Kindly check you email and verify your account"})
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      logger.error("Invalid password for user:", username)
      return res.status(401).json({ success: false, message: "Invalid password" })
    }

    const userId = user._id

    await RefreshToken.deleteMany({ user: userId })

    const accessToken = generateAccessToken(userId, user.username)
    const refreshToken = generateRefreshToken(userId, user.username)

    await RefreshToken.create({
      user: userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    user.last_login = new Date()
    await user.save()

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    logger.debug("User logged in successfully:", username)

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken
    })
  } catch (error) {
    logger.error("Failed to log in user:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const logoutUser = async (req, res) => {
  const userId = req.user._id
  try {
    await RefreshToken.deleteMany({ user: userId })
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    logger.info("User logged out successfully")
    return res.status(200).json({ success: true, message: "Logout successful" })
  } catch (error) {
    logger.error("Failed to log out user:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      logger.warn("Missing refresh token")
      return res.status(400).json({ success: false, error: "Missing refresh token" })
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.error("Invalid or expired refresh token. Kindly just Login to your account again")
      return res.status(401).json({ success: false, error: "Invalid or expired refresh token. Kindly just Login to your account again" })
    }

    const user = await User.findById(storedToken.user)

    if (!user) {
      logger.warn("User not found")
      return res.status(401).json({ success: false, message: "User not found" })
    }

    await RefreshToken.deleteMany({ user: storedToken.user })

    const newAccessToken = generateAccessToken(user._id, user.username)
    const newRefreshToken = generateRefreshToken(user._id, user.username)

    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    })
  } catch (error) {
    logger.error("Error refreshing token:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export { registerUser, verifyUserEmail, loginUser, logoutUser, refreshTokenController }
