const path = require("path");
const dotenv = require("dotenv");

// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================

dotenv.config({
  path: path.join(__dirname, ".env"),
});

// ==========================================
// IMPORT PACKAGES
// ==========================================

const express = require("express");
const cors = require("cors");

// ==========================================
// DATABASE
// ==========================================

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ==========================================
// CHECK ENV VARIABLES
// ==========================================

console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER || "MISSING"
);

console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "LOADED"
    : "MISSING"
);

console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET
    ? "LOADED"
    : "MISSING"
);

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// CREATE APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/students", studentRoutes);

app.use(
  "/api/users/students",
  studentRoutes
);

app.use("/api/faculty", facultyRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/subjects", subjectRoutes);

app.use("/api/attendance", attendanceRoutes);

// ==========================================
// UPLOADS
// ==========================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ==========================================
// HOME / SERVER TEST
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Class Attendance Portal Backend Running 🚀",
  });
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
    path: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal Server Error",
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running on Port ${PORT}`
  );
});