const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

async function reseedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    let mongoUri = process.env.MONGODB_URI

    // Replace any existing database name with 'chips'
    if (mongoUri.includes("?")) {
      // URI has query parameters: mongodb://.../{dbname}?params
      mongoUri = mongoUri.replace(/\/[^/?]+\?/, "/chips?")
    } else {
      // URI has no query parameters: mongodb://.../{dbname}
      mongoUri = mongoUri.replace(/\/[^/]+$/, "/chips")
    }

    await mongoose.connect(mongoUri)
    console.log("✅ Connected to MongoDB")
    console.log("📊 Database:", mongoose.connection.name)

    // Clear existing products
    await Product.deleteMany({})
    console.log("🗑️ Cleared existing products")

    const commonDesc =
      "Crafted with sun-dried potatoes and a traditional recipe. Not fried, roasted for less fat. 10 packets × 30g, ₹20 each."
    const commonIngredients = "Sun-dried Potatoes, Edible Vegetable Oil, Rock Salt, Natural Spices & Seasonings."
    const commonNutrition = {
      calories: "113 kcal",
      protein: "7g",
      carbs: "19g",
      fat: "1g",
      sodium: "210mg",
      servingSize: "30g",
    }

    const hampers = [
      {
        name: "Salty Hungama Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200&q=80&auto=format",
        description: `${commonDesc} Flavor: Salty Hungama.`,
        quantity: 80,
        inStock: true,
        category: "hampers",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [{ flavor: "Salty Hungama", count: 10 }],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.5,
        rating: 4.5,
        reviewCount: 0,
        totalRating: 0,
        bestseller: true,
        featured: true,
      },
      {
        name: "Tomato Chatpata Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200&q=80&auto=format",
        description: `${commonDesc} Flavor: Tomato Chatpata.`,
        quantity: 70,
        inStock: true,
        category: "hampers",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [{ flavor: "Tomato Chatpata", count: 10 }],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.4,
        rating: 4.4,
        reviewCount: 0,
        totalRating: 0,
      },
      {
        name: "Onion Tadka Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200&q=80&auto=format",
        description: `${commonDesc} Flavor: Onion Tadka.`,
        quantity: 60,
        inStock: true,
        category: "hampers",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [{ flavor: "Onion Tadka", count: 10 }],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.3,
        rating: 4.3,
        reviewCount: 0,
        totalRating: 0,
      },
      {
        name: "Desi Garlic Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1200&q=80&auto=format",
        description: `${commonDesc} Flavor: Desi Garlic.`,
        quantity: 55,
        inStock: true,
        category: "hampers",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [{ flavor: "Desi Garlic", count: 10 }],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.2,
        rating: 4.2,
        reviewCount: 0,
        totalRating: 0,
      },
      {
        name: "Chilli Lemon Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1200&q=80&auto=format",
        description: `${commonDesc} Flavor: Chilli Lemon.`,
        quantity: 65,
        inStock: true,
        category: "hampers",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [{ flavor: "Chilli Lemon", count: 10 }],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.6,
        rating: 4.6,
        reviewCount: 0,
        totalRating: 0,
        featured: true,
      },
      // Variety hamper with all 5 flavors (2 each)
      {
        name: "Variety 10-Pack Hamper",
        price: 200,
        imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1200&q=80&auto=format",
        description:
          "A mix of all five signature flavors. Not fried, roasted, traditional recipe, sun-dried. 10 packets × 30g, ₹20 each.",
        quantity: 90,
        inStock: true,
        category: "hampers-variety",
        isHamper: true,
        packetsPerHamper: 10,
        packetPrice: 20,
        packetWeightGrams: 30,
        contents: [
          { flavor: "Salty Hungama", count: 2 },
          { flavor: "Tomato Chatpata", count: 2 },
          { flavor: "Onion Tadka", count: 2 },
          { flavor: "Desi Garlic", count: 2 },
          { flavor: "Chilli Lemon", count: 2 },
        ],
        ingredients: commonIngredients,
        nutritionInfo: commonNutrition,
        initialRating: 4.5,
        rating: 4.5,
        reviewCount: 0,
        totalRating: 0,
        bestseller: true,
      },
    ]

    const products = await Product.insertMany(hampers)
    console.log(`✅ Inserted ${products.length} hamper products`)

    console.log("📊 Hampers seeded:")
    products.forEach((p) => {
      console.log(
        `- ${p.name}: ₹${p.price} • ${p.packetsPerHamper} x ${p.packetWeightGrams}g (₹${p.packetPrice}/packet)`,
      )
    })

    console.log("🎉 Database reseeded successfully with hampers!")
    console.log(`📊 All data stored in database: ${mongoose.connection.name}`)
    process.exit(0)
  } catch (error) {
    console.error("❌ Error reseeding database:", error.message)
    process.exit(1)
  }
}

reseedDatabase()
