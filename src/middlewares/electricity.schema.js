import joi from "joi"

const payElectirictyBills = joi.object({
  disco_name: joi.string().required().messages({
    "any.only": "Disco name must be one of Ikeja Disco, Eko Disco, etcetera",
    "string.base": "Disco name must be a string",
    "any.required": "Disco name is reaquired"
  }),

  meter_type: joi.string().valid("prepaid", "postpaid").required().messages({
    "any.only": "Meter type must be one of prepaid or postpaid",
    "string.base": "Meter type must be a string",
    "any.required": "Meter type is reaquired"
  }),

  meter_number: joi.number().required().messages({
    "number.base": "Meter number must be a number (e.g., 123456789)",
    "any.required": "Meter numberis required"
  }),

  amount: joi.number().required().messages({
    "number.base": "Amount must be a number (e.g., 100)",
    "any.required": "Amount is required"
  })
})

const validateElectricityReqBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
    return
  }

  const { error } = payElectirictyBills.validate(req.body, {
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

export default validateElectricityReqBody
