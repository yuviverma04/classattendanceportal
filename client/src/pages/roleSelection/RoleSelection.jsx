import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-container">

      <div className="role-box">

        <h1>Select Your Role</h1>
        <p>Choose how you want to continue</p>

        <div className="role-cards">

          <div
            className="role-card"
            onClick={() => navigate("/login/student")}
          >
            <div className="icon">🎓</div>
            <h2>Student</h2>
            <p>View Attendance</p>
          </div>

          <div
            className="role-card"
            onClick={() => navigate("/login/faculty")}
          >
            <div className="icon">👨‍🏫</div>
            <h2>Faculty</h2>
            <p>Mark Attendance</p>
          </div>

          <div
            className="role-card"
            onClick={() => navigate("/login/admin")}
          >
            <div className="icon">🛡️</div>
            <h2>Admin</h2>
            <p>Manage Portal</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default RoleSelection;