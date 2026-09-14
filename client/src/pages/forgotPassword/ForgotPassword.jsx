import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const sendOTP = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await API.post("/auth/forgot-password", {
                email,
            });

            if (res.data.success) {
                setMessage("OTP sent successfully to your email.");
                setStep(2);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6 digit OTP");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await API.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
                confirmPassword: newPassword, // IMPORTANT
            });

            if (res.data.success) {
                setMessage("Password reset successfully.");

                setTimeout(() => {
                    navigate("/");
                }, 1500);
            }
        } catch (err) {
            console.error("Reset Password Error:", err);

            setError(
                err.response?.data?.message ||
                "Invalid OTP or password reset failed."
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="forgot-page">

            <div className="forgot-card">

                <div className="forgot-logo">
                    <img src="/src/assets/images/Picsart_26-09-03_23-34-42-203.png" alt="" />
                </div>

                <h1>Forgot Password?</h1>

                <p className="forgot-subtitle">
                    Reset your Class Attendance Portal password
                </p>

                {step === 1 && (
                    <form onSubmit={sendOTP}>

                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>

                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={resetPassword}>

                        <label>OTP</label>

                        <input
                            type="text"
                            placeholder="Enter 6 digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            required
                        />

                        <label>New Password</label>

                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength="6"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                    </form>
                )}

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <button
                    className="back-login"
                    onClick={() => navigate("/")}
                >
                    ← Back to Login
                </button>

            </div>

        </div>
    );
}

export default ForgotPassword;