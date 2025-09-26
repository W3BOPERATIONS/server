const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const nodemailer = require("nodemailer")
const puppeteer = require("puppeteer")

const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const generateInvoiceHTML = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${orderData._id}</title>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 30px; 
          background-color: #ffffff;
          color: #333;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
        }
        .company-name { 
          font-size: 36px; 
          font-weight: bold; 
          color: #4f46e5; 
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        .company-tagline {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 15px;
          font-style: italic;
        }
        .invoice-title { 
          font-size: 28px; 
          margin: 20px 0; 
          color: #1f2937;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin: 40px 0; 
          gap: 30px;
        }
        .customer-details, .invoice-info { 
          width: 48%; 
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        .customer-details h3, .invoice-info h3 {
          color: #4f46e5;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          font-weight: 600;
        }
        .customer-details p, .invoice-info p {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 40px 0; 
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .table th, .table td { 
          border: 1px solid #e5e7eb; 
          padding: 15px 12px; 
          text-align: left; 
          font-size: 14px;
        }
        .table th { 
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .table tbody tr:hover {
          background-color: #f1f5f9;
        }
        .total-section { 
          text-align: right; 
          margin-top: 40px; 
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }
        .total-section p {
          margin-bottom: 8px;
          font-size: 16px;
        }
        .total-row { 
          font-weight: bold; 
          font-size: 22px; 
          color: #4f46e5;
          border-top: 2px solid #4f46e5;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          color: #6b7280; 
          border-top: 2px solid #e5e7eb;
          padding-top: 25px;
        }
        .footer h4 {
          color: #4f46e5;
          margin-bottom: 15px;
          font-size: 20px;
        }
        .footer p {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .payment-status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 15px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .payment-cod {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }
        .payment-online {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }
        .highlight {
          background-color: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #4f46e5;
          margin: 20px 0;
        }
        @media print {
          body { padding: 0; }
          .invoice-container { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-name">ChipsStore</div>
          <div class="company-tagline">Premium Chips & Snacks Delivered Fresh</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="invoice-details">
          <div class="customer-details">
            <h3>📋 Bill To:</h3>
            <p><strong>${orderData.customerName}</strong></p>
            <p>📧 ${orderData.email}</p>
            <p>📱 ${orderData.phone}</p>
            <p>📍 ${orderData.address}</p>
          </div>
          <div class="invoice-info">
            <h3>📄 Invoice Details:</h3>
            <p><strong>Invoice #:</strong> INV-${orderData._id}</p>
            <p><strong>Order #:</strong> ${orderData._id}</p>
            <p><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment:</strong> 
              <span class="payment-status ${orderData.paymentMethod === "cod" ? "payment-cod" : "payment-online"}">
                ${orderData.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
              </span>
            </p>
            ${
              orderData.paymentDetails?.transactionId
                ? `<p><strong>Transaction ID:</strong> ${orderData.paymentDetails.transactionId}</p>`
                : ""
            }
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>🛍️ Item</th>
              <th style="text-align: center;">📦 Qty</th>
              <th style="text-align: right;">💰 Unit Price</th>
              <th style="text-align: right;">💵 Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.items
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right;"><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <p>Subtotal: <strong>₹${orderData.subtotal.toFixed(2)}</strong></p>
          <p>Tax (8%): <strong>₹${orderData.tax.toFixed(2)}</strong></p>
          <p>Delivery: <strong style="color: #059669;">Free</strong></p>
          <p class="total-row">Total Amount: ₹${orderData.totalAmount.toFixed(2)}</p>
        </div>

        <div class="highlight">
          <p style="color: #4f46e5; font-weight: 600; margin-bottom: 10px;">📦 Order Status: Processing</p>
          <p style="font-size: 14px; color: #374151;">Your order is being carefully prepared and will be delivered within 2-3 business days. You'll receive tracking information once shipped.</p>
        </div>

        <div class="footer">
          <h4>🙏 Thank you for choosing ChipsStore!</h4>
          <p><strong>ChipsStore</strong> - Premium Chips & Snacks</p>
          <p>📧 support@chipsstore.com | 📞 +91-9876543210</p>
          <p>🌐 www.chipsstore.com</p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            This is a computer-generated invoice. No signature required.<br>
            Generated on ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const generateInvoicePDF = async (orderData) => {
  let browser = null
  try {
    console.log(`[v0] Generating PDF for order ${orderData._id}`)

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    })

    const page = await browser.newPage()
    await page.setContent(generateInvoiceHTML(orderData), {
      waitUntil: "networkidle0",
      timeout: 30000,
    })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    console.log(`[v0] PDF generated successfully for order ${orderData._id}`)
    return pdfBuffer
  } catch (error) {
    console.error(`[v0] Error generating PDF:`, error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

const sendConfirmationEmail = async (orderData) => {
  try {
    console.log(`[v0] Preparing confirmation email for ${orderData.email}`)
    const transporter = createEmailTransporter()

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(orderData)

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@chipsstore.com",
      to: orderData.email,
      subject: `Order Confirmation - ChipsStore (Order #${orderData._id})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; margin-bottom: 30px; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4f46e5; margin-bottom: 10px; font-size: 32px;">ChipsStore</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Premium Chips & Snacks Delivered Fresh</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
            <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="color: #059669; font-size: 24px; font-weight: bold; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">✓</div>
            </div>
            <h2 style="color: white; margin-bottom: 15px; font-size: 24px;">Order Confirmed Successfully!</h2>
            <p style="color: #d1fae5; font-size: 16px; margin: 0;">
              Dear <strong>${orderData.customerName}</strong>, thank you for your order!
            </p>
          </div>

          <div style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #4f46e5;">
            <h3 style="color: #4f46e5; margin-bottom: 15px; font-size: 18px;">📋 Order Summary:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Order Number:</strong></td><td style="padding: 8px 0; text-align: right; font-family: monospace;">${orderData._id}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Order Date:</strong></td><td style="padding: 8px 0; text-align: right;">${new Date(orderData.createdAt).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Total Amount:</strong></td><td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #059669;">₹${orderData.totalAmount.toFixed(2)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Payment Method:</strong></td><td style="padding: 8px 0; text-align: right;">${orderData.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Delivery Address:</strong></td><td style="padding: 8px 0; text-align: right; max-width: 200px;">${orderData.address}</td></tr>
            </table>
          </div>

          <div style="background: white; border-radius: 10px; padding: 25px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
            <h3 style="color: #4f46e5; margin-bottom: 15px; font-size: 18px;">🛍️ Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: linear-gradient(135deg, #4f46e5, #7c3aed);">
                  <th style="color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Item</th>
                  <th style="color: white; padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase;">Qty</th>
                  <th style="color: white; padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase;">Price</th>
                  <th style="color: white; padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items
                  .map(
                    (item, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? "#f8f9fa" : "white"};">
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>${item.name}</strong></td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${item.price.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;"><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="margin-bottom: 8px; font-size: 16px;">Subtotal: <strong>₹${orderData.subtotal.toFixed(2)}</strong></div>
              <div style="margin-bottom: 8px; font-size: 16px;">Tax (8%): <strong>₹${orderData.tax.toFixed(2)}</strong></div>
              <div style="margin-bottom: 12px; font-size: 16px;">Delivery: <strong style="color: #059669;">Free</strong></div>
              <div style="font-weight: bold; font-size: 22px; color: #4f46e5; border-top: 2px solid #4f46e5; padding-top: 12px;">
                Total Amount: ₹${orderData.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div style="background: #eff6ff; border: 2px solid #dbeafe; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1d4ed8; margin-bottom: 15px; font-size: 18px;">📦 What happens next?</h3>
            <div style="color: #374151; line-height: 1.8;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #059669; margin-right: 10px; font-size: 16px;">✅</span>
                <span>Your order is being processed and quality checked</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #f59e0b; margin-right: 10px; font-size: 16px;">🏭</span>
                <span>Fresh chips will be prepared and packaged carefully</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #3b82f6; margin-right: 10px; font-size: 16px;">🚚</span>
                <span>Fast delivery within 2-3 business days</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #8b5cf6; margin-right: 10px; font-size: 16px;">📱</span>
                <span>Track your order anytime in your profile</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="color: #ef4444; margin-right: 10px; font-size: 16px;">🎧</span>
                <span>24/7 customer support available</span>
              </div>
            </div>
          </div>

          <div style="background: white; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 25px;">
            <h3 style="color: #4f46e5; margin-bottom: 15px;">📄 Invoice Attached</h3>
            <p style="color: #6b7280; margin-bottom: 15px;">
              Your detailed invoice is attached as a PDF to this email for your records.
            </p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block;">
              <span style="color: #374151; font-size: 14px;">📎 ChipsStore-Invoice-${orderData._id}.pdf</span>
            </div>
          </div>

          <div style="text-align: center; background: white; padding: 25px; border-radius: 10px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
              Need help? Contact us at <strong>support@chipsstore.com</strong> or <strong>+91-9876543210</strong>
            </p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Thank you for choosing ChipsStore!<br>
                🌐 www.chipsstore.com
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ChipsStore-Invoice-${orderData._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    console.log(`[v0] Confirmation email with PDF invoice sent successfully to ${orderData.email}`)
    return true
  } catch (error) {
    console.error(`[v0] Error sending confirmation email:`, error)
    return false
  }
}

router.post("/", async (req, res) => {
  try {
    console.log("[v0] Received order data:", req.body)

    const {
      customerName,
      email,
      address,
      phone,
      paymentMethod,
      items,
      subtotal,
      tax,
      totalAmount,
      status,
      paymentDetails,
      paymentStatus,
    } = req.body

    if (!customerName || !email || !address || !phone || !paymentMethod || !items || !totalAmount) {
      console.log("[v0] Missing required fields")
      return res.status(400).json({ message: "All fields are required" })
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log("[v0] Invalid items array")
      return res.status(400).json({ message: "Order must contain at least one item" })
    }

    const sanitizedItems = items.map((item) => ({
      productId: String(item.productId || item._id),
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      imageURL: item.imageURL || "",
    }))

    const newOrder = new Order({
      customerName: customerName.trim(),
      email: email.trim(),
      address: address.trim(),
      phone: phone.trim(),
      paymentMethod,
      items: sanitizedItems,
      subtotal: Number(subtotal) || 0,
      tax: Number(tax) || 0,
      totalAmount: Number(totalAmount),
      status: status || "pending",
      paymentDetails: paymentDetails || {},
      paymentStatus: paymentStatus || "pending",
      emailSent: false, // Initialize emailSent field
    })

    console.log("[v0] Creating order:", newOrder)
    const savedOrder = await newOrder.save()
    console.log("[v0] Order saved successfully:", savedOrder._id)

    try {
      await sendConfirmationEmail(savedOrder)
      console.log("[v0] Confirmation email sent successfully")
      await Order.findByIdAndUpdate(savedOrder._id, { emailSent: true })
    } catch (emailError) {
      console.error("[v0] Email sending failed, but order was created:", emailError)
    }

    res.status(201).json({
      message: "Order placed successfully!",
      orderId: savedOrder._id,
      order: savedOrder,
    })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    res.status(500).json({
      message: "Server error while placing order",
      error: error.message,
    })
  }
})

router.post("/:id/send-email", async (req, res) => {
  try {
    const { id } = req.params
    const { email, customerName } = req.body

    console.log(`[v0] Request to send email for order ${id} to ${email}`)

    // Find the order
    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if email was already sent (you can add a field to track this)
    if (order.emailSent) {
      return res.status(200).json({ message: "Email already sent" })
    }

    // Send the confirmation email
    const emailSent = await sendConfirmationEmail(order)

    if (emailSent) {
      // Mark email as sent
      await Order.findByIdAndUpdate(id, { emailSent: true })

      res.status(200).json({
        message: "Email sent successfully",
        success: true,
      })
    } else {
      res.status(500).json({
        message: "Failed to send email",
        success: false,
      })
    }
  } catch (error) {
    console.error(`[v0] Error sending email for order:`, error)
    res.status(500).json({
      message: "Server error while sending email",
      error: error.message,
    })
  }
})

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ message: "Server error while fetching orders" })
  }
})

router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params
    const orders = await Order.find({ email }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    res.status(500).json({ message: "Server error while fetching user orders" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({ message: "Server error while fetching order" })
  }
})

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true })

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({ message: "Server error while updating order status" })
  }
})

router.put("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params
    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const orderTime = new Date(order.createdAt).getTime()
    const currentTime = new Date().getTime()
    const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60)

    if (hoursDifference > 24) {
      return res.status(400).json({ message: "Order cannot be cancelled after 24 hours" })
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({ message: "Order cannot be cancelled" })
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status: "cancelled" }, { new: true })

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    })
  }
})

module.exports = router
