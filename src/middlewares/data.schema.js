import joi from "joi"

const buyDataSubscriptionSchema = joi.object({
  network: joi.string().valid("MTN", "AIRTEL", "GLO", "9MOBILE").required().messages({
      "any.only": "Network must be one of MTN, AIRTEL, GLO, or 9MOBILE",
      "any.required": "Network is required"
    }),
  
  phone: joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
      "string.pattern.base": "Mobile number must be a valid Nigerian number",
      "any.required": "Mobile number is required"
    }),

  service: joi.string().required().messages({
      "string.base": "Service must be a string (variation code)",
      "any.required": "Service code is required"
    }),

  plan_amount: joi.number().required().messages({
      "string.base": "plan_amount must be a number",
      "any.required": "plan_amount is required"
    }),

})

const validateDataReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      "message": "Validation Error",
      "error": [{ "field": "body", "message": "Request body is required" }]
    })
  }

  const { error, value } = buyDataSubscriptionSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  })

  if (error) {
    return res.status(400).json({
      "message": "Validation Error",
      "error": error.details.map((detail) => ({
        "field": detail.path.join("."),
        "message": detail.message.replace(/"/g, "")
      }))
    })
  }

  req.body.network = value.network.toUpperCase()
  next()
}

export default validateDataReqBody