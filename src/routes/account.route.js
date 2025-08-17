import { Router } from "express"
import { getAllTransactions, buyDataSubcription, buyAirtimeSubscription, payElectricityBills, buyCableSubscription, purchaseBulkSms, resultCheck, getAllReferrals, rechargeCardPins } from "../controllers/account.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import validateDataReqBody from "../middlewares/data.schema.js"
import validateAirtimeReqBody from "../middlewares/airtime.schema.js"
import validateElectricityReqBody from "../middlewares/electricity.schema.js"
import validateCableReqBody from "../middlewares/cable.schema.js"
import { createBasicRateLimiter } from "../middlewares/rate.limit.js"

const router = Router()
router.get("/transactions", authenticateUser, getAllTransactions)
router.get("/referrals", authenticateUser, getAllReferrals)
router.post("/data", authenticateUser, validateDataReqBody, buyDataSubcription)
router.post("/airtime", authenticateUser, validateAirtimeReqBody, buyAirtimeSubscription)
router.post("/electricity", authenticateUser, validateElectricityReqBody, payElectricityBills)
router.post("/recharge-card-pins", authenticateUser, rechargeCardPins)
router.post("/bulk-sms", authenticateUser, purchaseBulkSms)
router.post("/buy-result-checker", authenticateUser, resultCheck)
router.post("/cable", authenticateUser, validateCableReqBody, buyCableSubscription)


export default router