const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageURL: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: "snacks",
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    initialRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    isHamper: {
      type: Boolean,
      default: false,
    },
    packetsPerHamper: {
      type: Number,
      default: 10,
      min: 1,
    },
    packetPrice: {
      type: Number,
      default: 20,
      min: 0,
    },
    packetWeightGrams: {
      type: Number,
      default: 30,
      min: 0,
    },
    ingredients: {
      type: String,
      trim: true,
    },
    nutritionInfo: {
      calories: { type: String, trim: true }, // e.g., "113 kcal"
      protein: { type: String, trim: true }, // e.g., "7g"
      carbs: { type: String, trim: true }, // e.g., "19g"
      fat: { type: String, trim: true }, // e.g., "1g"
      sodium: { type: String, trim: true }, // e.g., "210mg"
      servingSize: { type: String, trim: true }, // e.g., "30g"
    },
    contents: [
      {
        flavor: { type: String, trim: true },
        count: { type: Number, min: 1 },
      },
    ],
  },
  {
    timestamps: true,
  },
)

productSchema.virtual("stock").get(function () {
  return this.quantity
})

productSchema.virtual("stock").set(function (value) {
  this.quantity = value
})

productSchema.virtual("totalWeightGrams").get(function () {
  if (!this.isHamper) return undefined
  const packets = this.packetsPerHamper || 0
  const weight = this.packetWeightGrams || 0
  return packets * weight
})

productSchema.methods.calculateAverageRating = function () {
  if (this.reviewCount === 0) {
    // If no reviews, return initial rating from seed data
    return this.initialRating || 0
  }
  // Calculate average from user reviews
  const calculatedRating = this.totalRating / this.reviewCount
  return Math.round(calculatedRating * 10) / 10
}

productSchema.methods.addReview = function (rating) {
  this.totalRating += rating
  this.reviewCount += 1
  this.rating = this.calculateAverageRating()
  return this.save()
}

productSchema.pre("save", function (next) {
  if (this.reviewCount === 0 && this.initialRating) {
    this.rating = this.initialRating
  } else if (this.reviewCount > 0) {
    this.rating = this.calculateAverageRating()
  }
  next()
})

productSchema.set("toJSON", { virtuals: true })
productSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Product", productSchema)
