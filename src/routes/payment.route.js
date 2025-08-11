import { Router } from "express"
import { fundAccount,  verifyTransactionWithWebhook} from "../controllers/payment.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
const router = Router()

router.post("/fund-wallet", authenticateUser, fundAccount)
router.post("/verify-payment", verifyTransactionWithWebhook)

export default router