const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = null
    this.initializeTransporter()
  }

  initializeTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Gmail configuration using existing environment variables
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
      })
      console.log("📧 Gmail email service configured successfully")
    } else {
      // Development mode - use Ethereal Email (fake SMTP service)
      console.log("⚠️  No email configuration found. Using development mode.")
      console.log("📧 Add these environment variables for production email:")
      console.log("   EMAIL_USER, EMAIL_PASS (for Gmail)")

      // Create test account for development
      this.createTestAccount()
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount()

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      console.log("📧 Development email account created:")
      console.log("   User:", testAccount.user)
      console.log("   Pass:", testAccount.pass)
    } catch (error) {
      console.error("Failed to create test email account:", error)
      this.transporter = null
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.log("=== EMAIL SIMULATION (No transporter configured) ===")
      console.log("To:", to)
      console.log("Subject:", subject)
      console.log("HTML Content:", html)
      console.log("================================================")
      return { success: true, messageId: "simulated-" + Date.now() }
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "noreply@chipsstore.com",
        to: to,
        subject: subject,
        html: html,
        text: text || this.htmlToText(html),
      }

      const info = await this.transporter.sendMail(mailOptions)

      // Log preview URL for development (Ethereal Email)
      if (process.env.NODE_ENV !== "production" && nodemailer.getTestMessageUrl(info)) {
        console.log("📧 Email sent successfully!")
        console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info))
      } else {
        console.log("📧 Email sent successfully to:", to)
      }

      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("Email sending failed:", error)

      // Fallback to console logging in case of email service failure
      console.log("=== EMAIL FALLBACK (Service failed) ===")
      console.log("To:", to)
      console.log("Subject:", subject)
      console.log("HTML Content:", html)
      console.log("Error:", error.message)
      console.log("=====================================")

      return { success: false, error: error.message }
    }
  }

  // Simple HTML to text conversion
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .trim()
  }

  // Send OTP email
  async sendOtpEmail(to, name, otp) {
    const subject = "Password Reset OTP - ChipsStore"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">C</span>
          </div>
          <h1 style="color: #1f2937; margin: 0;">ChipsStore</h1>
        </div>
        
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #7c3aed; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            You have requested to reset your password for your ChipsStore account. 
            Please use the following One-Time Password (OTP) to verify your identity:
          </p>
          
          <div style="background-color: white; border: 2px dashed #7c3aed; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Your OTP Code:</p>
            <h1 style="color: #7c3aed; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>⏰ Important:</strong> This OTP will expire in <strong>5 minutes</strong> for security reasons.
            </p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The ChipsStore Team</strong>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    `

    return await this.sendEmail(to, subject, html)
  }

  // Send password reset confirmation email
  async sendPasswordResetConfirmation(to, name) {
    const subject = "Password Reset Successful - ChipsStore"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 20px;">✓</span>
          </div>
          <h1 style="color: #1f2937; margin: 0;">ChipsStore</h1>
        </div>
        
        <div style="background-color: #f0fdf4; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
          <h2 style="color: #059669; margin-top: 0;">Password Reset Successful!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your password has been successfully reset for your ChipsStore account. 
            You can now log in with your new password.
          </p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>🔒 Security Tip:</strong> If you didn't make this change, please contact our support team immediately.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The ChipsStore Team</strong>
          </p>
        </div>
      </div>
    `

    return await this.sendEmail(to, subject, html)
  }
}

// Create singleton instance
const emailService = new EmailService()

module.exports = emailService
