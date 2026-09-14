const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  markAttendance,
  bulkAttendance,
  getAttendance,
  getStudentAttendance,
  attendancePercentage,
  subjectWiseAttendance,
  dashboardStats,
  updateAttendance,
  deleteAttendance,
  attendanceSummary,
  attendanceHistory,
  exportAttendanceExcel,
  exportAttendancePDF,
  exportStudentMonthlyPDF
} = require("../controllers/attendanceController");


// ==========================================
// FACULTY - MARK ATTENDANCE
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty"),
  markAttendance
);


// ==========================================
// FACULTY - BULK ATTENDANCE
// ==========================================

router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware("faculty"),
  bulkAttendance
);

// ==========================================
// STUDENT - DOWNLOAD MONTHLY ATTENDANCE PDF
// ==========================================

router.get(
  "/student/monthly-pdf",
  authMiddleware,
  roleMiddleware("student"),
  exportStudentMonthlyPDF
);


// ==========================================
// ADMIN / FACULTY - GET ALL ATTENDANCE
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "faculty"),
  getAttendance
);


// ==========================================
// STUDENT - GET ATTENDANCE
// ==========================================

router.get(
  "/student/:studentId",
  authMiddleware,
  getStudentAttendance
);


// ==========================================
// STUDENT - ATTENDANCE PERCENTAGE
// ==========================================

router.get(
  "/percentage/:studentId",
  authMiddleware,
  attendancePercentage
);


// ==========================================
// STUDENT - SUBJECT WISE ATTENDANCE
// ==========================================

router.get(
  "/subject-wise/:studentId",
  authMiddleware,
  subjectWiseAttendance
);


// ==========================================
// ADMIN - DASHBOARD STATS
// ==========================================

router.get(
  "/dashboard/stats",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardStats
);


// ==========================================
// ADMIN / FACULTY - UPDATE ATTENDANCE
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "faculty"),
  updateAttendance
);


// ==========================================
// ADMIN / FACULTY - DELETE ATTENDANCE
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "faculty"),
  deleteAttendance
);


// ==========================================
// FACULTY - ATTENDANCE SUMMARY
// Date + Subject
// ==========================================

router.get(
  "/summary",
  authMiddleware,
  roleMiddleware("faculty"),
  attendanceSummary
);


// ==========================================
// FACULTY - ATTENDANCE HISTORY
// ==========================================

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("faculty"),
  attendanceHistory
);


// ==========================================
// ADMIN - EXPORT EXCEL
// ==========================================

router.get(
  "/export/excel",
  authMiddleware,
  roleMiddleware("admin"),
  exportAttendanceExcel
);


// ==========================================
// ADMIN - EXPORT PDF
// ==========================================

router.get(
  "/export/pdf",
  authMiddleware,
  roleMiddleware("admin"),
  exportAttendancePDF
);


module.exports = router;