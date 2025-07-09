import joi from "joi"

const buyAirtimeValidationSchema = joi.object({
  network: joi.number().required().messages({
    "any.only": "Network must be an id of an integer",
    "string.base": "Network must be a integer",
    "any.required": "Network is required"
  }),

  airtime_type: joi.string().valid("VTU", "Awuf4U", "Share and Sell").required().messages({
    "any.only": "Airtime type must be one of VTU, Awuf4U, or Share and Sell",
    "string.base": "Airtime type must be a string",
    "any.required": "Airtime type is reaquired"
  }),

  phone: joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
    "string.pattern.base": "Mobile number must be a valid Nigerian number",
    "any.required": "Mobile number is required"
  }),

  amount: joi.number().required().messages({
    "number.base": "amount must be a number (e.g., 200, 500, 1000)",
    "any.required": "amount is required"
  }),

  ported_number: joi.boolean().required().messages({
    "boolean.base": "Ported_number must be true or false",
    "any.required": "Ported_number is required"
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
