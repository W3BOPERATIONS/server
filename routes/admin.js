const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const Order = require("../models/Order")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

router.get("/login", (req, res) => {
  // Redirect to the frontend admin login page
  res.redirect("http://localhost:3000/admin-login")
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Find admin user in database
    const adminUser = await User.findOne({
      $or: [{ email: username }, { email: username.includes("@") ? username : `${username}@chipsstore.com` }],
      role: "admin",
    })

    if (!adminUser || adminUser.password !== password) {
      return res.status(401).json({ message: "Invalid admin credentials" })
    }

    const token = jwt.sign(
      {
        user: {
          id: adminUser._id,
          role: "admin",
          name: adminUser.name,
          email: adminUser.email,
        },
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" },
    )

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
        username: adminUser.name,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error during admin login" })
  }
})

const adminAuth = (req, res, next) => {
  const adminKey = req.headers["admin-key"]
  const authHeader = req.headers.authorization

  // Support both admin-key and JWT token authentication
  if (adminKey && (adminKey === process.env.ADMIN_KEY || adminKey === "chips-admin-2024")) {
    return next()
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
      if (decoded.user && decoded.user.role === "admin") {
        req.user = decoded.user
        req.admin = decoded.user
        return next()
      }
    } catch (error) {
      console.error("JWT verification error:", error)
    }
  }

  return res.status(401).json({ message: "Unauthorized access - Admin authentication required" })
}

router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: "pending" })
    const completedOrders = await Order.countDocuments({ status: "delivered" })

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Server error while fetching stats" })
  }
})

// POST /api/admin/products - Add new product
router.post("/products", adminAuth, async (req, res) => {
  try {
    const { name, price, imageURL, description, category, inStock, quantity } = req.body

    if (!name || !price || !imageURL || !description) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const newProduct = new Product({
      name,
      price,
      imageURL,
      description,
      category: category || "snacks",
      quantity: quantity || 0, // Use quantity instead of hardcoded 100
      inStock: quantity > 0, // Auto-set inStock based on quantity
    })

    const savedProduct = await newProduct.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    console.error("Error adding product:", error)
    res.status(500).json({ message: "Server error while adding product" })
  }
})

// PUT /api/admin/products/:id - Update product
router.put("/products/:id", adminAuth, async (req, res) => {
  try {
    const { name, price, imageURL, description, inStock, category, quantity } = req.body

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        imageURL,
        description,
        category,
        quantity: quantity || 0, // Ensure quantity is set
        inStock: quantity > 0, // Auto-set inStock based on quantity
      },
      { new: true, runValidators: true },
    )

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(500).json({ message: "Server error while updating product" })
  }
})

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ message: "Server error while deleting product" })
  }
})

// GET /api/admin/products - Get all products (including out of stock)
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Server error while fetching products" })
  }
})

router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ message: "Server error while fetching orders" })
  }
})

router.put("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({ message: "Server error while updating order" })
  }
})

module.exports = router
