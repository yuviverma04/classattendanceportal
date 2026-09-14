import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

import "./FacultyDashboard.css";

export default function FacultyAttendance() {

  const navigate = useNavigate();

  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [attendanceData, setAttendanceData] = useState([]);

  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // Initial Data
  // =========================

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      if (!storedUser?._id) {
        return;
      }

      const subjectRes =
        await API.get(`/subjects/faculty/${storedUser._id}`);

      setSubjects(
        subjectRes.data.subjects || []
      );

      const studentRes =
        await API.get("/students");

      setStudents(
        studentRes.data.students || []
      );

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // Summary
  // =========================

  useEffect(() => {

    fetchSummary();

  }, [selectedSubject, selectedDate]);

  const fetchSummary = async () => {

    if (!selectedSubject || !selectedDate) {
      return;
    }

    try {

      const res = await API.get(
        `/attendance/summary?subject=${selectedSubject}&date=${selectedDate}`
      );

      setPresentCount(res.data.present || 0);
      setAbsentCount(res.data.absent || 0);
      setPendingCount(res.data.pending || 0);

    } catch (error) {

      console.log("Summary Error:", error);

    }

  };

  // =========================
  // Mark Attendance
  // =========================

  const markAttendance = (studentId, status) => {

    setAttendanceData((prev) => {

      const existing = prev.find(
        (item) => item.student === studentId
      );

      if (existing) {

        return prev.map((item) =>
          item.student === studentId
            ? { ...item, status }
            : item
        );

      }

      return [
        ...prev,
        {
          student: studentId,
          status
        }
      ];

    });

  };

  // =========================
  // Save Attendance
  // =========================

  const saveAttendance = async () => {

    try {

      if (!selectedSubject) {
        return alert("Please Select Subject");
      }

      if (!selectedDate) {
        return alert("Please Select Date");
      }

      if (attendanceData.length === 0) {
        return alert("Please Mark Attendance");
      }

      if (!storedUser?._id) {
        return alert("Please login again to continue");
      }

      const payload = attendanceData.map(
        (item) => ({
          student: item.student,
          subject: selectedSubject,
          faculty: storedUser._id,
          date: selectedDate,
          status: item.status
        })
      );

      const res = await API.post(
        "/attendance/bulk",
        payload
      );

      alert(res.data.message);

      setAttendanceData([]);

      await fetchSummary();

      await fetchHistory();

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Attendance Save Failed"
      );

    }

  };

  // =========================
  // History
  // =========================

  useEffect(() => {

    if (selectedSubject && selectedDate) {
      fetchHistory();
    }

  }, [selectedSubject, selectedDate]);

  const fetchHistory = async () => {

    try {

      const res = await API.get(
        `/attendance/history?subject=${selectedSubject}&date=${selectedDate}`
      );

      setAttendanceHistory(
        res.data.history || []
      );

    } catch (error) {

      console.log("History Error:", error);

    }

  };

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };

  // =========================
  // Sorted Students
  // =========================

  const filteredStudents = students
    .filter((student) => {

      const text =
        search.toLowerCase();

      return (
        (student.name || "")
          .toLowerCase()
          .includes(text) ||

        (student.rollNumber || "")
          .toLowerCase()
          .includes(text)
      );

    })
    .sort((a, b) =>
      String(a.rollNumber || "")
        .localeCompare(
          String(b.rollNumber || ""),
          undefined,
          { numeric: true }
        )
    );

  return (

    <div className={`dashboard ${darkMode ? "dark" : ""}`}>

      {/* Sidebar */}

      <div className={`sidebar ${menuOpen ? "show" : ""}`}>

        <button
          className="close-btn"
          onClick={() => setMenuOpen(false)}
        >
          ✖
        </button>

        <h2>🎓 CAP</h2>

        <h4>Faculty Panel</h4>

        <ul>

          <li
            onClick={() =>
              navigate("/faculty/dashboard")
            }
          >
            🏠 Dashboard
          </li>

          <li className="active">
            📊 Attendance
          </li>

          <li
            onClick={() =>
              navigate("/faculty/profile")
            }
          >
            👤 Profile
          </li>

          <li onClick={handleLogout}>
            🚪 Logout
          </li>

        </ul>

      </div>

      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="main">

        <div className="navbar">

          <div className="left-nav">

            <button
              className="menu-btn"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
            >
              ☰
            </button>

            <div>

              <h2>Faculty Attendance</h2>

              <p>
                {new Date().toDateString()}
              </p>

            </div>

          </div>

          <button
            className="theme-btn"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>

        {/* Controls */}

        <div className="attendance-control">

          <h2>📋 Take Attendance</h2>

          <div className="control-box">

            <div className="input-group">

              <label>
                Subject
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
                  Select Subject
                </option>

                {subjects.map((subject) => (

                  <option
                    key={subject._id}
                    value={subject._id}
                  >
                    {subject.subjectName}
                  </option>

                ))}

              </select>

            </div>

            <div className="input-group">

              <label>
                Date
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

            <div className="input-group">

              <label>
                Search Student
              </label>

              <input
                type="text"
                placeholder="Enter Student Name..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

        </div>

        {/* Summary */}

        <div className="summary-box">

          <div className="summary-card green-card">
            <h3>Present</h3>
            <h1>{presentCount}</h1>
          </div>

          <div className="summary-card red-card">
            <h3>Absent</h3>
            <h1>{absentCount}</h1>
          </div>

          <div className="summary-card blue-card">
            <h3>Pending</h3>
            <h1>{pendingCount}</h1>
          </div>

        </div>

        {/* Students */}

        <div className="table-box">

          <h2>
            👨‍🎓 Student Attendance List
          </h2>

          <table>

            <thead>

              <tr>

                <th>Roll No.</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Semester</th>
                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(
                (student) => {

                  const currentStatus =
                    attendanceData.find(
                      (item) =>
                        item.student ===
                        student._id
                    )?.status;

                  return (

                    <tr key={student._id}>

                      <td>
                        {student.rollNumber}
                      </td>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.branch}
                      </td>

                      <td>
                        {student.semester}
                      </td>

                      <td>

                        <button
                          className="present-btn"
                          onClick={() =>
                            markAttendance(
                              student._id,
                              "Present"
                            )
                          }
                        >
                          {currentStatus === "Present"
                            ? "✓ Present"
                            : "Present"}
                        </button>

                        <button
                          className="absent-btn"
                          onClick={() =>
                            markAttendance(
                              student._id,
                              "Absent"
                            )
                          }
                        >
                          {currentStatus === "Absent"
                            ? "✓ Absent"
                            : "Absent"}
                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

        {/* Save */}

        <div className="save-section">

          <button
            className="save-btn"
            onClick={saveAttendance}
          >
            💾 Save Attendance
          </button>

        </div>

        {/* History */}

        <div className="table-box">

          <h2>
            📜 Attendance History
          </h2>

          {!selectedDate ||
          !selectedSubject ? (

            <p>
              Select subject and date to view
              attendance history.
            </p>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>Roll No.</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>

                </tr>

              </thead>

              <tbody>

                {attendanceHistory.map(
                  (item) => (

                    <tr key={item._id}>

                      <td>
                        {item.student?.rollNumber}
                      </td>

                      <td>
                        {item.student?.name}
                      </td>

                      <td>
                        {item.subject?.subjectName}
                      </td>

                      <td>
                        {item.status}
                      </td>

                      <td>
                        {new Date(
                          item.date
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );
}

