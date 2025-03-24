// server/routes/authRoutes.js

const express = require("express");
const {
  register,
  login,
  getUserData,
  getAllUsers,
} = require("../controllers/authController"); // Import functions from controller

const router = express.Router();

// Authentication Routes
router.post("/signup", register); // Signup Route
router.post("/login", login);     // Login Route

// User Data Routes
router.get("/user/:id", getUserData); // Get User Data by ID (for profile or contact info)
router.get("/users", getAllUsers);    // Get All Users (to show contact list)

module.exports = router;
