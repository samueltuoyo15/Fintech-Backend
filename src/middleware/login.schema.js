import joi from "joi"

const loginValidationSchema = joi.object({
  username: joi.string().min(4).max(15).alphanum().required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 4 characters",
    "string.max": "Username cannot exceed 15 characters",
    "string.alphanum": "Username can only contain letters and numbers"
  }),
  password: joi.string().min(8).max(30).pattern(/[a-z]/, { name: "lowercase" }).pattern(/[0-9]/, { name: "number" }).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 30 characters",
      "string.pattern.name": "Password must contain at least one {#name}"
    })
})

const validateLoginInput = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "Validation Error",
      error: [{ field: "body", message: "Request body is required" }]
    })
    return 
  }

  const { error } = loginValidationSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  })

  if (error) {
    res.status(400).json({
      message: "Sign Up Validation Error",
      error: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, "")
      }))
    })
    return 
  }

  next()
}

export default validateLoginInput