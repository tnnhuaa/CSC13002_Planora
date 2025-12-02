// src/App.jsx
import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
// Import trang
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Layout from "./layouts/Layout";
import LoginConfirm from "./components/LoginConfirm";
import Projects from "./pages/Project";

const COLOR_MAP = {
    Blue: '#2563eb',   // blue-600
    Purple: '#9333ea', // purple-600
    Green: '#16a34a',  // green-600
    Orange: '#f97316', // orange-500
    Pink: '#ec4899',   // pink-500
};

function App() {
    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        
        if (savedSettings) {
            const { darkMode, accentColor } = JSON.parse(savedSettings);

            // A. Xử lý Dark Mode
            if (darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // B. Xử lý Accent Color (Màu chủ đạo)
            const colorHex = COLOR_MAP[accentColor] || COLOR_MAP.Blue;
            // Gán giá trị màu vào biến CSS --primary
            document.documentElement.style.setProperty('--primary', colorHex);
        } else {
            // Mặc định là Blue nếu chưa cài đặt
             document.documentElement.style.setProperty('--primary', COLOR_MAP.Blue);
        }
    }, []); // Chạy 1 lần khi web load

    return (
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
                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                        />
                        {/* Dashboard */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* TODO: Thiết kế xong chuyển element thành giống Dashboard */}

                        {/* Other pages */}
                        <Route
                            path="/team"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Team
                                </div>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Users
                                </div>
                            }
                        />
                        <Route
                            path="/projects"
                            element={<Projects />}
                        />
                        <Route
                            path="/backlog"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Backlog
                                </div>
                            }
                        />
                        <Route
                            path="/sprints"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Sprints
                                </div>
                            }
                        />
                        <Route
                            path="/tasks"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Tasks
                                </div>
                            }
                        />
                        <Route
                            path="/work_log"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Worklog
                                </div>
                            }
                        />
                        <Route
                            path="/risks"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Ris
                                </div>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang settings
                                </div>
                            }
                        />
                    </Route>
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
