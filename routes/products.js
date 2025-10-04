const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const mongoose = require("mongoose")

// GET /api/products - Fetch all products
router.get("/", async (req, res) => {
  try {
    console.log("[v0] Fetching products from database...")

    if (!mongoose.connection.readyState) {
      return res.status(503).json({ message: "Database connection not ready" })
    }

    const { search, category, minPrice, maxPrice, sort, featured, bestseller } = req.query

    // Build query
    const query = {}

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    const flavorSlugMap = {
      "salty-hungama": "Salty Hungama",
      "tomato-chatpata": "Tomato Chatpata",
      "onion-tadka": "Onion Tadka",
      "desi-garlic": "Desi Garlic",
      "chilli-lemon": "Chilli Lemon",
    }

    // Category filter
    if (category && category !== "all") {
      if (flavorSlugMap[category]) {
        // filter hampers that include this flavor
        query.isHamper = true
        query["contents.flavor"] = flavorSlugMap[category]
      } else if (category === "variety-hamper") {
        // seed uses 'hampers-variety'
        query.category = "hampers-variety"
      } else {
        // fall back to direct category match
        query.category = category
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Special filters
    if (featured === "true") query.featured = true
    if (bestseller === "true") query.bestseller = true

    // Execute query
    let productsQuery = Product.find(query)

    // Sorting
    switch (sort) {
      case "price-low":
        productsQuery = productsQuery.sort({ price: 1 })
        break
      case "price-high":
        productsQuery = productsQuery.sort({ price: -1 })
        break
      case "rating":
        productsQuery = productsQuery.sort({ rating: -1 })
        break
      case "newest":
        productsQuery = productsQuery.sort({ createdAt: -1 })
        break
      default:
        productsQuery = productsQuery.sort({ name: 1 })
    }

    const products = await productsQuery
    console.log(`[v0] Found ${products.length} products`)

    res.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({
      message: "Server error while fetching products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// GET /api/products/categories - Fetch all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      { id: "salty-hungama", name: "Salty Hungama", icon: "🧂" },
      { id: "tomato-chatpata", name: "Tomato Chatpata", icon: "🍅" },
      { id: "onion-tadka", name: "Onion Tadka", icon: "🧅" },
      { id: "desi-garlic", name: "Desi Garlic", icon: "🧄" },
      { id: "chilli-lemon", name: "Chilli Lemon", icon: "🌶️" },
    ]

    res.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({
      message: "Server error while fetching categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// GET /api/products/:id - Fetch single product
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" })
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ message: "Server error while fetching product" })
  }
})

module.exports = router
