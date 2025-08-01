import { Router } from "express"
import { registerUser, verifyUserEmail, loginUser, logoutUser, refreshTokenController } from "../controllers/auth.controller.js"
import validateSignUpInput from "../middlewares/signup.schema.js"
import validateLoginInput from "../middlewares/login.schema.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import { getUserDetails } from "../controllers/user.controller.js"

const router = Router()

router.post("/register", validateSignUpInput, registerUser)
router.get("/me", authenticateUser, getUserDetails)
router.get("/verify-email", verifyUserEmail)
router.post("/login", validateLoginInput, loginUser)
router.post("/logout", authenticateUser, logoutUser)
router.post("/refresh-token", refreshTokenController)

export default router