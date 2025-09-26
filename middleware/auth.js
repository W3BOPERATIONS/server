const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
    console.log("[v0] Token decoded:", decoded)
    req.user = decoded.user // Matches your payload { user: { id, role } }

    next()
  } catch (err) {
    console.log("[v0] Token verification failed:", err.message)
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = auth
