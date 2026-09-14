import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayAttendance: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================
     FETCH DASHBOARD
  ========================= */

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard");

      console.log("Admin Dashboard:", res.data);

      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.log("Admin Dashboard Error:", error);

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  /* =========================
     USER
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  /* =========================
     PROFILE IMAGE
  ========================= */

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://i.pravatar.cc/80?img=12";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigation = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="admin-dashboard">

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {menuOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`admin-sidebar ${
          menuOpen ? "show" : ""
        }`}
      >

        {/* CLOSE BUTTON */}

        <button
          type="button"
          className="admin-close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* LOGO */}

        <h2>🎓 CAP</h2>

        <h4>
          Class Attendance Portal
        </h4>

        {/* MENU */}

        <ul>

          <li
            className="active"
            onClick={() =>
              handleNavigation("/admin/dashboard")
            }
          >
            🏠 Dashboard
          </li>

          <li
            onClick={() =>
              handleNavigation("/admin/students")
            }
          >
            👨‍🎓 Students
          </li>

          <li
            onClick={() =>
              handleNavigation("/admin/faculty")
            }
          >
            👨‍🏫 Faculty
          </li>

          <li
            onClick={() =>
              handleNavigation("/admin/subjects")
            }
          >
            📚 Subjects
          </li>

          <li
            onClick={() =>
              handleNavigation("/admin/attendance")
            }
          >
            📊 Attendance
          </li>

          <li
            onClick={() =>
              handleNavigation("/admin/profile")
            }
          >
            👤 Profile
          </li>

          <li onClick={logout}>
            🚪 Logout
          </li>

        </ul>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="admin-main">

        {/* =========================
            NAVBAR
        ========================= */}

        <div className="admin-navbar">

          {/* LEFT */}

          <div className="admin-navbar-left">

            {/* MOBILE MENU */}

            <button
              type="button"
              className="admin-menu-btn"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              aria-label="Open admin menu"
            >
              ☰
            </button>

            {/* TITLE */}

            <div>
              <h1>
                Admin Dashboard
              </h1>

              <p>
                Welcome back,{" "}
                {user.name || "Admin"}
              </p>
            </div>

          </div>

          {/* ADMIN USER */}

          <div className="admin-user">

            <img
              src={getImageUrl(
                user.profileImage
              )}
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

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (

          <div className="admin-loading">
            Loading Dashboard...
          </div>

        ) : (

          <>

            {/* =========================
                STAT CARDS
            ========================= */}

            <div className="admin-cards">

              {/* STUDENTS */}

              <div className="admin-card blue">

                <div className="card-icon">
                  👨‍🎓
                </div>

                <div>

                  <h3>
                    Total Students
                  </h3>

                  <h1>
                    {stats.totalStudents}
                  </h1>

                  <span>
                    Registered Students
                  </span>

                </div>

              </div>

              {/* FACULTY */}

              <div className="admin-card green">

                <div className="card-icon">
                  👨‍🏫
                </div>

                <div>

                  <h3>
                    Total Faculty
                  </h3>

                  <h1>
                    {stats.totalFaculty}
                  </h1>

                  <span>
                    Registered Faculty
                  </span>

                </div>

              </div>

              {/* SUBJECTS */}

              <div className="admin-card purple">

                <div className="card-icon">
                  📚
                </div>

                <div>

                  <h3>
                    Total Subjects
                  </h3>

                  <h1>
                    {stats.totalSubjects}
                  </h1>

                  <span>
                    Available Subjects
                  </span>

                </div>

              </div>

              {/* ATTENDANCE */}

              <div className="admin-card orange">

                <div className="card-icon">
                  📊
                </div>

                <div>

                  <h3>
                    Today's Attendance
                  </h3>

                  <h1>
                    {stats.attendancePercentage}%
                  </h1>

                  <span>
                    Attendance Percentage
                  </span>

                </div>

              </div>

            </div>

            {/* =========================
                BOTTOM SECTION
            ========================= */}

            <div className="admin-bottom">

              {/* ATTENDANCE */}

              <div className="attendance-card">

                <h2>
                  Today's Attendance
                </h2>

                <div className="attendance-stats">

                  <div className="present">

                    <span>
                      Present
                    </span>

                    <strong>
                      {stats.todayPresent}
                    </strong>

                  </div>

                  <div className="absent">

                    <span>
                      Absent
                    </span>

                    <strong>
                      {stats.todayAbsent}
                    </strong>

                  </div>

                  <div className="total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {stats.todayAttendance}
                    </strong>

                  </div>

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="quick-card">

                <h2>
                  Quick Actions
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/students")
                  }
                >
                  👨‍🎓 Manage Students
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/faculty")
                  }
                >
                  👨‍🏫 Manage Faculty
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/subjects")
                  }
                >
                  📚 Manage Subjects
                </button>

              </div>

            </div>

          </>

        )}

      </main>

    </div>
  );
}

export default AdminDashboard;