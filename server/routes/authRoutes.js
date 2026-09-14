const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

// ==========================================
// REGISTER
// ==========================================

router.post("/register", register);

// ==========================================
// LOGIN
// ==========================================

router.post("/login", login);

// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================

router.post("/forgot-password", forgotPassword);

// ==========================================
// VERIFY OTP
// ==========================================

router.post("/verify-otp", verifyOTP);

// ==========================================
// RESET PASSWORD
// ==========================================

router.post("/reset-password", resetPassword);

module.exports = router;