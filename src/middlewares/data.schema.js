import Joi from "joi"

const buyDataSubscriptionSchema = Joi.object({
  phone: Joi.string().pattern(/^(0|\+234)[789][01]\d{8}$/).required().messages({
    "string.pattern.base": "Phone must be a valid Nigerian number",
    "any.required": "Phone is required"
  }),
  ported_number: Joi.boolean().required().messages({
    "boolean.base": "Ported number must be true or false",
    "any.required": "Ported number is required"
  }),
  network_id: Joi.number().integer().required().messages({
    "number.base": "Network ID must be a number",
    "any.required": "Network ID is required"
  }),
  id: Joi.number().integer().valid(1, 2, 3, 4, 5).required().messages({
    "number.base": "ID must be a number",
    "any.required": "ID is required"
  })
})

const validateDataReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
  }

  const { error, value } = buyDataSubscriptionSchema.validate(req.body, {
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

  req.body = value
  next()
}

export default validateDataReqBody