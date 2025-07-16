import { Router } from "express"
import { getAllTransactions, buyDataSubcription, buyAirtimeSubscription, getAllDataTransactions, queryDataTransaction, queryAirtimeTransaction, payElectricityBills, queryElectricityBill, buyCableSubscription, queryCableSubscription, validateUIC, validateMeter } from "../controller/account.controller.js"
import { authenticateUser } from "../middleware/auth.middleware.js"
import validateDataReqBody from "../middleware/data.schema.js"
import validateAirtimeReqBody from "../middleware/airtime.schema.js"
import validateElectricityReqBody from "../middleware/electricity.schema.js"
import validateCableReqBody from "../middleware/cable.schema.js"

const router = Router()
router.get("/transactions", authenticateUser, getAllTransactions)
router.post("/data", authenticateUser, validateDataReqBody, buyDataSubcription)
router.post("/airtime", authenticateUser, validateAirtimeReqBody, buyAirtimeSubscription)
router.get("/data-history", authenticateUser, getAllDataTransactions)
router.get("/query-data/:transactionId", authenticateUser, queryDataTransaction)
router.get("/query-airtime/:transactionId", authenticateUser, queryAirtimeTransaction)
router.post("/electricity", authenticateUser, validateElectricityReqBody, payElectricityBills)
router.get("/query-electricity-bill", authenticateUser, queryElectricityBill)
router.post("/cable", authenticateUser, validateCableReqBody, buyCableSubscription)
router.get("/query-electricity-bill", authenticateUser, queryCableSubscription)
router.get("/validate-uic", authenticateUser, validateUIC)
router.get("/validate-meter", authenticateUser, validateMeter)

export default router