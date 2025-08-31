import Joi from "joi"

const buyAirtimeValidationSchema = Joi.object({
  network_id: Joi.number().integer().valid(1, 2, 3, 4, 5).required().messages({
      "number.base": "network ID must be a number",
      "any.required": "network ID is required"
    }),

  phone: Joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
    "string.pattern.base": "Mobile number must be a valid Nigerian number",
    "any.required": "Mobile number is required"
  }),

  amount: Joi.number().min(50).required().messages({
    "number.base": "amount must be a number (e.g., 200, 500, 1000)",
    "any.required": "amount is required",
    "number.min": "amount must be at least 50NGN"
  })
})

const validateAirtimeReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
    return
  }

  const { error } = buyAirtimeValidationSchema.validate(req.body, {
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

export default validateAirtimeReqBody
