import { dataPlans } from "../common/utils/plans.js"
import { Router } from "express"
import { redis } from "../common/config/redis.config.js"

const router = Router()

router.get("/data-plans", async (req, res) => {
    const cachedDataPlans = await redis.get(`dataPlans`)
    if(cachedDataPlans){
        return res.status(200).json({ success: true, message: "Data plans retrieved successfully", source: "redis-cache", data: JSON.parse(cachedDataPlans)})
    }
    await redis.set(`dataPlans`, JSON.stringify(dataPlans), "EX", 8000)
    return res.status(200).json({
        message: "List of Data Plans",
        data: dataPlans
    })
})

export default router