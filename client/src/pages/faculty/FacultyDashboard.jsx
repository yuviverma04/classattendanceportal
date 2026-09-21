import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

import "./FacultyDashboard.css";


export default function FacultyDashboard() {

  const navigate = useNavigate();

  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const [profile, setProfile] = useState({
    name: storedUser?.name || "Faculty",
    email: storedUser?.email || ""
  });

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [presentCount, setPresentCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [time, setTime] = useState("");

  const date = new Date().toDateString();

  // =========================
  // Fetch Dashboard Data
  // =========================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, studentsRes, subjectsRes] = await Promise.all([
        API.get("/faculty/profile"),
        API.get("/students"),
        storedUser?._id
          ? API.get(`/subjects/faculty/${storedUser._id}`)
          : Promise.resolve({ data: { subjects: [] } }),
      ]);

      setProfile(
        profileRes.data.faculty || {
          name: storedUser?.name || "Faculty",
          email: storedUser?.email || "",
        }
      );

      setStudents(studentsRes.data.students || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  // =========================
  // Clock
  // =========================

  useEffect(() => {

    const interval = setInterval(() => {

      setTime(
        new Date().toLocaleTimeString()
      );

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };

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
            className="active"
            onClick={() => {
              navigate("/faculty/dashboard");
              setMenuOpen(false);
            }}
          >
            🏠 Dashboard
          </li>

          <li
            onClick={() => {
              navigate("/faculty/attendance");
              setMenuOpen(false);
            }}
          >
            📊 Attendance
          </li>

          <li
            onClick={() => {
              navigate("/faculty/profile");
              setMenuOpen(false);
            }}
          >
            👤 Profile
          </li>

          <li
            onClick={() => {
              handleLogout();
            }}
          >
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

      {/* Main */}

      <div className="main">

        {/* Navbar */}

        <div className="navbar">

          <div className="left-nav">

            <button
              className="menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            <div>

              <h2>Faculty Dashboard</h2>

              <p>{date}</p>

            </div>

          </div>

          <div className="nav-right">

            <button
              className="theme-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="profile">

              <img
                src={
                  profile.profileImage
                    ? `https://classattendanceportal-production.up.railway.app${profile.profileImage}`
                    : "https://i.pravatar.cc/80?img=12"
                }
                alt="Faculty"
              />

              <div>

                <h4>{profile.name}</h4>

                <span>{time}</span>

              </div>

            </div>

          </div>

        </div>

        {/* Welcome */}

        <div className="welcome-card">

          <h1>
            Welcome {profile.name} 👨‍🏫
          </h1>

          <p>
            Manage student attendance, subjects and reports
            from one place.
          </p>

        </div>

        {/* Statistics */}

        <div className="cards">

          <div className="card blue">

            <h3>Total Students</h3>

            <h1>
              {students.length}
            </h1>

            <span>
              👨‍🎓 Registered Students
            </span>

          </div>

          <div className="card green">

            <h3>Present Today</h3>

            <h1>
              {presentCount}
            </h1>

            <span>
              ✅ Attendance Marked
            </span>

          </div>

          <div className="card yellow">

            <h3>Total Subjects</h3>

            <h1>
              {subjects.length}
            </h1>

            <span>
              📚 Assigned Subjects
            </span>

          </div>

          <div className="card red">

            <h3>Pending</h3>

            <h1>
              {pendingCount}
            </h1>

            <span>
              ⏳ Attendance Remaining
            </span>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/faculty/attendance")
            }
          >
            📊 Take Attendance
          </button>

          <button
            onClick={() =>
              navigate("/faculty/profile")
            }
          >
            👤 My Profile
          </button>

        </div>

      </div>

    </div>

  );
}

