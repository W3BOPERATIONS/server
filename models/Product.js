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
