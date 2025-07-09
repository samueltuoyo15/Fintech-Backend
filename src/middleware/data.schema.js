import joi from "joi"

const buyDataSubcriptioSchema = joi.object({
  network: joi.number().required().messages({
    "any.only": "Network id must be an integer",
    "string.base": "Network must be a integer",
    "any.required": "Network is required"
  }),
  
  phone: joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
    "string.pattern.base": "Mobile number must be a valid Nigerian number",
    "any.required": "Mobile number is required"
  }),

  plan: joi.number().required().messages({
    "number.base": "Plan must be a number (e.g., plan ID)",
    "any.required": "Plan ID is required"
  }),

  ported_number: joi.boolean().required().messages({
    "boolean.base": "Ported_number must be true or false",
    "any.required": "Ported_number is required"
  })
})

const validateDataReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
    return
  }

  const { error } = buyDataSubcriptioSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  })

  if (error) {
    res.status(400).json({
      message: "Validation Error",
      error: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, "")
      }))
    })
    return
  }

  next()
}

export default validateDataReqBody
