import nodemailer from "nodemailer"
import logger from "../common/utils/logger.js"
import dotenv from "dotenv"
dotenv.config()

const sendEmailVerification = async (email, verificationLink) => {
  if (!email) throw new Error("Email is required")
 
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.GMAIL_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Ife-Elroiglobal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Account Verification Process",
      text: "Verify your account to continue using our service.",
     html: `
      
        `
    })
    logger.info("email sent successfully to ", email)
  } catch (error) {
    console.error(error)
    throw new Error("Error Sending Mail", error)

  }
}

export default sendEmailVerification
