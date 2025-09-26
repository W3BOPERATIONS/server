const express = require("express")
const Review = require("../models/Review")
const Product = require("../models/Product")
const auth = require("../middleware/auth")
const router = express.Router()

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    res.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({ message: "Failed to fetch reviews" })
  }
})

// Add a review
router.post("/", auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    })

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" })
    }

    // Create new review
    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment,
    })

    await review.save()

    // Update product rating statistics
    const product = await Product.findById(productId)
    if (product) {
      product.reviewCount += 1
      product.totalRating += rating
      product.rating = product.calculateAverageRating()
      await product.save()
    }

    // Populate user data for response
    await review.populate("user", "name email")

    res.status(201).json(review)
  } catch (error) {
    console.error("Error adding review:", error)
    res.status(500).json({ message: "Failed to add review" })
  }
})

// Update a review
router.put("/:reviewId", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user.id,
    })

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    const oldRating = review.rating
    review.rating = rating
    review.comment = comment
    await review.save()

    // Update product rating statistics
    const product = await Product.findById(review.product)
    if (product) {
      product.totalRating = product.totalRating - oldRating + rating
      product.rating = product.calculateAverageRating()
      await product.save()
    }

    await review.populate("user", "name email")
    res.json(review)
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({ message: "Failed to update review" })
  }
})

// Delete a review
router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user.id,
    })

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Update product rating statistics
    const product = await Product.findById(review.product)
    if (product) {
      product.reviewCount -= 1
      product.totalRating -= review.rating
      product.rating = product.reviewCount > 0 ? product.calculateAverageRating() : 0
      await product.save()
    }

    await Review.findByIdAndDelete(req.params.reviewId)
    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({ message: "Failed to delete review" })
  }
})

module.exports = router
