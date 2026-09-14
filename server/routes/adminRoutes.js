const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getAdminDashboard,
  getAllStudents,
  getAllFaculty,
  getAllSubjects,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminProfileImage,

} = require("../controllers/adminController");


// ===============================
// ADMIN DASHBOARD
// ===============================

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboard
);


// ===============================
// ALL STUDENTS
// ===============================

router.get(
  "/students",
  authMiddleware,
  roleMiddleware("admin"),
  getAllStudents
);


// ===============================
// ALL FACULTY
// ===============================

router.get(
  "/faculty",
  authMiddleware,
  roleMiddleware("admin"),
  getAllFaculty
);


// ===============================
// ALL SUBJECTS
// ===============================

router.get(
  "/subjects",
  authMiddleware,
  roleMiddleware("admin"),
  getAllSubjects
);

// ==========================================
// GET ADMIN PROFILE
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminProfile
);

// UPDATE ADMIN PROFILE
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("admin"),
  updateAdminProfile
);

// CHANGE ADMIN PASSWORD
router.put(
  "/change-password",
  authMiddleware,
  roleMiddleware("admin"),
  changeAdminPassword
);

// UPDATE ADMIN PROFILE IMAGE
router.put(
  "/profile-image",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("profileImage"),
  updateAdminProfileImage
);

module.exports = router;