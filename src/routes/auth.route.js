import { Router } from "express"
import { registerUser, verifyUserEmail, loginUser, logoutUser, refreshTokenController } from "../controller/auth.controller.js"
import validateSignUpInput from "../middleware/signup.schema.js"
import validateLoginInput from "../middleware/login.schema.js"
import { authenticateUser } from "../middleware/auth.middleware.js"
import { getUserDetails } from "../controller/user.controller.js"

const router = Router()

router.post("/register", validateSignUpInput, registerUser)
router.get("/me", authenticateUser, getUserDetails)
router.get("/verify-email", verifyUserEmail)
router.post("/login", validateLoginInput, loginUser)
router.post("/logout", authenticateUser, logoutUser)
router.post("/refresh-token", refreshTokenController)

export default router