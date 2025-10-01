const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")

// Create email transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// POST /api/contact - Send contact form email
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    // Create transporter
    const transporter = createTransporter()

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      replyTo: email, // User can reply directly to customer
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the Crunchywavez contact form.</p>
          </div>
        </div>
      `,
    }

    // Confirmation email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Crunchywavez!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Thank You for Reaching Out!</h2>
          
          <p style="line-height: 1.6;">Hi ${name},</p>
          
          <p style="line-height: 1.6;">Thank you for contacting Crunchywavez! We've received your message and our team will get back to you within 24 hours.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your Message:</strong></p>
            <p style="margin: 10px 0; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="line-height: 1.6;">In the meantime, feel free to browse our delicious selection of chips and snacks!</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://www.crunchywavez.com" style="background: linear-gradient(to right, #fbbf24, #f97316); color: #1f2937; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Visit Our Store</a>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px;">
            <p><strong>Crunchywavez</strong></p>
            <p>123 Snack Street, Mumbai, Maharashtra 400001</p>
            <p>Email: ${process.env.EMAIL_USER}</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </div>
      `,
    }

    // Send both emails
    await transporter.sendMail(adminMailOptions)
    await transporter.sendMail(customerMailOptions)

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you within 24 hours.",
    })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again or email us directly at " + process.env.EMAIL_USER,
    })
  }
})

module.exports = router
