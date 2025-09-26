const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

async function reseedDatabase() {
    try {
        console.log("🔄 Connecting to MongoDB...")
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ Connected to MongoDB")

        // Clear existing products
        await Product.deleteMany({})
        console.log("🗑️ Cleared existing products")

        // Sample products with proper initial ratings
        const productsWithRatings = [
            // Potato Chips
            {
                name: "Classic Potato Chips",
                price: 45,
                imageURL: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
                description: "Crispy and golden potato chips with the perfect amount of salt. Made from premium potatoes.",
                quantity: 50,
                inStock: true,
                category: "potato-chips",
                initialRating: 4.2,
                rating: 4.2,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Masala Potato Chips",
                price: 50,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Spicy masala flavored potato chips with authentic Indian spices and herbs.",
                quantity: 35,
                inStock: true,
                category: "potato-chips",
                initialRating: 4.7,
                rating: 4.7,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Cheese & Onion Chips",
                price: 55,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Rich cheese and onion flavored chips with a creamy and savory taste.",
                quantity: 40,
                inStock: true,
                category: "potato-chips",
                initialRating: 4.5,
                rating: 4.5,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Salt & Pepper Chips",
                price: 48,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "Classic salt and pepper seasoned potato chips with a perfect crunch.",
                quantity: 60,
                inStock: true,
                category: "potato-chips",
                initialRating: 3.9,
                rating: 3.9,
                reviewCount: 0,
                totalRating: 0,
            },

            // Corn Chips
            {
                name: "Nacho Cheese Corn Chips",
                price: 65,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Crunchy corn chips with bold nacho cheese flavor, perfect for dipping.",
                quantity: 30,
                inStock: true,
                category: "corn-chips",
                initialRating: 4.6,
                rating: 4.6,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Spicy Jalapeño Corn Chips",
                price: 70,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "Hot and spicy jalapeño corn chips for those who love a fiery kick.",
                quantity: 25,
                inStock: true,
                category: "corn-chips",
                initialRating: 4.3,
                rating: 4.3,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Sweet Corn Chips",
                price: 60,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Naturally sweet corn chips made from premium sweet corn kernels.",
                quantity: 45,
                inStock: true,
                category: "corn-chips",
                initialRating: 4.1,
                rating: 4.1,
                reviewCount: 0,
                totalRating: 0,
            },

            // Tortilla Chips
            {
                name: "Original Tortilla Chips",
                price: 75,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Authentic Mexican-style tortilla chips, perfect with salsa and dips.",
                quantity: 35,
                inStock: true,
                category: "tortilla-chips",
                initialRating: 4.4,
                rating: 4.4,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Lime & Chili Tortilla Chips",
                price: 80,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "Zesty lime and chili flavored tortilla chips with a tangy kick.",
                quantity: 20,
                inStock: true,
                category: "tortilla-chips",
                initialRating: 4.8,
                rating: 4.8,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Multigrain Tortilla Chips",
                price: 85,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Healthy multigrain tortilla chips made with quinoa, flax, and chia seeds.",
                quantity: 30,
                inStock: true,
                category: "tortilla-chips",
                initialRating: 4.0,
                rating: 4.0,
                reviewCount: 0,
                totalRating: 0,
            },

            // Veggie Chips
            {
                name: "Mixed Vegetable Chips",
                price: 90,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "Colorful mix of beetroot, sweet potato, and carrot chips - healthy and delicious.",
                quantity: 25,
                inStock: true,
                category: "veggie-chips",
                initialRating: 4.2,
                rating: 4.2,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Sweet Potato Chips",
                price: 95,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Naturally sweet and crispy sweet potato chips, baked to perfection.",
                quantity: 20,
                inStock: true,
                category: "veggie-chips",
                initialRating: 4.5,
                rating: 4.5,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Beetroot Chips",
                price: 100,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Vibrant purple beetroot chips with a unique earthy flavor and crunch.",
                quantity: 15,
                inStock: true,
                category: "veggie-chips",
                initialRating: 4.3,
                rating: 4.3,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Kale Chips",
                price: 120,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "Superfood kale chips seasoned with sea salt - guilt-free snacking.",
                quantity: 18,
                inStock: true,
                category: "veggie-chips",
                initialRating: 3.8,
                rating: 3.8,
                reviewCount: 0,
                totalRating: 0,
            },

            // Protein Chips
            {
                name: "Chicken Protein Chips",
                price: 150,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "High-protein chicken chips with 20g protein per serving - perfect for fitness enthusiasts.",
                quantity: 12,
                inStock: true,
                category: "protein-chips",
                initialRating: 4.1,
                rating: 4.1,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Lentil Protein Chips",
                price: 130,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Plant-based protein chips made from red lentils with Indian spices.",
                quantity: 20,
                inStock: true,
                category: "protein-chips",
                initialRating: 4.4,
                rating: 4.4,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Quinoa Protein Chips",
                price: 140,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Superfood quinoa chips packed with complete proteins and nutrients.",
                quantity: 15,
                inStock: true,
                category: "protein-chips",
                initialRating: 4.6,
                rating: 4.6,
                reviewCount: 0,
                totalRating: 0,
            },

            // Sweet Chips
            {
                name: "Cinnamon Sweet Potato Chips",
                price: 110,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Sweet potato chips dusted with cinnamon and a hint of brown sugar.",
                quantity: 22,
                inStock: true,
                category: "sweet-chips",
                initialRating: 4.7,
                rating: 4.7,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Honey Glazed Banana Chips",
                price: 85,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Crispy banana chips glazed with natural honey - a tropical treat.",
                quantity: 30,
                inStock: true,
                category: "sweet-chips",
                initialRating: 4.0,
                rating: 4.0,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Coconut Chips",
                price: 95,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Toasted coconut chips with a natural sweet flavor and tropical aroma.",
                quantity: 25,
                inStock: true,
                category: "sweet-chips",
                initialRating: 3.2,
                rating: 3.2,
                reviewCount: 0,
                totalRating: 0,
            },

            // International
            {
                name: "Wasabi Peas Chips",
                price: 125,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Japanese-inspired wasabi flavored pea chips with an intense kick.",
                quantity: 18,
                inStock: true,
                category: "international",
                initialRating: 3.9,
                rating: 3.9,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Seaweed Chips",
                price: 135,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Korean-style roasted seaweed chips with sesame oil and sea salt.",
                quantity: 20,
                inStock: true,
                category: "international",
                initialRating: 4.3,
                rating: 4.3,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Paprika Chips",
                price: 90,
                imageURL: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
                description: "European-style paprika flavored chips with a smoky and sweet taste.",
                quantity: 35,
                inStock: true,
                category: "international",
                initialRating: 4.5,
                rating: 4.5,
                reviewCount: 0,
                totalRating: 0,
            },

            // Healthy Snacks
            {
                name: "Baked Chickpea Chips",
                price: 105,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Protein-rich baked chickpea chips seasoned with turmeric and cumin.",
                quantity: 28,
                inStock: true,
                category: "healthy-snacks",
                initialRating: 4.5,
                rating: 4.5,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Flaxseed Crackers",
                price: 115,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Omega-3 rich flaxseed crackers with herbs and sea salt.",
                quantity: 20,
                inStock: true,
                category: "healthy-snacks",
                initialRating: 5.0,
                rating: 5.0,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Quinoa Puffs",
                price: 125,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Light and airy quinoa puffs with a hint of sea salt - gluten-free.",
                quantity: 25,
                inStock: true,
                category: "healthy-snacks",
                initialRating: 3.4,
                rating: 3.4,
                reviewCount: 0,
                totalRating: 0,
            },

            // Out of Stock
            {
                name: "Truffle Potato Chips",
                price: 250,
                imageURL: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400",
                description: "Premium truffle-flavored potato chips - a luxury snacking experience.",
                quantity: 0,
                inStock: false,
                category: "potato-chips",
                initialRating: 2.9,
                rating: 2.9,
                reviewCount: 0,
                totalRating: 0,
            },
            {
                name: "Gold Dust Chips",
                price: 500,
                imageURL: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
                description: "Ultra-premium chips with edible gold dust - the ultimate luxury snack.",
                quantity: 0,
                inStock: false,
                category: "international",
                initialRating: 4.8,
                rating: 4.8,
                reviewCount: 0,
                totalRating: 0,
            },
        ]


        // Insert products with initial ratings
        const products = await Product.insertMany(productsWithRatings)
        console.log(`✅ Inserted ${products.length} products with initial ratings`)

        // Verify ratings
        console.log("📊 Products with their ratings:")
        products.forEach((product) => {
            console.log(`- ${product.name}: Rating ${product.rating} (Initial: ${product.initialRating})`)
        })

        console.log("🎉 Database reseeded successfully with initial ratings!")
        process.exit(0)
    } catch (error) {
        console.error("❌ Error reseeding database:", error.message)
        process.exit(1)
    }
}

reseedDatabase()
