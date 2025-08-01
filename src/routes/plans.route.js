import { Router } from "express"
import { dataPlans, networkList, cableList, cablePlanList, discoList } from "../common/utils/plans.js"

const router = Router()

router.get("/data-plans", (req, res) => {
  res.status(200).json(dataPlans)
})

router.get("/networks", (req, res) => {
  res.status(200).json(networkList)
})

router.get("/cables", (req, res) => {
  res.status(200).json(cableList)
})

router.get("/cable-plans", (req, res) => {
  res.status(200).json(cablePlanList)
})

router.get("/discos", (req, res) => {
  res.status(200).json(discoList)
})

export default router
