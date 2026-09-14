import { Routes, Route } from "react-router-dom";

import Splash from "../pages/splash/Splash";
import RoleSelection from "../pages/roleSelection/RoleSelection";
import Login from "../pages/login/Login";

import ForgotPassword from "../pages/forgotPassword/ForgotPassword";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";

import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import FacultyAttendance from "../pages/faculty/FacultyAttendance";
import FacultyProfile from "../pages/faculty/FacultyProfile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminFaculty from "../pages/admin/AdminFaculty";
import AdminSubjects from "../pages/admin/AdminSubjects";
import AdminAttendance from "../pages/admin/AdminAttendance";
import AdminProfile from "../pages/admin/AdminProfile";

function AppRoutes() {
  return (
    <Routes>

      {/* Existing Splash Loader */}
      <Route path="/" element={<Splash />} />

      {/* Existing Role Selection */}
      <Route
        path="/role-selection"
        element={<RoleSelection />}
      />

      {/* Login */}
      <Route
        path="/login/:role"
        element={<Login />}
      />

      {/* Forgot Password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student Pages */}
      <Route
        path="/student-dashboard"
        element={<StudentDashboard />}
      />

      <Route
        path="/student/profile"
        element={<StudentProfile />}
      />

      {/* Faculty Pages */}
      <Route
        path="/faculty/dashboard"
        element={<FacultyDashboard />}
      />

      <Route
        path="/faculty/attendance"
        element={<FacultyAttendance />}
      />

      <Route
        path="/faculty/profile"
        element={<FacultyProfile />}
      />

      {/* Admin Pages */}
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/students"
        element={<AdminStudents />}
      />

      <Route
        path="/admin/faculty"
        element={<AdminFaculty />}
      />

      <Route
        path="/admin/subjects"
        element={<AdminSubjects />}
      />

      <Route
        path="/admin/attendance"
        element={<AdminAttendance />}
      />

      <Route
        path="/admin/profile"
        element={<AdminProfile />}
      />

    </Routes>
  );
}

export default AppRoutes;