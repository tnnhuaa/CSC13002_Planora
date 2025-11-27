import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Folder,
    ListTodo,
    Calendar,
    CheckSquare,
    Clock,
    AlertTriangle,
    Settings,
    ChevronRight,
    Rocket,
    ChevronDown,
    LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    // Helper render từng mục menu
    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium
        ${
            isActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        }`
            }
        >
            <Icon size={18} />
            <span>{label}</span>
        </NavLink>
    );

    const handleLogout = () => {
        // Zóa thông tin đăng nhập trên local storage
        localStorage.removeItem("userLogin");

        // back to signin
        navigate("/signin");
    };

    return (
        <>
            {/* Overlay cho Mobile (Click ra ngoài để đóng) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Chính */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* 1. Header: Workspace Select */}
                <div className="p-4">
                    <button className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <Rocket size={16} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
                                    Personal Workspace
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    1 members
                                </p>
                            </div>
                        </div>
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>
                </div>

                {/* 2. Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
                    {/* Group: Navigation */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            Navigation
                        </p>
                        <div className="space-y-1">
                            <NavItem
                                to="/dashboard"
                                icon={LayoutDashboard}
                                label="Dashboard"
                            />
                            <NavItem to="/team" icon={Users} label="Team" />
                        </div>
                    </div>

                    {/* Group: Management */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            Management
                        </p>
                        <div className="space-y-1">
                            <NavItem to="/users" icon={Users} label="Users" />
                            <NavItem
                                to="/projects"
                                icon={Folder}
                                label="Projects"
                            />
                            <NavItem
                                to="/backlog"
                                icon={ListTodo}
                                label="Backlog"
                            />
                            <NavItem
                                to="/sprints"
                                icon={Calendar}
                                label="Sprints"
                            />
                            <NavItem
                                to="/tasks"
                                icon={CheckSquare}
                                label="Tasks"
                            />
                            <NavItem
                                to="/work_log"
                                icon={Clock}
                                label="Work Log"
                            />
                            <NavItem
                                to="/risks"
                                icon={AlertTriangle}
                                label="Risks"
                            />
                        </div>
                    </div>

                    {/* Group: Collapsible (Favorites & Projects) */}
                    <div className="space-y-4">
                        <button className="flex items-center justify-between w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2 text-sm font-medium">
                            <span>Favorites</span>
                            <ChevronRight size={16} />
                        </button>
                        <button className="flex items-center justify-between w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2 text-sm font-medium">
                            <span>Projects</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* 3. Footer: Settings (Sticky Bottom) */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    {/* Nút Settings */}
                    <NavItem to="/settings" icon={Settings} label="Settings" />

                    {/* 👇 Nút Logout mới */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
