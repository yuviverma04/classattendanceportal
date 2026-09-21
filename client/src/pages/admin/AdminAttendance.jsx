import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminAttendance.css";

function AdminAttendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState(null);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [reportSubject, setReportSubject] = useState("");
  const [reportStudent, setReportStudent] = useState("");

  const [editStatus, setEditStatus] = useState("Present");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const getImageUrl = (imagePath) =>
    imagePath?.startsWith("http")
      ? imagePath
      : imagePath
        ? `https://classattendanceportal-production.up.railway.app${imagePath}`
        : "https://i.pravatar.cc/80?img=12";

  // ==========================================
  // FETCH SUBJECTS
  // ==========================================

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");

      if (res.data.success) {
        setSubjects(res.data.subjects || []);
      }
    } catch (error) {
      console.log("Subjects Error:", error);
    }
  };

  // ==========================================
  // FETCH ATTENDANCE
  // ==========================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await API.get("/attendance");

      if (res.data.success) {
        setAttendance(res.data.attendance || []);
      }
    } catch (error) {
      console.log("Attendance Error:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchSubjects();
    fetchAttendance();
  }, []);

  const getDateInputValue = (date) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${value.getFullYear()}-${month}-${day}`;
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredAttendance = attendance.filter(
    (item) => {
      const studentName =
        item.student?.name?.toLowerCase() || "";

      const rollNumber =
        item.student?.rollNumber?.toLowerCase() || "";

      const subjectName =
        item.subject?.subjectName?.toLowerCase() || "";

      const searchValue = search.toLowerCase();

      const searchMatch =
        studentName.includes(searchValue) ||
        rollNumber.includes(searchValue) ||
        subjectName.includes(searchValue);

      const statusMatch =
        statusFilter === "All" ||
        item.status === statusFilter;

      const subjectMatch =
        !selectedSubject ||
        item.subject?._id === selectedSubject;

      let dateMatch = true;

      if (selectedDate) {
        dateMatch = getDateInputValue(item.date) === selectedDate;
      }

      return (
        searchMatch &&
        statusMatch &&
        subjectMatch &&
        dateMatch
      );
    }
  );

  const summary = filteredAttendance.reduce(
    (counts, item) => {
      if (item.status === "Present") {
        counts.present += 1;
      } else if (item.status === "Absent") {
        counts.absent += 1;
      }

      return counts;
    },
    { present: 0, absent: 0 }
  );

  const monthlyReportRows = attendance
    .filter((item) => {
      const studentName = item.student?.name?.toLowerCase() || "";
      const rollNumber = item.student?.rollNumber?.toLowerCase() || "";
      const subjectMatch =
        !reportSubject || String(item.subject?._id) === reportSubject;
      const studentMatch =
        !reportStudent ||
        studentName.includes(reportStudent.toLowerCase()) ||
        rollNumber.includes(reportStudent.toLowerCase());

      return (
        getDateInputValue(item.date).startsWith(reportMonth) &&
        subjectMatch &&
        studentMatch
      );
    })
    .reduce((rows, item) => {
      const studentId = item.student?._id || item.student?.rollNumber || item.student?.name;
      const subjectId = item.subject?._id || item.subject?.subjectName;
      const key = `${studentId}-${subjectId}`;
      const existing = rows.get(key) || {
        student: item.student?.name || "Unknown",
        rollNumber: item.student?.rollNumber || "-",
        subject: item.subject?.subjectName || "-",
        totalClasses: 0,
        present: 0,
        absent: 0,
      };

      existing.totalClasses += 1;

      if (item.status === "Present") {
        existing.present += 1;
      } else if (item.status === "Absent") {
        existing.absent += 1;
      }

      rows.set(key, existing);
      return rows;
    }, new Map());

  const monthlyReportData = Array.from(monthlyReportRows.values())
    .map((row) => ({
      ...row,
      percentage: row.totalClasses
        ? `${((row.present / row.totalClasses) * 100).toFixed(2)}%`
        : "0.00%",
    }))
    .sort((first, second) =>
      `${first.student}-${first.subject}`.localeCompare(
        `${second.student}-${second.subject}`
      )
    );

  // ==========================================
  // EDIT
  // ==========================================

  const openEdit = (item) => {
    setSelectedAttendance(item);
    setEditStatus(item.status);
    setShowEdit(true);
  };

  // ==========================================
  // UPDATE
  // ==========================================

  const updateAttendance = async () => {
    try {
      await API.put(
        `/attendance/${selectedAttendance._id}`,
        {
          status: editStatus,
        }
      );

      alert(
        "Attendance Updated Successfully"
      );

      setShowEdit(false);
      setSelectedAttendance(null);

      fetchAttendance();
    } catch (error) {
      console.log("Update Error:", error);

      alert(
        error.response?.data?.message ||
        "Update Failed"
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteAttendance = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/attendance/${id}`
      );

      alert(
        "Attendance Deleted Successfully"
      );

      fetchAttendance();
    } catch (error) {
      console.log("Delete Error:", error);

      alert(
        error.response?.data?.message ||
        "Delete Failed"
      );
    }
  };

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  const exportExcel = async () => {
    try {
      const response = await API.get(
        "/attendance/export/excel",
        {
          params: {
            subject:
              selectedSubject || undefined,
            date:
              selectedDate || undefined,
            status:
              statusFilter !== "All" ? statusFilter : undefined,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "attendance-report.xlsx";

      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Excel Error:", error);

      alert("Excel Export Failed");
    }
  };

  // ==========================================
  // EXPORT PDF
  // ==========================================

  const exportPDF = async () => {
    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (selectedDate) {
        params.append("date", selectedDate);
      }

      if (selectedSubject) {
        params.append("subject", selectedSubject);
      }

      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }

      const response = await API.get(
        `/attendance/export/pdf?${params.toString()}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "attendance-report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Export Error:", error);

      alert("PDF export failed");
    }
  };

  const getReportMonthLabel = () => {
    if (!reportMonth) return "Monthly";

    return new Date(`${reportMonth}-01T00:00:00`).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric" }
    );
  };

  const exportMonthlyReportExcel = () => {
    if (monthlyReportData.length === 0) {
      alert("No student attendance found for the selected month.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      monthlyReportData.map((row, index) => ({
        "S. No.": index + 1,
        Student: row.student,
        "Roll Number": row.rollNumber,
        Subject: row.subject,
        "Total Classes": row.totalClasses,
        Present: row.present,
        Absent: row.absent,
        "Attendance Percentage": row.percentage,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");
    XLSX.writeFile(
      workbook,
      `monthly-student-report-${reportMonth}.xlsx`
    );
  };

  const exportMonthlyReportPDF = () => {
    if (monthlyReportData.length === 0) {
      alert("No student attendance found for the selected month.");
      return;
    }

    const document = new jsPDF({ orientation: "landscape" });
    document.setFontSize(16);
    document.text("Class Attendance Portal", 14, 15);
    document.setFontSize(11);
    document.text(
      `Monthly Student Attendance Report - ${getReportMonthLabel()}`,
      14,
      23
    );

    autoTable(document, {
      startY: 30,
      head: [[
        "S. No.",
        "Student",
        "Roll Number",
        "Subject",
        "Total Classes",
        "Present",
        "Absent",
        "Percentage",
      ]],
      body: monthlyReportData.map((row, index) => [
        index + 1,
        row.student,
        row.rollNumber,
        row.subject,
        row.totalClasses,
        row.present,
        row.absent,
        row.percentage,
      ]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    document.save(`monthly-student-report-${reportMonth}.pdf`);
  };

  // ==========================================
  // CLEAR
  // ==========================================

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedSubject("");
    setSearch("");
    setStatusFilter("All");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString("en-IN");
  };

  return (
    <div className="admin-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <h2>🎓 CAP</h2>

        <h4>
          Class Attendance Portal
        </h4>

        <ul>

          <li
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            🏠 Dashboard
          </li>

          <li
            onClick={() =>
              navigate("/admin/students")
            }
          >
            👨‍🎓 Students
          </li>

          <li
            onClick={() =>
              navigate("/admin/faculty")
            }
          >
            👨‍🏫 Faculty
          </li>

          <li
            onClick={() =>
              navigate("/admin/subjects")
            }
          >
            📚 Subjects
          </li>

          <li className="active">
            📊 Attendance
          </li>

          <li
            onClick={() =>
              navigate("/admin/profile")
            }
          >
            👤 Profile
          </li>

          <li onClick={logout}>
            🚪 Logout
          </li>

        </ul>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= NAVBAR ================= */}

        <div className="admin-navbar">

          <div>

            <h1>
              Attendance Management
            </h1>

            <p>
              View and manage student attendance
            </p>

          </div>


          <div className="admin-user">

            <img
              src={getImageUrl(user.profileImage)}
              alt="Admin"
            />

            <div>

              <h4>
                {user.name || "Admin"}
              </h4>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </div>


        {/* ================= CONTENT ================= */}

        {loading ? (

          <div className="admin-loading">
            Loading Attendance...
          </div>

        ) : (

          <>

            {/* ================= STAT CARDS ================= */}

            <div className="admin-cards">

              <div className="admin-card blue">

                <div className="card-icon">
                  📋
                </div>

                <div>

                  <h3>
                    Total Records
                  </h3>

                  <h1>
                    {
                      summary.present + summary.absent
                    }
                  </h1>

                  <span>
                    Selected Attendance
                  </span>

                </div>

              </div>


              <div className="admin-card green">

                <div className="card-icon">
                  🟢
                </div>

                <div>

                  <h3>
                    Present
                  </h3>

                  <h1>
                    {summary.present}
                  </h1>

                  <span>
                    Present Students
                  </span>

                </div>

              </div>


              <div className="admin-card orange">

                <div className="card-icon">
                  🔴
                </div>

                <div>

                  <h3>
                    Absent
                  </h3>

                  <h1>
                    {summary.absent}
                  </h1>

                  <span>
                    Absent Students
                  </span>

                </div>

              </div>


              <div className="admin-card purple">

                <div className="card-icon">
                  🟡
                </div>

                <div>

                  <h3>Present Rate</h3>

                  <h1>
                    {summary.present + summary.absent === 0
                      ? "0%"
                      : `${Math.round(
                          (summary.present /
                            (summary.present + summary.absent)) *
                            100
                        )}%`}
                  </h1>

                  <span>
                    Of filtered records
                  </span>

                </div>

              </div>

            </div>


            {/* ================= FILTER CARD ================= */}

            <div className="attendance-filter-card">

              <div className="section-title">

                <div>

                  <h2>
                    Attendance Filter
                  </h2>

                  <p>
                    Select date and subject
                    to view attendance
                  </p>

                </div>

              </div>


              <div className="filter-grid">

                <div className="filter-item">

                  <label>
                    Select Date
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="filter-item">

                  <label>
                    Select Subject
                  </label>

                  <select
                    value={selectedSubject}
                    onChange={(e) =>
                      setSelectedSubject(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      All Subjects
                    </option>

                    {subjects.map(
                      (subject) => (

                        <option
                          key={subject._id}
                          value={subject._id}
                        >

                          {subject.subjectCode
                            ? `${subject.subjectCode} - `
                            : ""}

                          {
                            subject.subjectName
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="filter-item">

                  <label>
                    Search Student
                  </label>

                  <input
                    type="text"
                    placeholder="Name / Roll Number"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="filter-item">

                  <label>
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >

                    <option value="All">
                      All Status
                    </option>

                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                  </select>

                </div>


                <button
                  className="clear-filter"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>

              <div className="export-buttons">

                <button
                  className="excel-button"
                  onClick={exportExcel}
                >
                  📊 Export Excel
                </button>

                <button
                  className="pdf-button"
                  onClick={exportPDF}
                >
                  📄 Export PDF
                </button>

                <button
                  className="monthly-report-button"
                  onClick={() => {
                    setReportSubject(selectedSubject);
                    setReportStudent(search);
                    setShowMonthlyReport(true);
                  }}
                >
                  📅 Monthly Student Report
                </button>

              </div>

            </div>


            {/* ================= TABLE ================= */}

            <div className="attendance-table-card">

              <div className="table-top">

                <div>

                  <h2>
                    Attendance Records
                  </h2>

                  <p>
                    {filteredAttendance.length}
                    {" "}
                    records found
                  </p>

                </div>

              </div>


              {filteredAttendance.length ===
                0 ? (

                <div className="no-attendance">

                  <div>
                    📊
                  </div>

                  <h3>
                    No Attendance Found
                  </h3>

                  <p>
                    Select a date and subject
                    or change your filters.
                  </p>

                </div>

              ) : (

                <div className="attendance-table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Student
                        </th>

                        <th>
                          Roll Number
                        </th>

                        <th>
                          Subject
                        </th>

                        <th>
                          Faculty
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredAttendance.map(
                        (item, index) => (

                          <tr
                            key={item._id}
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>

                              <div className="student-info">

                                <div className="student-avatar">
                                  {item.student
                                    ?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}
                                </div>

                                <span>
                                  {
                                    item.student
                                      ?.name ||
                                    "Unknown"
                                  }
                                </span>

                              </div>

                            </td>

                            <td>
                              {
                                item.student
                                  ?.rollNumber ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                item.subject
                                  ?.subjectName ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                item.faculty
                                  ?.name ||
                                "-"
                              }
                            </td>

                            <td>
                              {formatDate(
                                item.date
                              )}
                            </td>

                            <td>

                              <span
                                className={
                                  item.status ===
                                    "Present"
                                    ? "status-present"
                                    : "status-absent"
                                }
                              >

                                {item.status ===
                                  "Present"
                                  ? " Present"
                                  : " Absent"}

                              </span>

                            </td>

                            <td>

                              <div className="table-actions">

                                <button
                                  className="edit-action"
                                  onClick={() =>
                                    openEdit(
                                      item
                                    )
                                  }
                                >
                                  ✏️
                                </button>

                                <button
                                  className="delete-action"
                                  onClick={() =>
                                    deleteAttendance(
                                      item._id
                                    )
                                  }
                                >
                                  🗑️
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

      </main>

      {showMonthlyReport && (
        <div
          className="attendance-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMonthlyReport(false);
            }
          }}
        >
          <div className="monthly-report-modal">
            <div className="modal-header">
              <div>
                <h2>Monthly Student Report</h2>
                <p>View attendance totals by student and subject.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowMonthlyReport(false)}
                aria-label="Close monthly student report"
              >
                ✕
              </button>
            </div>

            <div className="monthly-report-filters">
              <div className="filter-item">
                <label htmlFor="report-month">Month</label>
                <input
                  id="report-month"
                  type="month"
                  value={reportMonth}
                  onChange={(event) => setReportMonth(event.target.value)}
                />
              </div>

              <div className="filter-item">
                <label htmlFor="report-subject">Subject</label>
                <select
                  id="report-subject"
                  value={reportSubject}
                  onChange={(event) => setReportSubject(event.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectCode
                        ? `${subject.subjectCode} - `
                        : ""}
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="report-student">Student</label>
                <input
                  id="report-student"
                  type="text"
                  placeholder="Name / Roll Number"
                  value={reportStudent}
                  onChange={(event) => setReportStudent(event.target.value)}
                />
              </div>
            </div>

            <div className="monthly-report-summary">
              <strong>{monthlyReportData.length}</strong>
              <span>student-subject records for {getReportMonthLabel()}</span>
            </div>

            <div className="monthly-report-table-wrapper">
              {monthlyReportData.length === 0 ? (
                <div className="no-attendance monthly-report-empty">
                  <div>📊</div>
                  <h3>No Monthly Records Found</h3>
                  <p>Try another month, subject, or student.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>Subject</th>
                      <th>Total Class</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReportData.map((row, index) => (
                      <tr key={`${row.student}-${row.rollNumber}-${row.subject}`}>
                        <td>{index + 1}</td>
                        <td>{row.student}</td>
                        <td>{row.rollNumber}</td>
                        <td>{row.subject}</td>
                        <td>{row.totalClasses}</td>
                        <td>{row.present}</td>
                        <td>{row.absent}</td>
                        <td>{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-cancel"
                type="button"
                onClick={() => setShowMonthlyReport(false)}
              >
                Close
              </button>
              <button
                className="monthly-excel-button"
                type="button"
                onClick={exportMonthlyReportExcel}
                disabled={monthlyReportData.length === 0}
              >
                📊 Excel
              </button>
              <button
                className="monthly-pdf-button"
                type="button"
                onClick={exportMonthlyReportPDF}
                disabled={monthlyReportData.length === 0}
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= EDIT MODAL ================= */}

      {showEdit &&
        selectedAttendance && (

          <div className="attendance-modal-overlay">

            <div className="attendance-modal">

              <div className="modal-header">

                <div>

                  <h2>
                    Edit Attendance
                  </h2>

                  <p>
                    Update attendance status
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowEdit(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div className="modal-content">

                <div className="modal-student">

                  <div className="modal-avatar">

                    {selectedAttendance
                      .student
                      ?.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "S"}

                  </div>

                  <div>

                    <h3>
                      {
                        selectedAttendance
                          .student?.name
                      }
                    </h3>

                    <p>
                      Roll No:{" "}
                      {
                        selectedAttendance
                          .student?.rollNumber ||
                        "-"
                      }
                    </p>

                  </div>

                </div>


                <label>
                  Attendance Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value
                    )
                  }
                >

                  <option value="Present">
                    Present
                  </option>

                  <option value="Absent">
                    Absent
                  </option>

                </select>

              </div>


              <div className="modal-footer">

                <button
                  className="modal-cancel"
                  onClick={() =>
                    setShowEdit(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="modal-save"
                  onClick={
                    updateAttendance
                  }
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default AdminAttendance;