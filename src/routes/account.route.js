import { Router } from "express"
import { getAllTransactions, buyDataSubcription, buyAirtimeSubscription, getAllDataTransactions, queryDataTransaction, queryAirtimeTransaction, payElectricityBills, queryElectricityBill, buyCableSubscription, queryCableSubscription, validateUIC, validateMeter, purchaseAirtime2Cash } from "../controllers/account.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import validateDataReqBody from "../middlewares/data.schema.js"
import validateAirtimeReqBody from "../middlewares/airtime.schema.js"
import validateElectricityReqBody from "../middlewares/electricity.schema.js"
import validateAirtime2CashReqBody from "../middlewares/airtime2cash.schema.js"
import validateCableReqBody from "../middlewares/cable.schema.js"
import { createBasicRateLimiter } from "../middlewares/rate.limit.js"

const router = Router()
router.get("/transactions", authenticateUser, getAllTransactions)
router.post("/data", authenticateUser, validateDataReqBody, buyDataSubcription)
router.post("/airtime", authenticateUser, validateAirtimeReqBody, buyAirtimeSubscription)
router.get("/data-history", authenticateUser, getAllDataTransactions)
router.get("/query-data/:transactionId", authenticateUser, queryDataTransaction)
router.get("/query-airtime/:transactionId", authenticateUser, queryAirtimeTransaction)
router.post("/electricity", authenticateUser, validateElectricityReqBody, payElectricityBills)
router.post("/airtime-2-cash", authenticateUser, createBasicRateLimiter(100, 300000), validateAirtime2CashReqBody, purchaseAirtime2Cash)
router.get("/query-electricity-bill", authenticateUser, queryElectricityBill)
router.post("/cable", authenticateUser, validateCableReqBody, buyCableSubscription)
router.get("/query-electricity-bill", authenticateUser, queryCableSubscription)
router.get("/validate-uic", authenticateUser, validateUIC)
router.get("/validate-meter", authenticateUser, validateMeter)

export default router