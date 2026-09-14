const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER DETAILS
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==========================================
    // USER ROLE
    // ==========================================

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },

    // ==========================================
    // STUDENT DETAILS
    // ==========================================

    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    branch: {
      type: String,
      default: "",
    },

    semester: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    profileImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // FORGOT PASSWORD OTP
    // ==========================================

    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpiry: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);