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
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #0d6efd; text-align: center;">Verify Your Account</h2>
            <p>Hi there,</p>
            <p>Thanks for signing up with <strong>Ife-Elroiglobal</strong>! Please verify your email to complete your account setup and start enjoying our services — buy data, airtime, pay bills and more.</p>

            <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}"
                style="background-color: #0d6efd; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify My Account
            </a>
            </div>

            <p>If you didn’t create an account with us, you can safely ignore this email.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

            <footer style="text-align: center; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} Ife-Elroiglobal. All rights reserved.<br/>
            <a href="${process.env.FRONTEND_DOMAIN}" style="color: #0d6efd; text-decoration: none;">Visit our website</a>
            </footer>
        </div>
        `
    })
    logger.info("email sent successfully")
  } catch (error) {
    logger.error(error)
    throw new Error("Error Sending Mail")

  }
}

export default sendEmailVerification
