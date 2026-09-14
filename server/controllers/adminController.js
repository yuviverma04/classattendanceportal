const User = require("../models/User");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// ADMIN DASHBOARD
// ===============================

const getAdminDashboard = async (req, res) => {
  try {
    // Total Students
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    // Total Faculty
    const totalFaculty = await User.countDocuments({
      role: "faculty",
    });

    // Total Subjects
    const totalSubjects = await Subject.countDocuments();

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Today's Present
    const todayPresent = await Attendance.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "Present",
    });

    // Today's Absent
    const todayAbsent = await Attendance.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "Absent",
    });

    // Total attendance records today
    const todayAttendance =
      todayPresent + todayAbsent;

    // Attendance percentage
    let attendancePercentage = 0;

    if (todayAttendance > 0) {
      attendancePercentage = Math.round(
        (todayPresent / todayAttendance) * 100
      );
    }

    res.status(200).json({
      success: true,

      stats: {
        totalStudents,
        totalFaculty,
        totalSubjects,
        todayPresent,
        todayAbsent,
        todayAttendance,
        attendancePercentage,
      },
    });

  } catch (error) {

    console.error(
      "Admin Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET ALL STUDENTS
// ===============================

const getAllStudents = async (req, res) => {
  try {

    const students = await User.find({
      role: "student",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET ALL FACULTY
// ===============================

const getAllFaculty = async (req, res) => {
  try {

    const faculty = await User.find({
      role: "faculty",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      faculty,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// GET ALL SUBJECTS
// ===============================

const getAllSubjects = async (req, res) => {
  try {

    const subjects = await Subject.find()
      .populate("faculty", "name email subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ADMIN PROFILE
// ==========================================

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id)
      .select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin Profile Not Found",
      });
    }

    res.json({
      success: true,
      admin,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ADMIN PROFILE
// ==========================================

const updateAdminProfile = async (req, res) => {
  try {
    const {
      name,
      email,
    } = req.body;

    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin Not Found",
      });
    }

    if (name) {
      admin.name = name;
    }

    if (email) {
      admin.email = email;
    }

    await admin.save();

    const updatedAdmin = await User.findById(req.user.id)
      .select("-password");

    res.json({
      success: true,
      message: "Admin Profile Updated Successfully",
      admin: updatedAdmin,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

const changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All Password Fields Are Required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password And Confirm Password Do Not Match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password Must Be At Least 6 Characters",
      });
    }

    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin Not Found",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!passwordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current Password Is Incorrect",
      });
    }

    admin.password = await bcrypt.hash(
      newPassword,
      10
    );

    await admin.save();

    res.json({
      success: true,
      message: "Admin Password Changed Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ADMIN PROFILE IMAGE
// ==========================================

const updateAdminProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Select An Image",
      });
    }

    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin Not Found",
      });
    }

    admin.profileImage = `/uploads/${req.file.filename}`;
    await admin.save();

    res.json({
      success: true,
      message: "Admin Profile Image Updated Successfully",
      profileImage: admin.profileImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  transporter,
  getAdminDashboard,
  getAllStudents,
  getAllFaculty,
  getAllSubjects,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminProfileImage,
};