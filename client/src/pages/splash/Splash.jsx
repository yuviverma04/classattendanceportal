import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate("/role-selection");
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="splash-container">

      <div className="splash-card">

        <div className="logo">
          <p>🎓</p>
        </div>

        <h1>Class Attendance Portal</h1>

        <p>Digital Attendance Management System</p>

        <div className="progress-box">

          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>

        </div>

        <h3>{progress}%</h3> 

        <span>Loading...</span>

      </div>

    </div>
  );
}

export default Splash;