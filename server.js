const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://chips-client.vercel.app",
    "https://www.crunchywavez.com",   // ✅ Your new GoDaddy domain
    /\.vercel\.app$/                  // ✅ Allow all Vercel subdomains
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection with caching for Vercel serverless
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return mongoose.connection;
  }

  if (connectionPromise) {
    console.log("🔄 Connection in progress, waiting...");
    return connectionPromise;
  }

  try {
    console.log("🔄 Attempting MongoDB connection...");
    
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing");
    }

    console.log("MONGODB_URI found:", process.env.MONGODB_URI ? "Yes" : "No");

    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10
    });

    const connection = await connectionPromise;
    isConnected = true;
    
    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🏠 Host:", mongoose.connection.host);
    
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    isConnected = false;
    connectionPromise = null;
    throw error;
  }
};

// Connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database middleware error:", error.message);
    // Continue to next middleware, let routes handle the error
    next();
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: "Disconnected",
      1: "Connected", 
      2: "Connecting",
      3: "Disconnecting"
    };

    // Try to ping database if connected
    let dbPing = "Not tested";
    if (dbStatus === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        dbPing = "Successful";
      } catch (pingError) {
        dbPing = "Failed: " + pingError.message;
      }
    }

    res.json({
      status: "Server is running",
      database: {
        status: dbStates[dbStatus] || "Unknown",
        readyState: dbStatus,
        connection: dbStatus === 1 ? "Healthy" : "Disconnected",
        ping: dbPing
      },
      server: {
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      environment: {
        MONGODB_URI_set: !!process.env.MONGODB_URI,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    await connectDB();
    
    res.json({
      success: true,
      message: "Database connection successful!",
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      MONGODB_URI_set: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 ChipsStore API Server is running!",
    version: "1.0.0",
    status: "active",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      testDB: "/api/test-db",
      products: "/api/products",
      orders: "/api/orders",
      auth: "/api/auth"
    }
  });
});

// Routes (Add your actual routes here)
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders")); 
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/reviews", require("./routes/reviews"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "GET /",
      "GET /api/health", 
      "GET /api/test-db",
      "GET /api/products",
      "GET /api/orders",
      "POST /api/auth"
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel (without listening)
module.exports = app;

// Only listen if not in Vercel environment
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Database: ${isConnected ? "Connected" : "Disconnected"}`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
}
