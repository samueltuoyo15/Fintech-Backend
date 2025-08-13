import joi from "joi"

const payElectricityBillsSchema = joi.object({
  disco_name: joi.string().valid("aba-electric", "abuja-electric", "benin-electric", "eko-electric", "enugu-electric", "ibadan-electric", "ikeja-electric", "jos-electric", "kaduna-electric", "kano-electric", "portharcourt-electric", "yola-electric").required().messages({
    "string.base": "Disco name must be a string",
    "any.required": "Disco name is required"
  }),

  meter_type: joi.string().valid("prepaid", "postpaid").required().messages({
    "any.only": "Meter type must be one of prepaid or postpaid",
    "string.base": "Meter type must be a string",
    "any.required": "Meter type is required"
  }),

  meter_number: joi.number().required().messages({
    "number.base": "Meter number must be a number (e.g., 123456789)",
    "any.required": "Meter number is required"
  }),

  amount: joi.number().min(100).required().messages({
    "number.base": "Amount must be a number (e.g., 100)",
    "number.min": "Amount must be at least 100 NGN",
    "any.required": "Amount is required"
  })
})

const validateElectricityReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
  }

  const { error } = payElectricityBillsSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  })

  if (error) {
    return res.status(400).json({
      message: "Validation Error",
      error: error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, "")
      }))
    })
  }

  next()
}

export default validateElectricityReqBody
