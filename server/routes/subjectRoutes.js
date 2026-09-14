const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  assignFaculty,
  getFacultySubjects
} = require("../controllers/subjectController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  addSubject
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "faculty", "student"),
  getSubjects
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateSubject
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSubject
);

router.put(
  "/assign/:id",
  authMiddleware,
  roleMiddleware("admin"),
  assignFaculty
);

router.get(
  "/faculty/:facultyId",
  authMiddleware,
  roleMiddleware("faculty"),
  getFacultySubjects
);

module.exports = router;