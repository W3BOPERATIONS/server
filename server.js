const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

let isConnected = false
let connectionPromise = null

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // Prevent multiple connection attempts
  if (connectionPromise) {
    return connectionPromise
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    console.log("[v0] 🔄 Connecting to MongoDB Atlas...")

    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
      bufferMaxEntries: 0,
    })

    await connectionPromise
    isConnected = true
    console.log("[v0] ✅ MongoDB Atlas connected successfully")
    console.log("[v0] 📊 Database:", mongoose.connection.name)

    return mongoose.connection
  } catch (err) {
    console.error("[v0] ❌ MongoDB connection error:", err.message)
    isConnected = false
    connectionPromise = null
    throw err
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    res.status(500).json({
      error: "Database connection failed",
      message: "Unable to connect to MongoDB Atlas",
      timestamp: new Date().toISOString(),
    })
  }
})

app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState
    const dbStates = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    }

    // Test database connection
    let dbTest = "Failed"
    try {
      await mongoose.connection.db.admin().ping()
      dbTest = "Success"
    } catch (e) {
      console.error("[v0] DB ping failed:", e.message)
    }

    res.json({
      status: "OK",
      message: "Server is running!",
      mongodb: {
        status: dbStates[dbStatus] || "Unknown",
        readyState: dbStatus,
        database: mongoose.connection.name || "Not connected",
        ping: dbTest,
      },
      server: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0",
      },
      endpoints: [
        "/api/health",
        "/api/health/detailed",
        "/api/auth",
        "/api/products",
        "/api/orders",
        "/api/admin",
        "/api/reviews",
      ],
    })
  } catch (error) {
    console.error("[v0] Health check error:", error)
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

app.get("/api/health/detailed", async (req, res) => {
  try {
    const envVars = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ADMIN_KEY: !!process.env.ADMIN_KEY,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      NODE_ENV: process.env.NODE_ENV,
    }

    res.json({
      status: "Detailed Health Check",
      database: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections),
      },
      environment: envVars,
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Routes
app.use("/api/products", require("./routes/products"))
app.use("/api/orders", require("./routes/orders"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/reviews", require("./routes/reviews"))

app.get("/", (req, res) => {
  res.json({
    message: "ChipsStore API is running!",
    version: "1.0.0",
    status: "active",
    endpoints: {
      health: "/api/health",
      detailedHealth: "/api/health/detailed",
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      admin: "/api/admin",
      reviews: "/api/reviews",
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.use("*", (req, res) => {
  console.log("[v0] 404 - Route not found:", req.originalUrl)
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    message: "The requested endpoint does not exist",
    availableEndpoints: [
      "/api/health",
      "/api/health/detailed",
      "/api/auth",
      "/api/products",
      "/api/orders",
      "/api/admin",
      "/api/reviews",
    ],
    timestamp: new Date().toISOString(),
  })
})

module.exports = app

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`📊 MongoDB URI configured: ${!!process.env.MONGODB_URI}`)
  })
}

process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...")
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    console.log("✅ MongoDB connection closed")
  }
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("🔄 SIGTERM received, shutting down gracefully...")
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    console.log("✅ MongoDB connection closed")
  }
  process.exit(0)
})
