import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
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
    rollNumber: "",
    branch: "",
    semester: "",
  });

  // =========================
  // FETCH STUDENTS
  // =========================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/students");

      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (error) {
      console.error("Students Error:", error);

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
    fetchStudents();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // OPEN ADD
  // =========================

  const openAddModal = () => {
    setEditMode(false);
    setSelectedId(null);

    setForm({
      name: "",
      email: "",
      password: "",
      rollNumber: "",
      branch: "",
      semester: "",
    });

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const openEditModal = (student) => {
    setEditMode(true);
    setSelectedId(student._id);

    setForm({
      name: student.name || "",
      email: student.email || "",
      password: "",
      rollNumber: student.rollNumber || "",
      branch: student.branch || "",
      semester: student.semester || "",
    });

    setShowModal(true);
  };

  // =========================
  // ADD / EDIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        const updateData = {
          name: form.name,
          email: form.email,
          rollNumber: form.rollNumber,
          branch: form.branch,
          semester: form.semester,
        };

        // Password only if entered
        if (form.password.trim()) {
          updateData.password = form.password;
        }

        const res = await API.put(
          `/students/${selectedId}`,
          updateData
        );

        if (res.data.success) {
          alert("Student Updated Successfully");
        }
      } else {
        const res = await API.post("/students", {
          name: form.name,
          email: form.email,
          password: form.password,
          rollNumber: form.rollNumber,
          branch: form.branch,
          semester: form.semester,
        });

        if (res.data.success) {
          alert("Student Added Successfully");
        }
      }

      setShowModal(false);
      fetchStudents();

    } catch (error) {
      console.error("Student Save Error:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const res = await API.delete(
        `/students/${id}`
      );

      if (res.data.success) {
        alert("Student Deleted Successfully");
        fetchStudents();
      }
    } catch (error) {
      console.error("Delete Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredStudents = students.filter(
    (student) =>
      `${student.name} ${student.email} ${
        student.rollNumber || ""
      } ${student.branch || ""}`
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

      {/* ================= SIDEBAR ================= */}

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

          <li className="active">
            👨‍🎓 Students
          </li>

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/faculty");
            }}
          >
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

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* NAVBAR */}

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
              <h1>Students</h1>

              <p>
                Manage all registered students
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

        {/* ================= TOOLBAR ================= */}

        <div className="students-toolbar">

          <div>
            <h2>All Students</h2>

            <span>
              {students.length} registered students
            </span>
          </div>

          <div className="student-actions">

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              className="add-student-btn"
              onClick={openAddModal}
            >
              + Add Student
            </button>

          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="students-table-card">

          {loading ? (

            <div className="students-loading">
              Loading Students...
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="no-students">
              No students found
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredStudents.map(
                    (student, index) => (

                      <tr key={student._id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="student-info">

                            <img
                              src={
                                student.profileImage ||
                                "https://i.pravatar.cc/80?img=3"
                              }
                              alt={student.name}
                            />

                            <strong>
                              {student.name}
                            </strong>

                          </div>

                        </td>

                        <td>
                          {student.email}
                        </td>

                        <td>
                          {student.rollNumber || "-"}
                        </td>

                        <td>
                          {student.branch || "-"}
                        </td>

                        <td>
                          {student.semester || "-"}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(student)
                              }
                            >
                              ✏️
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                deleteStudent(
                                  student._id
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

      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            <div className="modal-header">

              <h2>
                {editMode
                  ? "Edit Student"
                  : "Add Student"}
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
                placeholder="Enter student name"
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

              <label>
                Password
                {editMode && (
                  <small>
                    {" "}
                    (leave empty to keep current)
                  </small>
                )}
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editMode
                    ? "New password (optional)"
                    : "Enter password"
                }
                required={!editMode}
              />

              <label>
                Roll Number
              </label>

              <input
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                placeholder="Enter roll number"
                required
              />

              <label>
                Branch
              </label>

              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="Enter branch"
                required
              />

              <label>
                Semester
              </label>

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="Enter semester"
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
                    ? "Update Student"
                    : "Add Student"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminStudents;