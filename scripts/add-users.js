const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ MongoDB connected successfully")
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message)
    process.exit(1)
  }
}

const addUsers = async () => {
  try {
    await connectDB()

    const deletedCount = await User.deleteMany({})
    console.log(`🗑️ Cleared ${deletedCount.deletedCount} existing users`)

    // Create sample users with plain text passwords (no encryption)
    const users = [
      {
        name: "Admin User",
        email: "admin@chipsstore.com",
        password: "admin123", // Plain text password
        phone: "1234567890",
        role: "admin",
        wishlist: [],
      },
      {
        name: "Alis Patel",
        email: "alispatel123098@gmail.com",
        password: "alis123", // Plain text password
        phone: "9876543210",
        role: "user",
        wishlist: [],
      },
      {
        name: "Sagar Rana",
        email: "sagar@gmail.com",
        password: "sagar123", // Plain text password
        phone: "5555555555",
        role: "user",
        wishlist: [],
      },
      {
        name: "Abhi Jha",
        email: "abhi@gmail.com",
        password: "abhi123", // Plain text password
        phone: "7777777777",
        role: "user",
        wishlist: [],
      },
      {
        name: "Vibhu Pandey",
        email: "vibhu@example.com",
        password: "vibhu123", // Plain text password
        phone: "8888888888",
        role: "user",
        wishlist: [],
      },
      {
        name: "Ayushi Babu",
        email: "ayushi@example.com",
        password: "ayushi123", // Plain text password
        phone: "1111111111",
        role: "user",
        wishlist: [],
      },
    ]

    // Insert users
    const createdUsers = await User.insertMany(users)
    console.log(`✅ Created ${createdUsers.length} users successfully`)

    // Display user credentials
    console.log("\n📋 USER CREDENTIALS:")
    console.log("==================")
    users.forEach((user) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`)
    })

    console.log("\n🔑 ADMIN CREDENTIALS:")
    console.log("Username: admin")
    console.log("Password: admin123")
    console.log("Email: admin@chipsstore.com")

    console.log("\n✅ Database seeded successfully! You can now login with these credentials.")
    console.log("💡 New users can also register and then login normally.")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error adding users:", error)
    process.exit(1)
  }
}

addUsers()
