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
          <p>Your faculty account has been created successfully.</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p><b>Role:</b> ${role}</p>
          <p>Please log in and change your password after your first login.</p>
        </div>
      `,
  });
};

// ==========================================
// Add Faculty
// ==========================================

const addFaculty = async (req, res) => {
  try {
    const { name, email, password, subject } = req.body;

    const existingFaculty = await User.findOne({ email });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: "Faculty Already Exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "faculty",
      subject
    });

    await sendWelcomeEmail({
      name,
      email,
      password,
      role: "faculty",
    });

    res.status(201).json({
      success: true,
      message: "Faculty Added Successfully",
      faculty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================================
// Get All Faculty
// ==========================================

const getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({
      role: "faculty"
    }).select("-password");

    res.json({
      success: true,
      count: faculty.length,
      faculty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================================
// Get My Profile
// Faculty can view only own profile
// ==========================================

const getMyProfile = async (req, res) => {
  try {

    const faculty = await User.findById(req.user.id)
      .select("-password");

    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({
        success: false,
        message: "Faculty Profile Not Found"
      });
    }

    res.json({
      success: true,
      faculty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==========================================
// Change Faculty Password
// Faculty can change only own password
// ==========================================

const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All Password Fields Are Required"
      });
    }

    // Check new password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password And Confirm Password Do Not Match"
      });
    }

    // Minimum password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New Password Must Be At Least 6 Characters"
      });
    }

    // Find logged-in faculty
    const faculty = await User.findById(req.user.id);

    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({
        success: false,
        message: "Faculty Not Found"
      });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      faculty.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current Password Is Incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    faculty.password = hashedPassword;

    await faculty.save();

    res.json({
      success: true,
      message: "Password Changed Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// ==========================================
// Update Faculty Profile Image
// Faculty can update only own profile image
// ==========================================

const updateProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please Select An Image"
      });
    }

    const faculty = await User.findById(req.user.id);

    if (!faculty || faculty.role !== "faculty") {
      return res.status(404).json({
        success: false,
        message: "Faculty Not Found"
      });
    }

    // Save image path
    faculty.profileImage = `/uploads/${req.file.filename}`;

    await faculty.save();

    res.json({
      success: true,
      message: "Profile Image Updated Successfully",
      profileImage: faculty.profileImage
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};





// ==========================================
// Update Faculty
// Admin Only
// ==========================================

const updateFaculty = async (req, res) => {
  try {

    const faculty = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty Not Found"
      });
    }

    res.json({
      success: true,
      message: "Faculty Updated Successfully",
      faculty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================================
// Delete Faculty
// Admin Only
// ==========================================

const deleteFaculty = async (req, res) => {
  try {

    const faculty = await User.findByIdAndDelete(
      req.params.id
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty Not Found"
      });
    }

    res.json({
      success: true,
      message: "Faculty Deleted Successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================================
// Get Single Faculty
// Admin / Faculty
// ==========================================

const getFacultyById = async (req, res) => {
  try {

    const faculty = await User.findById(
      req.params.id
    ).select("-password");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty Not Found"
      });
    }

    res.json({
      success: true,
      faculty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================================
// Export
// ==========================================

module.exports = {
  addFaculty,
  getFaculty,
  getFacultyById,
  getMyProfile,
  updateFaculty,
  deleteFaculty,
  changePassword,
  updateProfileImage
};

