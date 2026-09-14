import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./Login.css";

function Login() {

  const { role } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      // Student
      if (res.data.user.role === "student") {
        navigate("/student-dashboard");
      }

      // Faculty
      else if (res.data.user.role === "faculty") {
        navigate("/faculty/dashboard");
      }

      // Admin
      else if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      }

    } catch (err) {

      console.log("Login Error:", err);

      alert(
        err.response?.data?.message ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  const loginRole = role
    ? role.toUpperCase()
    : "USER";

  return (

    <div className="login-container">

      <div className="login-box">

        <h1>{loginRole} LOGIN</h1>

        <p>Welcome Back</p>

        <form onSubmit={login}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <span
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👁"}
            </span>

          </div>

          <div className="forgot">

            <span
              onClick={() =>
                navigate("/forgot-password")
              }
            >
              Forgot Password?
            </span>

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate("/role-selection")
            }
          >
            Back
          </button>

        </form>

      </div>

    </div>

  );
}

export default Login;