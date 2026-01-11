// src/App.jsx
import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./stores/useAuthStore";
// Import trang
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Layout from "./layouts/Layout";
import LoginConfirm from "./components/LoginConfirm";
import ProtectedRoute from "./components/ProtectedRoute";
import Projects from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";
import FavoriteProjects from "./pages/FavoriteProjects";
import Issues from "./pages/Issue";
import UserManagement from "./pages/Admin/UserManagement";

const COLOR_MAP = {
  Blue: "#2563eb", // blue-600
  Purple: "#9333ea", // purple-600
  Green: "#16a34a", // green-600
  Orange: "#f97316", // orange-500
  Pink: "#ec4899", // pink-500
};

// Component to handle default redirect based on user role
const DefaultRedirect = () => {
  const { user } = useAuthStore();
  const redirectPath = user?.role === "admin" ? "/users" : "/dashboard";
  return <Navigate to={redirectPath} replace />;
};

function App() {
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");

    if (savedSettings) {
      const { darkMode, accentColor } = JSON.parse(savedSettings);

      // A. Xử lý Dark Mode
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // B. Xử lý Accent Color (Màu chủ đạo)
      const colorHex = COLOR_MAP[accentColor] || COLOR_MAP.Blue;
      // Gán giá trị màu vào biến CSS --primary
      document.documentElement.style.setProperty("--primary", colorHex);
    } else {
      // Mặc định là Blue nếu chưa cài đặt
      document.documentElement.style.setProperty("--primary", COLOR_MAP.Blue);
    }
  }, []); // Chạy 1 lần khi web load

  return (
    <>
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Private */}
          <Route element={<LoginConfirm />}>
            <Route element={<Layout />}>
              {/* Default: Dashboard */}
              <Route path="/" element={<DefaultRedirect />} />
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Profile */}
              <Route path="/profile" element={<Profile />} />

              {/* TODO: Thiết kế xong chuyển element thành giống Dashboard */}

              {/* Other pages */}
              {/* Admin Only - User Management */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* User Only - Regular Pages (excluding admin) */}
              <Route
                path="/team"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang Team
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <FavoriteProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/backlog"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang Backlog
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sprints"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang Sprints
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issues"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <Issues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/work_log"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang Worklog
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risks"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang Risk
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <div className="text-slate-800 dark:text-white">
                      Trang settings
                    </div>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        progressClassName="toastProgress"
      />
    </>
  );
}

export default App;
