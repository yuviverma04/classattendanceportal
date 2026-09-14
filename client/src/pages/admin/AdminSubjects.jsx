import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminSubjects.css";

function AdminSubjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    subjectCode: "",
    subjectName: "",
    semester: "",
    branch: "",
    faculty: "",
  });

  // =========================
  // GET SUBJECTS
  // =========================

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const res = await API.get("/subjects");

      if (res.data.success) {
        setSubjects(res.data.subjects);
      }
    } catch (error) {
      console.error("Subject Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET FACULTY
  // =========================

  const fetchFaculty = async () => {
    try {
      const res = await API.get("/faculty");

      if (res.data.success) {
        setFaculty(res.data.faculty);
      }
    } catch (error) {
      console.error("Faculty Error:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
  }, []);

  // =========================
  // INPUT
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD
  // =========================

  const openAddModal = () => {
    setEditMode(false);
    setSelectedId(null);

    setForm({
      subjectCode: "",
      subjectName: "",
      semester: "",
      branch: "",
      faculty: "",
    });

    setShowModal(true);
  };

  // =========================
  // EDIT
  // =========================

  const openEditModal = (subject) => {
    setEditMode(true);
    setSelectedId(subject._id);

    setForm({
      subjectCode: subject.subjectCode || "",
      subjectName: subject.subjectName || "",
      semester: subject.semester || "",
      branch: subject.branch || "",
      faculty: subject.faculty?._id || "",
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
          subjectCode: form.subjectCode,
          subjectName: form.subjectName,
          semester: form.semester,
          branch: form.branch,
        };

        const res = await API.put(
          `/subjects/${selectedId}`,
          updateData
        );

        if (res.data.success) {
          alert("Subject Updated Successfully");
        }

        // Update faculty separately
        if (form.faculty) {
          await API.put(
            `/subjects/assign/${selectedId}`,
            {
              facultyId: form.faculty,
            }
          );
        }
      } else {
        const res = await API.post("/subjects", {
          subjectCode: form.subjectCode,
          subjectName: form.subjectName,
          semester: form.semester,
          branch: form.branch,
          faculty: form.faculty || null,
        });

        if (res.data.success) {
          alert("Subject Added Successfully");
        }
      }

      setShowModal(false);
      fetchSubjects();

    } catch (error) {
      console.error("Subject Save Error:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteSubject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmDelete) return;

    try {
      const res = await API.delete(
        `/subjects/${id}`
      );

      if (res.data.success) {
        alert("Subject Deleted Successfully");
        fetchSubjects();
      }
    } catch (error) {
      console.error("Delete Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete subject"
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredSubjects = subjects.filter(
    (subject) =>
      `${subject.subjectCode} ${
        subject.subjectName
      } ${subject.semester} ${
        subject.branch
      } ${subject.faculty?.name || ""}`
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
        ? `http://localhost:5000${imagePath}`
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

          <li
            onClick={() => {
              setMenuOpen(false);
              navigate("/admin/faculty");
            }}
          >
            👨‍🏫 Faculty
          </li>

          <li className="active">
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
              <h1>Subjects</h1>

              <p>
                Manage subjects and faculty assignments
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

        <div className="subject-toolbar">

          <div>
            <h2>All Subjects</h2>

            <span>
              {subjects.length} registered subjects
            </span>
          </div>

          <div className="subject-actions">

            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              className="add-subject-btn"
              onClick={openAddModal}
            >
              + Add Subject
            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="subject-table-card">

          {loading ? (

            <div className="subject-loading">
              Loading Subjects...
            </div>

          ) : filteredSubjects.length === 0 ? (

            <div className="no-subject">
              No subjects found
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Subject</th>
                    <th>Semester</th>
                    <th>Branch</th>
                    <th>Faculty</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredSubjects.map(
                    (subject, index) => (

                      <tr key={subject._id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {subject.subjectCode}
                          </strong>
                        </td>

                        <td>
                          {subject.subjectName}
                        </td>

                        <td>
                          {subject.semester}
                        </td>

                        <td>
                          {subject.branch}
                        </td>

                        <td>
                          {subject.faculty?.name ||
                            "Not Assigned"}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(
                                  subject
                                )
                              }
                            >
                              ✏️
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                deleteSubject(
                                  subject._id
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

        <div className="subject-modal-overlay">

          <div className="subject-modal">

            <div className="modal-header">

              <h2>
                {editMode
                  ? "Edit Subject"
                  : "Add Subject"}
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
                Subject Code
              </label>

              <input
                name="subjectCode"
                value={form.subjectCode}
                onChange={handleChange}
                placeholder="Example: CS101"
                required
              />

              <label>
                Subject Name
              </label>

              <input
                name="subjectName"
                value={form.subjectName}
                onChange={handleChange}
                placeholder="Example: Java Programming"
                required
              />

              <label>
                Semester
              </label>

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                placeholder="Example: 6"
                required
              />

              <label>
                Branch
              </label>

              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="Example: CSE"
                required
              />

              <label>
                Assign Faculty
              </label>

              <select
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
              >

                <option value="">
                  -- Select Faculty --
                </option>

                {faculty.map((teacher) => (

                  <option
                    key={teacher._id}
                    value={teacher._id}
                  >
                    {teacher.name}
                  </option>

                ))}

              </select>

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
                    ? "Update Subject"
                    : "Add Subject"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminSubjects;