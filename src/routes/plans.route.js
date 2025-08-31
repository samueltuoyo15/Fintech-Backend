import { Router } from "express"
import { dataPlans, cablePlans, electricityPlans } from "../common/utils/plans.js"

const router = Router()

router.get("/data-plans", (req, res) => {
  res.status(200).json(dataPlans)
})

router.get("/cable-plans", (req, res) => {
  res.status(200).json(cablePlans)
})

router.get("/electricity-plans", (req, res) => {
  res.status(200).json(electricityPlans)
})


export default router