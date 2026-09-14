const Subject = require("../models/Subject");

// Add Subject
const addSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);

    res.status(201).json({
      success: true,
      message: "Subject Added Successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate(
      "faculty",
      "name email"
    );

    res.json({
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

// Update Subject

const updateSubject = async (req, res) => {
  try {

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject Not Found"
      });
    }

    res.json({
      success: true,
      message: "Subject Updated Successfully",
      subject
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Delete Subject

const deleteSubject = async (req, res) => {
  try {

    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject Not Found"
      });
    }

    res.json({
      success: true,
      message: "Subject Deleted Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Assign Faculty

const assignFaculty = async (req, res) => {
  try {

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        faculty: req.body.facultyId
      },
      {
        new: true
      }
    ).populate("faculty", "name email");

    res.json({
      success: true,
      message: "Faculty Assigned Successfully",
      subject
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get Subjects Assigned To Faculty

const getFacultySubjects = async (req, res) => {
  try {

    const subjects = await Subject.find({
      faculty: req.params.facultyId
    });

    res.json({
      success: true,
      subjects
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  assignFaculty,
  getFacultySubjects
};