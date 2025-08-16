import { cablePlans, resultCheckerPlans, dataPlans, electricityPlanList } from "../common/utils/plans.js"
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

router.get("/cable-plans", async (req, res) => {
    const { variation } = req.query
    const cacheKey = variation ? `cablePlans:${variation}` : `cablePlans`
    const cachedCablePlans = await redis.get(cacheKey)
    if (cachedCablePlans) {
        return res.status(200).json({
            success: true,
            message: "Cable plans retrieved successfully",
            source: "redis-cache",
            data: JSON.parse(cachedCablePlans)
        })
    }

    let result = cablePlans
    if (variation) {
       const cableServiceMap = {
        DSTV: [
            { name: "dstv_padi" },
            { name: "dstv_yanga" },
            { name: "dstv_confam" },
            { name: "dstv_compact" },
            { name: "dstv_compact_plus" },
            { name: "dstv_premium" },
            { name: "dstv_premium_asia" },
            { name: "dstv_premium_french" },
            { name: "dstv_asia_addon" },
            { name: "dstv_french_addon" }
        ],
        GOTV: [
            { name: "gotv_smallie" },
            { name: "gotv_jinja" },
            { name: "gotv_jolli" },
            { name: "gotv_max" },
            { name: "gotv_supa" }
        ],
        STARTIMES: [
            { name: "startimes_smart_weekly" },
            { name: "startimes_smart_monthly" },
            { name: "startimes_super_weekly" },
            { name: "startimes_super_monthly" },
            { name: "startimes_nova_monthly" },
            { name: "startimes_nova_weekly" },
            { name: "startimes_classic_monthly" },
            { name: "startimes_classic_weekly" },
            { name: "startimes_basic_monthly" },
            { name: "startimes_basic_weekly" }
        ]
        }

        
        result = cablePlans.filter(plan =>
            cableServiceMap[variation]?.some(prefix =>
                plan.name?.toUpperCase().trim().startsWith(prefix.name.toUpperCase().trim())
            )
        )
    }

    await redis.set(cacheKey, JSON.stringify(result), "EX", 10)

    return res.status(200).json({
        success: true,
        message: "List of Data Plans",
        data: result
    })
})

router.get("/electricity-plans", async (_req, res) => {
    const cacheKey = `electricityPlans`
    const cachedElectricityPlans = await redis.get(cacheKey)
    if (cachedElectricityPlans) {
        return res.status(200).json({
            success: true,
            message: "Electricity plans retrieved successfully",
            source: "redis-cache",
            data: JSON.parse(cachedElectricityPlans)
        })
    }
    const result = electricityPlanList
    await redis.set(cacheKey, JSON.stringify(result), "EX", 8000)

    return res.status(200).json({
        success: true,
        source: "live-data",
        message: "List of Electricity Plans",
        data: result    
    })
})


router.get("/result-checker-plans", async (_req, res) => {
    const cacheKey = `resultCheckerPlans`
    const cachedResultCheckerPlans = await redis.get(cacheKey)
    if (cachedResultCheckerPlans) {
        return res.status(200).json({
            success: true,
            message: "Result Checker plans retrieved successfully",
            source: "redis-cache",
            data: JSON.parse(cachedResultCheckerPlans)
        })
    }
    const result = resultCheckerPlans
    await redis.set(cacheKey, JSON.stringify(result), "EX", 2)

    return res.status(200).json({
        success: true,
        source: "live-data",
        message: "List of Electricity Plans",
        data: result    
    })
})

export default router