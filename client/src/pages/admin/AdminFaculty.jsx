import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminFaculty.css";

function AdminFaculty() {
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
  });

  // =========================
  // GET FACULTY
  // =========================

  const fetchFaculty = async () => {
    try {
      setLoading(true);

      const res = await API.get("/faculty");

      if (res.data.success) {
        setFaculty(res.data.faculty);
      }
    } catch (error) {
      console.error("Faculty Error:", error);

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
    fetchFaculty();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD MODAL
  // =========================

  const openAddModal = () => {
    setEditMode(false);
    setSelectedId(null);

    setForm({
      name: "",
      email: "",
      password: "",
      subject: "",
    });

    setShowModal(true);
  };

  // =========================
  // EDIT MODAL
  // =========================

  const openEditModal = (teacher) => {
    setEditMode(true);
    setSelectedId(teacher._id);

    setForm({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "",
      subject: teacher.subject || "",
    });

    setShowModal(true);
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        const updateData = {
          name: form.name,
          email: form.email,
          subject: form.subject,
        };

        const res = await API.put(
          `/faculty/${selectedId}`,
          updateData
        );

        if (res.data.success) {
          alert("Faculty Updated Successfully");
        }
      } else {
        const res = await API.post("/faculty", {
          name: form.name,
          email: form.email,
          password: form.password,
          subject: form.subject,
        });

        if (res.data.success) {
          alert("Faculty Added Successfully");
        }
      }

      setShowModal(false);
      fetchFaculty();

    } catch (error) {
      console.error("Faculty Save Error:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteFaculty = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this faculty?"
    );

    if (!confirmDelete) return;

    try {
      const res = await API.delete(
        `/faculty/${id}`
      );

      if (res.data.success) {
        alert("Faculty Deleted Successfully");
        fetchFaculty();
      }

    } catch (error) {
      console.error("Delete Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete faculty"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredFaculty = faculty.filter(
    (teacher) =>
      `${teacher.name} ${teacher.email} ${
        teacher.subject || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const getImageUrl = (imagePath) =>
    imagePath?.startsWith("http")
      ? imagePath
      : imagePath
        ? `https://classattendanceportal.onrender.com${imagePath}`
        : "https://i.pravatar.cc/80?img=12";

  return (
    <div className="admin-dashboard">

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

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/dashboard");
            }}
          >
            🏠 Dashboard
          </li>

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/students");
            }}
          >
            👨‍🎓 Students
          </li>

          <li className="active">
            👨‍🏫 Faculty
          </li>

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/subjects");
            }}
          >
            📚 Subjects
          </li>

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/attendance");
            }}
          >
            📊 Attendance
          </li>

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/profile");
            }}
          >
            👤 Profile
          </li>

          <li onClick={logout}>
            🚪 Logout
          </li>

        </ul>

      </aside>

      {/* MAIN */}

      <main className="admin-main">

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
              <h1>Faculty</h1>

              <p>
                Manage all faculty members
              </p>
            </div>
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

        {/* TOOLBAR */}

        <div className="faculty-toolbar">

          <div>
            <h2>All Faculty</h2>

            <span>
              {faculty.length} registered faculty
            </span>
          </div>

          <div className="faculty-actions">

            <input
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              className="add-faculty-btn"
              onClick={openAddModal}
            >
              + Add Faculty
            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="faculty-table-card">

          {loading ? (

            <div className="faculty-loading">
              Loading Faculty...
            </div>

          ) : filteredFaculty.length === 0 ? (

            <div className="no-faculty">
              No faculty found
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Faculty</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredFaculty.map(
                    (teacher, index) => (

                      <tr key={teacher._id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="faculty-info">

                            <img
                              src={
                                teacher.profileImage ||
                                "https://i.pravatar.cc/80?img=12"
                              }
                              alt={teacher.name}
                            />

                            <strong>
                              {teacher.name}
                            </strong>

                          </div>

                        </td>

                        <td>
                          {teacher.email}
                        </td>

                        <td>
                          {teacher.subject || "-"}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(
                                  teacher
                                )
                              }
                            >
                              ✏️
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                deleteFaculty(
                                  teacher._id
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

      </main>

      {/* MODAL */}

      {showModal && (

        <div className="faculty-modal-overlay">

          <div className="faculty-modal">

            <div className="modal-header">

              <h2>
                {editMode
                  ? "Edit Faculty"
                  : "Add Faculty"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter faculty name"
                required
              />

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />

              {!editMode && (
                <>
                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </>
              )}

              <label>
                Subject
              </label>

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                required
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editMode
                    ? "Update Faculty"
                    : "Add Faculty"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminFaculty;