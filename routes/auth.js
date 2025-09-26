const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const emailService = require("../services/emailService")

const router = express.Router()

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" })
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({ message: "Name can only contain letters and spaces" })
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" })
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" })
    }

    // Validate phone
    const cleanPhone = phone.replace(/\D/g, "")
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" })
    }

    let user = await User.findOne({ email: email.trim().toLowerCase() })
    if (user) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    const hashedPassword = await hashPassword(password)

    user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: cleanPhone,
      wishlist: [],
    })

    await user.save()

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          wishlist: user.wishlist,
        },
        message: "Registration successful! Welcome to our store!",
      })
    })
  } catch (error) {
    console.error("Registration error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ message: "User with this email already exists" })
    }
    res.status(500).json({ message: "Server error during registration. Please try again." })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password. Please check your credentials." })
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password. Please check your credentials." })
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          wishlist: user.wishlist,
        },
        message: "Login successful! Welcome back!",
      })
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login. Please try again." })
  }
})

// Admin Login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (username === "admin" && password === "admin123") {
      const adminUser = {
        id: "admin",
        name: "Administrator",
        email: "admin@chipsstore.com",
        role: "admin",
        username: "admin",
      }

      const payload = {
        user: {
          id: "admin",
          role: "admin",
        },
      }

      jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" }, (err, token) => {
        if (err) throw err
        res.json({
          token,
          user: adminUser,
          message: "Admin login successful",
        })
      })
    } else {
      return res.status(400).json({ message: "Invalid admin credentials" })
    }
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error during admin login" })
  }
})

// Toggle wishlist (add/remove)
router.post("/wishlist/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isInWishlist = user.wishlist.includes(productId)

    if (isInWishlist) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
      await user.save()
      res.json({ message: "Product removed from wishlist", wishlist: user.wishlist })
    } else {
      user.wishlist.push(productId)
      await user.save()
      res.json({ message: "Product added to wishlist", wishlist: user.wishlist })
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get wishlist
router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist")
    res.json({ wishlist: user.wishlist })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (name) user.name = name.trim()
    if (email) user.email = email.trim().toLowerCase()
    if (phone) user.phone = phone.replace(/\D/g, "")

    await user.save()

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wishlist: user.wishlist,
      },
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.resetOtp = otp
    user.resetOtpExpiry = otpExpiry
    await user.save()

    const emailResult = await emailService.sendOtpEmail(email, user.name, otp)

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error)
      // Still return success to user for security reasons
    }

    res.json({ message: "OTP sent to your email successfully" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error during password reset request" })
  }
})

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetOtp: otp,
      resetOtpExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    user.resetOtp = null
    user.resetOtpExpiry = null
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    res.json({
      message: "OTP verified successfully",
      resetToken: resetToken,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Server error during OTP verification" })
  }
})

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" })
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    const hashedPassword = await hashPassword(password)

    user.password = hashedPassword
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    await emailService.sendPasswordResetConfirmation(user.email, user.name)

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error during password reset" })
  }
})

module.exports = router
