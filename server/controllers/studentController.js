const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../services/mailer");

const sendWelcomeEmail = async ({ name, email, password, role }) => {
  await sendMail({
      to: email,
      subject: `Welcome to Class Attendance Portal - ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="color:#2563eb; margin-bottom: 20px;">Class Attendance Portal</h2>
          <p>Hello <b>${name}</b>,</p>
          <p>Your account has been created successfully.</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p><b>Role:</b> ${role}</p>
          <p>Please log in and change your password after your first login.</p>
        </div>
      `,
  });
};

// Add Student
const addStudent = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      rollNumber,
      branch,
      semester
    } = req.body;

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      rollNumber,
      branch,
      semester
    });

    await sendWelcomeEmail({
      name,
      email,
      password,
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Student Added Successfully",
      student
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get All Students
const getStudents = async (req, res) => {

  try {

    const students = await User.find({
      role: "student"
    }).sort({ rollNumber: 1 });

    res.json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Update Student

const updateStudent = async (req, res) => {

  try {

    const student = await User.findByIdAndUpdate(

      req.params.id,

      req.body,

      { new: true }

    );

    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student Not Found"
      });

    }

    res.json({

      success: true,

      message: "Student Updated Successfully",

      student

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// Delete Student

const deleteStudent = async (req, res) => {

  try {

    const student = await User.findByIdAndDelete(req.params.id);

    if (!student) {

      return res.status(404).json({

        success: false,

        message: "Student Not Found"

      });

    }

    res.json({

      success: true,

      message: "Student Deleted Successfully"

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

// Get Single Student

const getStudentById = async (req, res) => {
  try {

    const student = await User.findById(req.params.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found"
      });
    }

    res.json({
      success: true,
      student
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getMyProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student Profile Not Found",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
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
        message: "New Password Must Be At Least 6 Characters",
      });
    }

    const student = await User.findById(req.user.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      student.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current Password Is Incorrect",
      });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Select An Image",
      });
    }

    const student = await User.findById(req.user.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    student.profileImage = `/uploads/${req.file.filename}`;
    await student.save();

    res.json({
      success: true,
      message: "Profile Image Updated Successfully",
      profileImage: student.profileImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addStudent,
  getStudents,
  getStudentById,
  getMyProfile,
  changePassword,
  updateProfileImage,
  updateStudent,
  deleteStudent
};