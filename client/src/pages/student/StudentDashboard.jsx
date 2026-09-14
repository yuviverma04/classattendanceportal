import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const dashboardLoadedRef = useRef(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [time, setTime] = useState("");

  const [profile, setProfile] = useState({});

  const [attendance, setAttendance] = useState({
    totalClasses: 0,
    presentClasses: 0,
    percentage: 0,
  });

  const [subjects, setSubjects] = useState([]);

  const [subjectAttendance, setSubjectAttendance] =
    useState([]);

  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardCacheKey = "student-dashboard-cache";

  const [loading, setLoading] = useState(() => {
    const cachedData = sessionStorage.getItem(dashboardCacheKey);
    return !cachedData;
  });

  // =====================================================
  // PDF REPORT STATES
  // =====================================================

  const [reportSubject, setReportSubject] =
    useState("");

  const [reportMonth, setReportMonth] =
    useState("");

  const [downloadingPDF, setDownloadingPDF] =
    useState(false);

  // =====================================================
  // CURRENT DATE
  // =====================================================

  const currentDate = new Date();

  const date = currentDate.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  // =====================================================
  // CLOCK
  // =====================================================

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();

    const interval = setInterval(
      updateTime,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    if (!user._id) {
      navigate("/");
      return;
    }

    if (dashboardLoadedRef.current) {
      return;
    }

    const cachedData = sessionStorage.getItem(dashboardCacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

        setProfile({
          ...(parsed.profile || {}),
          ...(currentUser && currentUser.name ? { name: currentUser.name } : {}),
          ...(currentUser && currentUser.profileImage ? { profileImage: currentUser.profileImage } : {}),
        });
        setAttendance(parsed.attendance || {
          totalClasses: 0,
          presentClasses: 0,
          percentage: 0,
        });
        setSubjects(parsed.subjects || []);
        setSubjectAttendance(parsed.subjectAttendance || []);
        setLoading(false);
        dashboardLoadedRef.current = true;
        return;
      } catch (error) {
        sessionStorage.removeItem(dashboardCacheKey);
      }
    }

    dashboardLoadedRef.current = true;
    fetchData();
  }, [navigate, user._id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user._id) {
        navigate("/");
        return;
      }

      const [
        profileRes,
        attendanceRes,
        subjectRes,
        subjectAttendanceRes,
      ] = await Promise.all([
        API.get(`/students/${user._id}`),
        API.get(`/attendance/percentage/${user._id}`),
        API.get("/subjects"),
        API.get(`/attendance/subject-wise/${user._id}`),
      ]);

      const nextProfile = profileRes.data.student || {};
      const nextAttendance = attendanceRes.data.success
        ? {
            totalClasses: attendanceRes.data.totalClasses || 0,
            presentClasses: attendanceRes.data.presentClasses || 0,
            percentage: attendanceRes.data.percentage || 0,
          }
        : {
            totalClasses: 0,
            presentClasses: 0,
            percentage: 0,
          };
      const nextSubjects = subjectRes.data.subjects || [];
      const nextSubjectAttendance = subjectAttendanceRes.data.data || [];

      setProfile(nextProfile);
      setAttendance(nextAttendance);
      setSubjects(nextSubjects);
      setSubjectAttendance(nextSubjectAttendance);

      sessionStorage.setItem(
        dashboardCacheKey,
        JSON.stringify({
          profile: nextProfile,
          attendance: nextAttendance,
          subjects: nextSubjects,
          subjectAttendance: nextSubjectAttendance,
        })
      );
    } catch (error) {
      console.error("Student Dashboard Error:", error);

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =====================================================
  // SCROLL FUNCTION
  // =====================================================

  const scrollToSection = (id) => {
    closeMenu();

    setTimeout(() => {
      const element =
        document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // =====================================================
  // DOWNLOAD MONTHLY PDF
  // =====================================================

  const downloadAttendancePDF = async () => {
    if (!reportSubject) {
      alert("Please select a subject");
      return;
    }

    if (!reportMonth) {
      alert("Please select a month");
      return;
    }

    try {
      setDownloadingPDF(true);

      const response = await API.get(
        `/attendance/student/monthly-pdf?subject=${reportSubject}&month=${reportMonth}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `My-Attendance-${reportMonth}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Attendance PDF Error:",
        error
      );

      alert(
        "Unable to download attendance PDF"
      );

    } finally {
      setDownloadingPDF(false);
    }
  };

  // =====================================================
  // FILTER SUBJECTS
  // =====================================================

  const filteredAttendance =
    subjectAttendance.filter((sub) =>
      sub.subjectName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  // =====================================================
  // ABSENT CLASSES
  // =====================================================

  const absentClasses =
    Math.max(
      0,
      attendance.totalClasses -
        attendance.presentClasses
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="student-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading Student Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="student-overlay"
          onClick={closeMenu}
        ></div>
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`student-sidebar ${
          menuOpen ? "show" : ""
        }`}
      >

        <button
          className="student-close-btn"
          onClick={closeMenu}
        >
          ✕
        </button>

        {/* LOGO */}

        <div className="student-logo">

          <div className="student-logo-icon">
            🎓
          </div>

          <div>
            <h2>CAP</h2>

            <span>
              Class Attendance Portal
            </span>
          </div>

        </div>

        {/* NAVIGATION */}

        <ul className="student-nav">

          <li
            className="active"
            onClick={() =>
              scrollToSection(
                "student-dashboard-home"
              )
            }
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </li>

          <li
            onClick={() =>
              scrollToSection(
                "student-attendance"
              )
            }
          >
            <span>📊</span>
            <span>Attendance</span>
          </li>

          <li
            onClick={() =>
              scrollToSection(
                "student-subjects"
              )
            }
          >
            <span>📚</span>
            <span>Subjects</span>
          </li>

          <li
            onClick={() => {
              closeMenu();
              navigate(
                `/student/profile`
              );
            }}
          >
            <span>👤</span>
            <span>Profile</span>
          </li>

          <li
            onClick={logout}
            className="logout-menu"
          >
            <span>🚪</span>
            <span>Logout</span>
          </li>

        </ul>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <div className="sidebar-user-mini">

            <div className="mini-avatar">
              {(profile.name ||
                user.name ||
                "S"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {profile.name ||
                  user.name ||
                  "Student"}
              </strong>

              <small>
                Student
              </small>
            </div>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="student-main">

        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <header className="student-navbar">

          <div className="student-navbar-left">

            {/* MOBILE 3 LINE BUTTON */}

            <button
              className="student-menu-btn"
              onClick={() =>
                setMenuOpen(true)
              }
            >
              ☰
            </button>

            <div>

              <h1>
                Student Dashboard
              </h1>

              <p>
                {date}
              </p>

            </div>

          </div>

          {/* USER AREA */}

          <div className="student-navbar-right">

            <div className="student-user">

              <div className="student-avatar">

                {(profile.name ||
                  user.name ||
                  "S"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div className="student-user-info">

                <h4>
                  {profile.name ||
                    user.name ||
                    "Student"}
                </h4>

                <span>
                  Student
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <section
          className="student-content"
          id="student-dashboard-home"
        >

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="student-welcome">

            <div>

              <h2>
                Welcome back,{" "}
                {profile.name ||
                  user.name ||
                  "Student"} 👋
              </h2>

              <p>
                Here's your attendance
                overview.
              </p>

            </div>

            <div className="welcome-time">
              🕐 {time}
            </div>

          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="student-cards">

            {/* TOTAL ATTENDANCE */}

            <div className="student-card blue">

              <div className="student-card-icon">
                📊
              </div>

              <div>

                <h3>
                  Total Attendance
                </h3>

                <h1>
                  {attendance.percentage}%
                </h1>

                <span>
                  Overall Attendance
                </span>

              </div>

            </div>

            {/* PRESENT */}

            <div className="student-card green">

              <div className="student-card-icon">
                ✅
              </div>

              <div>

                <h3>
                  Present Days
                </h3>

                <h1>
                  {attendance.presentClasses}
                </h1>

                <span>
                  This Semester
                </span>

              </div>

            </div>

            {/* ABSENT */}

            <div className="student-card red">

              <div className="student-card-icon">
                ❌
              </div>

              <div>

                <h3>
                  Absent Days
                </h3>

                <h1>
                  {absentClasses}
                </h1>

                <span>
                  This Semester
                </span>

              </div>

            </div>

            {/* SUBJECTS */}

            <div className="student-card purple" >

              <div className="student-card-icon">
                📚
              </div>

              <div>

                <h3>
                  Total Subjects
                </h3>

                <h1>
                  {subjects.length}
                </h1>

                <span>
                  Current Semester
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              SUBJECT WISE ATTENDANCE
          ================================================= */}

          <div
            className="student-section"
            id="student-attendance"
          >

            <div className="section-header">

              <div>

                <h2>
                  Subject Wise Attendance
                </h2>

                <p>
                  View your attendance
                  subject by subject.
                </p>

              </div>

              <div className="section-badge">
                📊 Attendance
              </div>

            </div>

            {/* SEARCH */}

            <div className="student-search">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search Subject..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            {/* TABLE */}

            <div className="student-table-wrapper">

              <table className="student-table">

                <thead>

                  <tr>

                    <th>
                      Subject
                    </th>

                    <th>
                      Attendance
                    </th>

                    <th>
                      Progress
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredAttendance.length >
                  0 ? (

                    filteredAttendance.map(
                      (sub, index) => {

                        const percentage =
                          Number(
                            sub.percentage
                          ) || 0;

                        return (
                          <tr
                            key={
                              sub.subjectName ||
                              index
                            }
                          >

                            <td>

                              <div className="subject-name">

                                <div className="subject-icon">
                                  📚
                                </div>

                                <span>
                                  {
                                    sub.subjectName
                                  }
                                </span>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`attendance-badge ${
                                  percentage >=
                                  75
                                    ? "good"
                                    : percentage >=
                                      60
                                    ? "warning"
                                    : "danger"
                                }`}
                              >
                                {percentage}%
                              </span>

                            </td>

                            <td>

                              <div className="table-progress">

                                <div className="table-progress-bg">

                                  <div
                                    className="table-progress-fill"
                                    style={{
                                      width: `${Math.min(
                                        percentage,
                                        100
                                      )}%`,
                                    }}
                                  ></div>

                                </div>

                                <span>
                                  {percentage}%
                                </span>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="3"
                        className="no-data"
                      >
                        No subject found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              SUBJECT PROGRESS
          ================================================= */}

          <div
            className="student-section"
            id="student-subjects"
          >

            <div className="section-header">

              <div>

                <h2>
                  Subject Progress
                </h2>

                <p>
                  Track your performance
                  in each subject.
                </p>

              </div>

            </div>

            <div className="subject-progress-grid">

              {filteredAttendance.length >
              0 ? (

                filteredAttendance.map(
                  (sub, index) => {

                    const percentage =
                      Number(
                        sub.percentage
                      ) || 0;

                    return (

                      <div
                        className="subject-progress-card"
                        key={
                          sub.subjectName ||
                          index
                        }
                      >

                        <div className="subject-progress-top">

                          <div>

                            <div className="progress-subject-icon">
                              📚
                            </div>

                          </div>

                          <div className="progress-percentage">

                            {percentage}%

                          </div>

                        </div>

                        <h3>
                          {sub.subjectName}
                        </h3>

                        <div className="progress-line">

                          <div
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                        <p>

                          {percentage >= 75
                            ? "Good Attendance"
                            : "Attendance Needs Improvement"}

                        </p>

                      </div>

                    );
                  }
                )

              ) : (

                <div className="empty-progress">
                  No subject data available.
                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PDF REPORT
          ================================================= */}

          <div className="student-section student-report-section">

            <div className="section-header">

              <div>

                <h2>
                  Download Attendance Report
                </h2>

                <p>
                  Download your own
                  subject-wise monthly
                  attendance report.
                </p>

              </div>

              <div className="report-icon">
                📄
              </div>

            </div>

            <div className="report-box">

              {/* SUBJECT */}

              <div className="report-field">

                <label>
                  Select Subject
                </label>

                <select
                  value={reportSubject}
                  onChange={(e) =>
                    setReportSubject(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map(
                    (subject) => (

                      <option
                        key={subject._id}
                        value={subject._id}
                      >
                        {subject.subjectName}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* MONTH */}

              <div className="report-field">

                <label>
                  Select Month
                </label>

                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) =>
                    setReportMonth(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* BUTTON */}

              <button
                className="download-report-btn"
                onClick={
                  downloadAttendancePDF
                }
                disabled={
                  !reportSubject ||
                  !reportMonth ||
                  downloadingPDF
                }
              >

                {downloadingPDF
                  ? "Generating..."
                  : "📥 Download PDF"}

              </button>

            </div>

            <div className="report-note">

              💡 Select a subject and month
              to download only your own
              attendance history.

            </div>

          </div>
                
          
          

          

        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;