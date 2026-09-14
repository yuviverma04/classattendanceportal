const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


const {
  addFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getMyProfile,
  changePassword,
  updateProfileImage
} = require("../controllers/facultyController");


// ==========================================
// ADMIN - ADD FACULTY
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  addFaculty
);


// ==========================================
// ADMIN - GET ALL FACULTY
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getFaculty
);


// ==========================================
// FACULTY - GET OWN PROFILE
// ==========================================

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("faculty"),
  getMyProfile
);

router.get(
  "/my-profile",
  authMiddleware,
  roleMiddleware("faculty"),
  getMyProfile
);

// ==========================================
// FACULTY - CHANGE PASSWORD
// ==========================================
router.put(
  "/change-password",
  authMiddleware,
  roleMiddleware("faculty"),
  changePassword
);

router.put(
  "/profile-image",
  authMiddleware,
  roleMiddleware("faculty"),
  upload.single("profileImage"),
  updateProfileImage
);


// ==========================================
// GET SINGLE FACULTY
// ADMIN / FACULTY
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "faculty"),
  getFacultyById
);


// ==========================================
// ADMIN - UPDATE FACULTY
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateFaculty
);


// ==========================================
// ADMIN - DELETE FACULTY
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteFaculty
);


module.exports = router;

