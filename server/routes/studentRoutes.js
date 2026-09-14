const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  addStudent,
  getStudents,
  getStudentById,
  getMyProfile,
  changePassword,
  updateProfileImage,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  addStudent
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "faculty"),
  getStudents
);

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  getMyProfile
);

router.put(
  "/change-password",
  authMiddleware,
  roleMiddleware("student"),
  changePassword
);

router.put(
  "/profile-image",
  authMiddleware,
  roleMiddleware("student"),
  upload.single("profileImage"),
  updateProfileImage
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "faculty", "student"),
  getStudentById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateStudent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStudent
);

module.exports = router;