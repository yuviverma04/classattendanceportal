import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({
    type: "",
    message: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const fetchAdminProfile = async () => {
    try {
      const res = await API.get("/admin/profile");

      console.log("Admin Profile:", res.data);

      if (res.data.success) {
        setAdmin(res.data.admin);
      }
    } catch (error) {
      console.log("Admin Profile Error:", error);

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
    fetchAdminProfile();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    return imagePath.startsWith("http")
      ? imagePath
      : `https://classattendanceportal.onrender.com${imagePath}`;
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await API.put(
        "/admin/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const updatedImage = response.data.profileImage;
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            profileImage: updatedImage,
          })
        );

        setAdmin((currentAdmin) => ({
          ...currentAdmin,
          profileImage: updatedImage,
        }));
        alert(response.data.message || "Profile image updated successfully");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Profile image upload failed"
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setPasswordStatus({ type: "", message: "" });
  };

  const closePasswordForm = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStatus({ type: "", message: "" });
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordStatus({ type: "", message: "" });

    try {
      const response = await API.put(
        "/admin/change-password",
        passwordForm
      );

      setPasswordStatus({
        type: "success",
        message: response.data.message || "Password changed successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to change password. Please try again.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-loading">
          Loading Admin Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">

      {menuOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside className={`admin-sidebar ${menuOpen ? "show" : ""}`}>

        <button
          className="admin-close-btn"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>

        <h2>🎓 CAP</h2>

        <h4>Class Attendance Portal</h4>

        <ul>

          <li onClick={() => { setMenuOpen(false); navigate("/admin/dashboard"); }}>
            🏠 Dashboard
          </li>

          <li onClick={() => { setMenuOpen(false); navigate("/admin/students"); }}>
            👨‍🎓 Students
          </li>

          <li onClick={() => { setMenuOpen(false); navigate("/admin/faculty"); }}>
            👨‍🏫 Faculty
          </li>

          <li onClick={() => { setMenuOpen(false); navigate("/admin/subjects"); }}>
            📚 Subjects
          </li>

          <li onClick={() => { setMenuOpen(false); navigate("/admin/attendance"); }}>
            📊 Attendance
          </li>

          <li
            className="active"
            onClick={() => { setMenuOpen(false); navigate("/admin/profile"); }}
          >
            👤 Profile
          </li>

          <li onClick={logout}>
            🚪 Logout
          </li>

        </ul>

      </aside>

      {/* MAIN */}

      <main className="admin-profile-main">

        {/* HEADER */}

        <div className="admin-navbar">

          <div className="admin-navbar-left">
            <button
              className="admin-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle admin menu"
            >
              ☰
            </button>

            <div>
              <h1>Admin Profile</h1>

              <p>
                View your administrator account details
              </p>
            </div>
          </div>

          <div className="admin-user">

            <img
              src={
                getImageUrl(admin?.profileImage || user.profileImage) ||
                "https://i.pravatar.cc/80?img=12"
              }
              alt="Admin"
            />

            <div>
              <h4>
                {user.name || admin?.name || "Admin"}
              </h4>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </div>

        {/* PROFILE CARD */}

        <div className="admin-profile-card">

          {/* PROFILE TOP */}

          <div className="admin-profile-top">

            <button
              className="admin-profile-avatar"
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="Update admin profile image"
            >

              {admin?.profileImage ? (
                <img
                  src={getImageUrl(admin.profileImage)}
                  alt="Admin"
                />
              ) : (
                <span>
                  {admin?.name
                    ? admin.name.charAt(0).toUpperCase()
                    : "A"}
                </span>
              )}

              <span className="profile-image-edit">
                {uploadingImage ? "Uploading..." : "Change photo"}
              </span>
            </button>

            <input
              ref={imageInputRef}
              className="profile-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleProfileImageChange}
            />

            <div className="admin-profile-heading">

              <h2>
                {admin?.name || "Admin"}
              </h2>

              <p>
                {admin?.email || "Email not available"}
              </p>

              <span className="admin-role-badge">
                🛡️ Administrator
              </span>

            </div>

          </div>

          {/* DETAILS */}

          <div className="admin-profile-section">

            <h3>Personal Information</h3>

            <div className="admin-details-grid">

              <div className="detail-item">

                <span className="detail-label">
                  Full Name
                </span>

                <strong>
                  {admin?.name || "Not Available"}
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Email Address
                </span>

                <strong>
                  {admin?.email || "Not Available"}
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Admin ID
                </span>

                <strong className="admin-id">
                  {admin?._id || "Not Available"}
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Role
                </span>

                <strong>
                  {admin?.role === "admin"
                    ? "Administrator"
                    : admin?.role || "Not Available"}
                </strong>

              </div>

            </div>

          </div>

          {/* ACCOUNT INFORMATION */}

          <div className="admin-profile-section">

            <h3>Account Information</h3>

            <div className="admin-details-grid">

              <div className="detail-item">

                <span className="detail-label">
                  Account Created
                </span>

                <strong>
                  {admin?.createdAt
                    ? new Date(
                        admin.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not Available"}
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Last Updated
                </span>

                <strong>
                  {admin?.updatedAt
                    ? new Date(
                        admin.updatedAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not Available"}
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Account Status
                </span>

                <strong className="status-active">
                  ● Active
                </strong>

              </div>

              <div className="detail-item">

                <span className="detail-label">
                  Access Level
                </span>

                <strong>
                  Full Administrator
                </strong>

              </div>

            </div>

          </div>

          {/* SECURITY */}

          <div className="admin-security-box">

            <div>

              <h3>🔐 Account Security</h3>

              <p>
                Your account is protected with secure
                authentication.
              </p>

            </div>

            <button
              onClick={() => {
                setPasswordStatus({ type: "", message: "" });
                setShowPasswordForm(true);
              }}
            >
              Change Password
            </button>

          </div>

        </div>

      </main>

      {showPasswordForm && (
        <div
          className="password-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordForm();
            }
          }}
        >
          <section
            className="password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            <div className="password-modal-header">
              <div>
                <h2 id="change-password-title">Change Password</h2>
                <p>Use a password with at least 6 characters.</p>
              </div>
              <button
                className="password-modal-close"
                type="button"
                onClick={closePasswordForm}
                disabled={changingPassword}
                aria-label="Close change password dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitPasswordChange}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                autoComplete="new-password"
                required
              />

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                autoComplete="new-password"
                required
              />

              {passwordStatus.message && (
                <p className={`password-status ${passwordStatus.type}`}>
                  {passwordStatus.message}
                </p>
              )}

              <div className="password-modal-actions">
                <button
                  className="password-cancel-btn"
                  type="button"
                  onClick={closePasswordForm}
                  disabled={changingPassword}
                >
                  Cancel
                </button>
                <button
                  className="password-submit-btn"
                  type="submit"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Changing..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

    </div>
  );
}

export default AdminProfile;