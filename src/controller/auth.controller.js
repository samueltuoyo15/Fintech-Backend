import logger from "../utils/logger.js";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import RefreshToken from "../models/refresh.token.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generate.token.js";

const registerUser = async (req, res) => {
  logger.info("Registering new user endpoint hit!");
  const { full_name, username, email, phone, address, referral_username, password } = req.body;

  if (!full_name || !username || !email || !phone || !address || !password) {
    logger.error("All fields are required");
    return res.status(422).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn("User already exists:", existingUser);
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const newUser = await User.create({
      full_name,
      username,
      email,
      phone,
      address,
      referral_username,
      password
    });

    const newAccount = await Account.create({ user: newUser._id });
    newUser.account = newAccount._id;
    await newUser.save();


    if (referral_username?.trim()) {
      const referrer = await User.findOne({ username: referral_username.trim() });
      if (referrer) {
        const referrerAccount = await Account.findOne({ user: referrer._id });
        if (referrerAccount) {
          referrerAccount.total_referral += 1;
          referrerAccount.total_referral_bonus += 500;
          referrerAccount.wallet_balance += 500;
          await referrerAccount.save();
        }
      }
    }

    logger.debug("New user created successfully");
    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    logger.error("Error registering user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    await RefreshToken.deleteMany({ user: userId });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    logger.info("User logged out successfully");
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    logger.error("Failed to log out user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { registerUser, loginUser, logoutUser };
