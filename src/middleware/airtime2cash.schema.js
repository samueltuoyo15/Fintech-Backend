import joi from "joi"

const buyAirtime2CashValidationSchema = joi.object({
  network: joi.string().valid("mtn", "airtel", "glo", "9mobile").required().messages({
    "any.only": "Network must be an id of an integer",
    "string.base": "Network must be a integer",
    "any.required": "Network is required"
  }),
  
  phone_number: joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
    "string.pattern.base": "phone number must be a valid Nigerian number",
    "any.required": "phone number is required"
  }),

  amount: joi.number().required().messages({
    "number.base": "amount must be a number (e.g., 200, 500, 1000)",
    "any.required": "amount is required"
  })
})

const validateAirtime2CashReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      success: false,
      error: `field: "body", message: "Request body is required"`
    })
    return
  }

  const { error } = buyAirtime2CashValidationSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  })

  if (error) {
    res.status(400).json({
      success: false,
      error: error.details.map((detail) => ({
        message: `${detail.path.join(".")} detail.message.replace(/"/g, "")`
      }))
    })
    return
  }

  next()
}

export default validateAirtime2CashReqBody
