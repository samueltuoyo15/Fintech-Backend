import { Router } from "express"
import { fundAccount,  verifyTransaction} from "../controllers/payment.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
const router = Router()

router.post("/fund-wallet", authenticateUser, fundAccount)
router.post("/verify-payment", verifyTransaction)

export default router