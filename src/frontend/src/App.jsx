// src/App.jsx
import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
// Import trang
import SignIn from "./pages/signin";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Layout from "./layouts/Layout";
import LoginConfirm from "./components/LoginConfirm";

const COLOR_MAP = {
    Blue: '#2563eb',   
    Purple: '#9333ea', 
    Green: '#16a34a',  
    Orange: '#f97316', 
    Pink: '#ec4899',   
};

function App() {
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

                        {}

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
                            element={
                                <div className="text-slate-800 dark:text-white">
                                    Trang Projects
                                </div>
                            }
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
