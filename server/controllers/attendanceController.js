const Attendance = require("../models/Attendance");
const Subject = require("../models/Subject");
const User = require("../models/User");

const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");


// ======================================================
// MARK ATTENDANCE
// ======================================================

const markAttendance = async (req, res) => {
  try {
    const { student, subject, date, status } = req.body;

    if (!student || !subject || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Student, Subject, Date and Status are required"
      });
    }

    const alreadyMarked = await Attendance.findOne({
      student,
      subject,
      date
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance Already Marked"
      });
    }

    const attendance = await Attendance.create({
      ...req.body,
      faculty: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Attendance Marked Successfully",
      attendance
    });

  } catch (error) {
    console.error("Mark Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// BULK ATTENDANCE
// ======================================================

const bulkAttendance = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance data is required"
      });
    }

    const attendanceData = req.body.map(item => ({
      ...item,
      faculty: req.user.id
    }));

    // Check duplicate records
    for (const item of attendanceData) {
      const exists = await Attendance.findOne({
        student: item.student,
        subject: item.subject,
        date: item.date
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Attendance Already Marked For Selected Date"
        });
      }
    }

    const attendance = await Attendance.insertMany(attendanceData);

    res.status(201).json({
      success: true,
      message: "Attendance Saved Successfully",
      attendance
    });

  } catch (error) {
    console.error("Bulk Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET ALL ATTENDANCE
// ======================================================

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate(
        "student",
        "name rollNumber branch semester email"
      )
      .populate(
        "subject",
        "subjectName subjectCode"
      )
      .populate(
        "faculty",
        "name email"
      )
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    console.error("Get Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// GET STUDENT ATTENDANCE
// ======================================================

const getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.params.studentId
    })
      .populate(
        "subject",
        "subjectName subjectCode"
      )
      .populate(
        "faculty",
        "name"
      )
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    console.error("Student Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// ATTENDANCE PERCENTAGE
// ======================================================

const attendancePercentage = async (req, res) => {
  try {
    const total = await Attendance.countDocuments({
      student: req.params.studentId
    });

    const present = await Attendance.countDocuments({
      student: req.params.studentId,
      status: "Present"
    });

    const absent = await Attendance.countDocuments({
      student: req.params.studentId,
      status: "Absent"
    });

    const percentage =
      total === 0
        ? 0
        : Number(((present / total) * 100).toFixed(2));

    res.json({
      success: true,
      totalClasses: total,
      presentClasses: present,
      absentClasses: absent,
      percentage
    });

  } catch (error) {
    console.error("Attendance Percentage Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// SUBJECT WISE ATTENDANCE
// ======================================================

const subjectWiseAttendance = async (req, res) => {
  try {
    const subjects = await Subject.find();

    const result = [];

    for (const subject of subjects) {

      const total = await Attendance.countDocuments({
        student: req.params.studentId,
        subject: subject._id
      });

      const present = await Attendance.countDocuments({
        student: req.params.studentId,
        subject: subject._id,
        status: "Present"
      });

      const percentage =
        total === 0
          ? 0
          : Number(((present / total) * 100).toFixed(0));

      result.push({
        _id: subject._id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalClasses: total,
        presentClasses: present,
        absentClasses: total - present,
        percentage
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Subject Wise Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// ADMIN DASHBOARD STATS
// ======================================================

const dashboardStats = async (req, res) => {
  try {

    const students = await User.countDocuments({
      role: "student"
    });

    const faculty = await User.countDocuments({
      role: "faculty"
    });

    const subjects = await Subject.countDocuments();

    const attendance = await Attendance.countDocuments();

    res.json({
      success: true,
      students,
      faculty,
      subjects,
      attendance
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// UPDATE ATTENDANCE
// ======================================================

const updateAttendance = async (req, res) => {
  try {

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("student", "name rollNumber")
      .populate("subject", "subjectName subjectCode")
      .populate("faculty", "name");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance Not Found"
      });
    }

    res.json({
      success: true,
      message: "Attendance Updated Successfully",
      attendance
    });

  } catch (error) {
    console.error("Update Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// DELETE ATTENDANCE
// ======================================================

const deleteAttendance = async (req, res) => {
  try {

    const attendance =
      await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance Not Found"
      });
    }

    res.json({
      success: true,
      message: "Attendance Deleted Successfully"
    });

  } catch (error) {
    console.error("Delete Attendance Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// ATTENDANCE SUMMARY
// DATE + SUBJECT
// ======================================================

const attendanceSummary = async (req, res) => {
  try {

    const { subject, date } = req.query;

    if (!subject || !date) {
      return res.status(400).json({
        success: false,
        message: "Subject and date are required"
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const totalStudents = await User.countDocuments({
      role: "student"
    });

    const present = await Attendance.countDocuments({
      subject,
      status: "Present",
      date: {
        $gte: start,
        $lte: end
      }
    });

    const absent = await Attendance.countDocuments({
      subject,
      status: "Absent",
      date: {
        $gte: start,
        $lte: end
      }
    });

    const pending = Math.max(
      0,
      totalStudents - present - absent
    );

    res.json({
      success: true,
      totalStudents,
      present,
      absent,
      pending
    });

  } catch (error) {
    console.error("Attendance Summary Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// FACULTY ATTENDANCE HISTORY
// ======================================================

const attendanceHistory = async (req, res) => {
  try {

    const { subject, date } = req.query;

    const filter = {
      faculty: req.user.id
    };

    if (subject) {
      filter.subject = subject;
    }

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end
      };
    }

    const history = await Attendance.find(filter)
      .populate(
        "student",
        "rollNumber name"
      )
      .populate(
        "subject",
        "subjectName subjectCode"
      )
      .sort({
        date: -1,
        createdAt: -1
      });

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error("Attendance History Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================================
// ADMIN EXPORT EXCEL
// ======================================================

const exportAttendanceExcel = async (req, res) => {
  try {

    const { subject, date } = req.query;

    const filter = {};

    if (subject) {
      filter.subject = subject;
    }

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end
      };
    }

    const attendance = await Attendance.find(filter)
      .populate(
        "student",
        "name rollNumber branch semester"
      )
      .populate(
        "subject",
        "subjectName subjectCode"
      )
      .populate(
        "faculty",
        "name"
      )
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Attendance");

    worksheet.columns = [
      {
        header: "Student Name",
        key: "studentName",
        width: 25
      },
      {
        header: "Roll Number",
        key: "rollNumber",
        width: 18
      },
      {
        header: "Branch",
        key: "branch",
        width: 15
      },
      {
        header: "Semester",
        key: "semester",
        width: 12
      },
      {
        header: "Subject",
        key: "subject",
        width: 25
      },
      {
        header: "Subject Code",
        key: "subjectCode",
        width: 18
      },
      {
        header: "Faculty",
        key: "faculty",
        width: 25
      },
      {
        header: "Date",
        key: "date",
        width: 18
      },
      {
        header: "Status",
        key: "status",
        width: 15
      }
    ];

    attendance.forEach(item => {

      worksheet.addRow({
        studentName:
          item.student?.name || "-",

        rollNumber:
          item.student?.rollNumber || "-",

        branch:
          item.student?.branch || "-",

        semester:
          item.student?.semester || "-",

        subject:
          item.subject?.subjectName || "-",

        subjectCode:
          item.subject?.subjectCode || "-",

        faculty:
          item.faculty?.name || "-",

        date:
          item.date
            ? new Date(item.date).toLocaleDateString("en-IN")
            : "-",

        status:
          item.status || "-"
      });

    });

    worksheet.getRow(1).font = {
      bold: true
    };

    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center"
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="attendance.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(
      "Excel Export Error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};


// ======================================================
// ADMIN EXPORT PDF
// ======================================================

const exportAttendancePDF = async (req, res) => {
  try {

    const { subject, date } = req.query;

    const filter = {};

    if (subject) {
      filter.subject = subject;
    }

    if (date) {

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end
      };
    }

    const attendance = await Attendance.find(filter)
      .populate(
        "student",
        "name rollNumber"
      )
      .populate(
        "subject",
        "subjectName subjectCode"
      )
      .populate(
        "faculty",
        "name"
      )
      .sort({ date: -1 });

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="attendance.pdf"'
    );

    doc.pipe(res);

    // HEADER
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(
        "Class Attendance Portal",
        {
          align: "center"
        }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(15)
      .font("Helvetica")
      .text(
        "Attendance Report",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `Generated On: ${new Date().toLocaleString("en-IN")}`
      );

    if (date) {
      doc.text(`Selected Date: ${date}`);
    }

    if (subject) {
      const subjectData =
        attendance[0]?.subject;

      doc.text(
        `Subject: ${
          subjectData?.subjectName || subject
        }`
      );
    }

    doc.moveDown();

    // SUMMARY
    const total = attendance.length;

    const present =
      attendance.filter(
        item => item.status === "Present"
      ).length;

    const absent =
      attendance.filter(
        item => item.status === "Absent"
      ).length;

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Summary");

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Total Records: ${total}`)
      .text(`Present: ${present}`)
      .text(`Absent: ${absent}`);

    doc.moveDown();

    // TABLE
    let y = doc.y;

    const drawHeader = () => {

      doc
        .font("Helvetica-Bold")
        .fontSize(9);

      doc.text(
        "Student",
        40,
        y,
        { width: 100 }
      );

      doc.text(
        "Roll No.",
        145,
        y,
        { width: 60 }
      );

      doc.text(
        "Subject",
        210,
        y,
        { width: 100 }
      );

      doc.text(
        "Faculty",
        315,
        y,
        { width: 85 }
      );

      doc.text(
        "Date",
        405,
        y,
        { width: 65 }
      );

      doc.text(
        "Status",
        475,
        y,
        { width: 70 }
      );

      doc
        .moveTo(40, y + 18)
        .lineTo(550, y + 18)
        .stroke();

      y += 28;
    };

    drawHeader();

    for (const item of attendance) {

      if (y > 750) {
        doc.addPage();
        y = 50;
        drawHeader();
      }

      const studentName =
        item.student?.name || "-";

      const rollNumber =
        item.student?.rollNumber || "-";

      const subjectName =
        item.subject?.subjectName || "-";

      const facultyName =
        item.faculty?.name || "-";

      const attendanceDate =
        item.date
          ? new Date(
              item.date
            ).toLocaleDateString("en-IN")
          : "-";

      const status =
        item.status || "-";

      doc
        .font("Helvetica")
        .fontSize(8);

      doc.text(
        studentName,
        40,
        y,
        {
          width: 100,
          ellipsis: true
        }
      );

      doc.text(
        rollNumber,
        145,
        y,
        {
          width: 60
        }
      );

      doc.text(
        subjectName,
        210,
        y,
        {
          width: 100,
          ellipsis: true
        }
      );

      doc.text(
        facultyName,
        315,
        y,
        {
          width: 85,
          ellipsis: true
        }
      );

      doc.text(
        attendanceDate,
        405,
        y,
        {
          width: 65
        }
      );

      doc.text(
        status,
        475,
        y,
        {
          width: 70
        }
      );

      doc
        .moveTo(40, y + 18)
        .lineTo(550, y + 18)
        .strokeColor("#dddddd")
        .stroke();

      doc.strokeColor("black");

      y += 28;
    }

    if (attendance.length === 0) {

      doc
        .fontSize(12)
        .text(
          "No attendance records found.",
          40,
          y + 10,
          {
            align: "center",
            width: 510
          }
        );
    }

    // PAGE NUMBERS
    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i < range.start + range.count;
      i++
    ) {

      doc.switchToPage(i);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666666")
        .text(
          `Page ${i + 1} of ${range.count}`,
          40,
          800,
          {
            align: "center",
            width: 510
          }
        );
    }

    doc.fillColor("black");

    doc.end();

  } catch (error) {

    console.error(
      "PDF Export Error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};


// ======================================================
// STUDENT - MONTHLY SUBJECT WISE PDF
// ======================================================

const exportStudentMonthlyPDF = async (req, res) => {
  try {

    // ------------------------------------------
    // IMPORTANT:
    // Student ID JWT se li jayegi
    // ------------------------------------------

    const studentId =
      req.user?.id || req.user?._id;

    const { subject, month } = req.query;

    console.log(
      "Student Monthly PDF Request:",
      {
        studentId,
        subject,
        month
      }
    );

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Student Authentication Failed"
      });
    }

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required. Example: 2026-08"
      });
    }

    // ------------------------------------------
    // MONTH VALIDATION
    // ------------------------------------------

    const monthRegex =
      /^\d{4}-(0[1-9]|1[0-2])$/;

    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid month format. Use YYYY-MM"
      });
    }

    const [year, monthNumber] =
      month.split("-").map(Number);

    // ------------------------------------------
    // DATE RANGE
    // ------------------------------------------

    const startDate = new Date(
      year,
      monthNumber - 1,
      1,
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      year,
      monthNumber,
      0,
      23,
      59,
      59,
      999
    );

    // ------------------------------------------
    // FILTER
    // ------------------------------------------

    const filter = {
      student: studentId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (subject) {
      filter.subject = subject;
    }

    console.log(
      "Monthly Attendance Filter:",
      filter
    );

    // ------------------------------------------
    // GET ATTENDANCE
    // ------------------------------------------

    const attendance =
      await Attendance.find(filter)
        .populate(
          "student",
          "name rollNumber branch semester email"
        )
        .populate(
          "subject",
          "subjectName subjectCode"
        )
        .populate(
          "faculty",
          "name"
        )
        .sort({
          date: 1
        });

    // ------------------------------------------
    // GET STUDENT DIRECTLY
    // ------------------------------------------

    const student =
      await User.findById(studentId)
        .select(
          "name rollNumber branch semester email"
        );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found"
      });
    }

    // ------------------------------------------
    // SUBJECT DETAILS
    // ------------------------------------------

    let subjectData = null;

    if (subject) {

      subjectData =
        await Subject.findById(subject)
          .select(
            "subjectName subjectCode"
          );

      if (!subjectData) {
        return res.status(404).json({
          success: false,
          message: "Subject Not Found"
        });
      }
    }

    // ------------------------------------------
    // SUMMARY
    // ------------------------------------------

    const total =
      attendance.length;

    const present =
      attendance.filter(
        item =>
          item.status === "Present"
      ).length;

    const absent =
      attendance.filter(
        item =>
          item.status === "Absent"
      ).length;

    const percentage =
      total === 0
        ? 0
        : ((present / total) * 100).toFixed(2);

    // ------------------------------------------
    // PDF
    // ------------------------------------------

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="student-attendance-${month}${
        subject ? "-subject" : ""
      }.pdf"`
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    doc.pipe(res);

    // ------------------------------------------
    // HEADER
    // ------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(
        "Class Attendance Portal",
        {
          align: "center"
        }
      );

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(15)
      .text(
        "Student Attendance Report",
        {
          align: "center"
        }
      );

    doc.moveDown();

    // ------------------------------------------
    // STUDENT DETAILS
    // ------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Student Details");

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Name: ${student.name || "-"}`
      )
      .text(
        `Roll Number: ${
          student.rollNumber || "-"
        }`
      )
      .text(
        `Branch: ${
          student.branch || "-"
        }`
      )
      .text(
        `Semester: ${
          student.semester || "-"
        }`
      )
      .text(
        `Month: ${month}`
      );

    if (subjectData) {
      doc.text(
        `Subject: ${
          subjectData.subjectName
        }`
      );

      if (subjectData.subjectCode) {
        doc.text(
          `Subject Code: ${
            subjectData.subjectCode
          }`
        );
      }
    } else {
      doc.text(
        "Subject: All Subjects"
      );
    }

    doc.moveDown();

    // ------------------------------------------
    // SUMMARY BOX
    // ------------------------------------------

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Attendance Summary");

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Total Classes: ${total}`
      )
      .text(
        `Present: ${present}`
      )
      .text(
        `Absent: ${absent}`
      )
      .text(
        `Attendance Percentage: ${percentage}%`
      );

    doc.moveDown();

    // ------------------------------------------
    // TABLE
    // ------------------------------------------

    let y = doc.y;

    const drawTableHeader = () => {

      doc
        .font("Helvetica-Bold")
        .fontSize(9);

      doc.text(
        "Date",
        40,
        y,
        {
          width: 80
        }
      );

      doc.text(
        "Subject",
        125,
        y,
        {
          width: 170
        }
      );

      doc.text(
        "Faculty",
        300,
        y,
        {
          width: 120
        }
      );

      doc.text(
        "Status",
        425,
        y,
        {
          width: 100
        }
      );

      doc
        .moveTo(40, y + 18)
        .lineTo(550, y + 18)
        .stroke();

      y += 28;
    };

    drawTableHeader();

    // ------------------------------------------
    // TABLE ROWS
    // ------------------------------------------

    for (const item of attendance) {

      if (y > 750) {

        doc.addPage();

        y = 50;

        drawTableHeader();
      }

      const attendanceDate =
        item.date
          ? new Date(
              item.date
            ).toLocaleDateString("en-IN")
          : "-";

      const subjectName =
        item.subject?.subjectName ||
        "-";

      const facultyName =
        item.faculty?.name ||
        "-";

      const status =
        item.status ||
        "-";

      doc
        .font("Helvetica")
        .fontSize(8);

      doc.text(
        attendanceDate,
        40,
        y,
        {
          width: 80
        }
      );

      doc.text(
        subjectName,
        125,
        y,
        {
          width: 170,
          ellipsis: true
        }
      );

      doc.text(
        facultyName,
        300,
        y,
        {
          width: 120,
          ellipsis: true
        }
      );

      doc.text(
        status,
        425,
        y,
        {
          width: 100
        }
      );

      doc
        .moveTo(40, y + 18)
        .lineTo(550, y + 18)
        .strokeColor("#dddddd")
        .stroke();

      doc.strokeColor("black");

      y += 28;
    }

    // ------------------------------------------
    // NO RECORDS
    // ------------------------------------------

    if (attendance.length === 0) {

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(
          "No attendance records found for the selected month and subject.",
          40,
          y + 15,
          {
            align: "center",
            width: 510
          }
        );
    }

    // ------------------------------------------
    // FOOTER / PAGE NUMBER
    // ------------------------------------------

    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i < range.start + range.count;
      i++
    ) {

      doc.switchToPage(i);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666666")
        .text(
          `Generated by Class Attendance Portal | Page ${
            i + 1
          } of ${range.count}`,
          40,
          800,
          {
            align: "center",
            width: 510
          }
        );
    }

    doc.fillColor("black");

    // ------------------------------------------
    // FINISH
    // ------------------------------------------

    doc.end();

  } catch (error) {

    console.error(
      "Student Monthly PDF Error:",
      error
    );

    if (!res.headersSent) {

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to generate student attendance PDF"
      });

    }
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  markAttendance,
  bulkAttendance,
  getAttendance,
  getStudentAttendance,
  attendancePercentage,
  dashboardStats,
  subjectWiseAttendance,
  updateAttendance,
  deleteAttendance,
  attendanceSummary,
  attendanceHistory,

  exportAttendanceExcel,
  exportAttendancePDF,

  exportStudentMonthlyPDF
};