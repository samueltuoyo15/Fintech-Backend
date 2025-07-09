import jwt from "jsonwebtoken"

export const generateAccessToken = (_id, username) => {
  const token = jwt.sign(
    {
      _id,
      username,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  )

  return token
}

export const generateRefreshToken = (_id, username) => {
  const token = jwt.sign(
    {
      _id,
      username,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  )

  return token
}

export const generateMailToken = (_id, email) => {
  const token = jwt.sign(
    {
      _id,
      email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "10m",
    }
  )

  return token
}