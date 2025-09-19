import { Router } from "express"
import { dataPlans, cablePlans, electricityPlans, resultCheckerPlans, rechargeCardPinPlans } from "../common/utils/plans.js"
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

router.get("/result-checker-plans", async (_req, res) => {
   const cacheKey = `resultCheckerPlans`
  const cachedResultCheckerPlans = await redis.get(cacheKey)
  if(cacheKey) {
     return res.status(200).json({
      success: true,
      message: "Result checker plans retrieved successfully",
      source: "redis-cache",
      data: JSON.parse(cachedResultCheckerPlans)
    })
  }
  await redis.set(cacheKey, JSON.stringify(resultCheckerPlans), "EX", 86400)
  res.status(200).json({ success: true, message: "Result checker plans retrieved successfully", data: resultCheckerPlans })
})

router.get("/cable-plans", async (_req, res) => {
  const cacheKey = `cablePlans`
  const cachedCablePlans = await redis.get(cacheKey)
  if (cachedCablePlans) {
    return res.status(200).json({
      success: true,
      message: "Cable plans retrieved successfully",
      source: "redis-cache",
      data: JSON.parse(cachedCablePlans)
    })
  }
  await redis.set(cacheKey, JSON.stringify(cablePlans), "EX", 86400)
  res.status(200).json({ success: true, message: "Cable plans retrieved successfully", data: cablePlans })
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
  await redis.set(cacheKey, JSON.stringify(electricityPlans), "EX", 86400)
  res.status(200).json({ success: true, message: "Electricity plans retrieved successfully", data: electricityPlans })
})

router.get("/recharge-card-pin-plans", async (_req, res) => {
  //const cacheKey = `rechargeCardPinPlans`
  // const cachedRechargeCardPinPlans = await redis.get(cacheKey)
  // if (cachedRechargeCardPinPlans) {
  //   return res.status(200).json({
  //     success: true,
  //     message: "Recharge card pin plans retrieved successfully",
  //     source: "redis-cache",
  //     data: JSON.parse(cachedRechargeCardPinPlans)
  //   })
  // }
  //await redis.set(cacheKey, JSON.stringify(rechargeCardPinPlans), "EX", 86400)
  res.status(200).json({ success: true, message: "Recharge card pin plans retrieved successfully", data: rechargeCardPinPlans })
})

export default router
