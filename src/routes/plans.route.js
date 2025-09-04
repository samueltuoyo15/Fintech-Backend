import { Router } from "express"
import { dataPlans, cablePlans, electricityPlans } from "../common/utils/plans.js"
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
      MTN: ["MTN"],
      AIRTEL: ["AIRTEL"],
      GLO: ["GLO"],
      "9MOBILE": ["9MOBILE"]
    }
    result = dataPlans.filter(plan =>
      networkServiceMap[network]?.some(prefix =>
        plan.network?.toUpperCase().trim().startsWith(prefix.toUpperCase().trim())
      )
    )
  }
  await redis.set(cacheKey, JSON.stringify(result), "EX", 60)
  return res.status(200).json({
    success: true,
    message: "List of Data Plans",
    data: result
  })
})

router.get("/cable-plans", (req, res) => {
  res.status(200).json(cablePlans)
})

router.get("/electricity-plans", (req, res) => {
  res.status(200).json(electricityPlans)
})

export default router
