import { dataPlans } from "../common/utils/plans.js"
import { Router } from "express"
import { redis } from "../common/config/redis.config.js"

const router = Router()

router.get("/data-plans", async (req, res) => {
    const { network } = req.query

    const cacheKey = network ? `dataPlans:${network}` : `dataPlans`
    const cachedDataPlans = await redis.get(cacheKey)
    if (cachedDataPlans) {
        return res.status(200).json({
            success: true,
            message: "Data plans retrieved successfully",
            source: "redis-cache",
            data: JSON.parse(cachedDataPlans)
        })
    }

    let result = dataPlans
    if (network) {
        const networkServiceMap = {
            MTN: ["MTNGIFT", "MTN SME", "MTN BIZ"],
            AIRTEL: ["AIRTELSME", "AIRTELGIFT", "AIRTELCG"],
            GLO: ["GLOSME", "GLOGIFT", "GLOCG"],
            "9MOBILE": ["9MOBILESME", "9MOBILEGIFT", "9MOBILECG"],
        }

        result = dataPlans.filter(plan =>
            networkServiceMap[network]?.some(prefix =>
                plan.Service?.toUpperCase().trim().startsWith(prefix.toUpperCase().trim())
            )
        )
    }

    await redis.set(cacheKey, JSON.stringify(result), "EX", 8000)

    return res.status(200).json({
        success: true,
        message: "List of Data Plans",
        data: result
    })
})

export default router