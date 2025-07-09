import joi from "joi"

const cableValidationSchema = joi.object({
  cable_name: joi.string().valid("GOtv", "Dstv", "Startimes").required().messages({
    "any.only": "Cable name must be one of GOtv, Dstv, or Startimes",
    "string.base": "Cable name must be a string",
    "any.required": "Cable name is reaquired"
  }),

  cable_plan: joi.string().valid("Basic", "Premium").required().messages({
    "any.only": "Cable plan type must be one of Basic or Premium",
    "string.base": "Cable plan type must be a string",
    "any.required": "Cable plan type is reaquired"
  }),

  smart_card_number: joi.number().required().messages({
    "number.base": "Smart card number must be a number",
    "any.required": "Smart card number is required"
  })
})

const validateCableReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
    return
  }

  const { error } = cableValidationSchema.validate(req.body, {
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

export default validateCableReqBody
