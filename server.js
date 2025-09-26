const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
  })
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Global connection variable
let cachedConnection = null

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    console.log("🔄 Connecting to MongoDB Atlas...")

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    cachedConnection = connection
    console.log("✅ MongoDB Atlas connected successfully")
    return connection
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message)
    cachedConnection = null
    throw err
  }
}

// Connection middleware - Vercel compatible
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    
    // Don't send response here, let routes handle it
    req.dbConnectionFailed = true
    next()
  }
})

// Health check (without DB dependency)
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState
  const dbStates = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  }

  res.json({
    status: "OK",
    message: "Server is running!",
    database: {
      status: dbStates[dbStatus] || "Unknown",
      readyState: dbStatus,
    },
    server: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  })
})

// Routes with error handling
app.use("/api/products", (req, res, next) => {
  if (req.dbConnectionFailed) {
    return res.status(500).json({
      error: "Database connection failed",
      message: "Unable to connect to MongoDB Atlas",
      timestamp: new Date().toISOString(),
    })
  }
  require("./routes/products")(req, res, next)
})

app.use("/api/orders", (req, res, next) => {
  if (req.dbConnectionFailed) {
    return res.status(500).json({
      error: "Database connection failed",
      message: "Unable to connect to MongoDB Atlas",
      timestamp: new Date().toISOString(),
    })
  }
  require("./routes/orders")(req, res, next)
})

// Add similar wrappers for other routes...

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "ChipsStore API is running!",
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  })
})

// Vercel requires module.exports without server listening
module.exports = app