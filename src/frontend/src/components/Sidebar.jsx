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
  StarIcon,
} from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { generateAvatarColor, getAvatarInitial } from "../utils/avatarUtils";

const Sidebar = ({ isOpen, toggleSidebar, onOpenSettings }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const avatarColor = generateAvatarColor(user?.username);
  const avatarInitial = getAvatarInitial(user?.username);

  // Helper render từng mục menu
  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium
        ${
          isActive
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-500"
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
        {/* 1. Header: Brand Logo & Name */}
        <div className="px-6 py-6 flex items-center gap-3">
          {/* --- LOGO P --- */}
          <div className="relative shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/30 overflow-hidden">
            {/* Hiệu ứng bóng sáng nhẹ trên logo */}
            <div className="absolute top-0 right-0 w-5 h-5 bg-white opacity-20 blur-lg rounded-full transform translate-x-1 -translate-y-1"></div>

            {/* Chữ P cách điệu */}
            <span className="font-sans text-2xl font-extrabold text-white leading-none select-none drop-shadow-md">
              P
            </span>
          </div>

          {/* --- TÊN PROJECT --- */}
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none tracking-tight font-sans truncate">
              Planora
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              {/* Dấu chấm xanh online */}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                Team Group 11
              </span>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
          {/* Group: Navigation */}
          {user?.role === "user" && (
            <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Management
            </p>
            <div className="space-y-1">
              <NavItem
                to="/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
              />
            </div>
          </div>
          )}
          
          {/* Admin Only - User Management */}
          {user?.role === "admin" && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Management
              </p>
              <NavItem to="/users" icon={Users} label="Users" />
            </div>
          )}

          {/* Group: Private - Role-based menu items */}
          {/* User Only - Regular Pages */}
          {user?.role === "user" && (
            <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Private
            </p>
            <div className="space-y-1">
                <>
                  <NavItem to="/favorites" icon={StarIcon} label="Favorite" />
                  <NavItem to="/projects" icon={Folder} label="Projects" />
                  <NavItem to="/issues" icon={CheckSquare} label="Issues" />
                  {/* <NavItem to="/favorites" icon={StarIcon} label="Favorites Projects" /> */}
                  {/* <NavItem to="/backlog" icon={ListTodo} label="Backlog" />
                  <NavItem to="/sprints" icon={Calendar} label="Sprints" />
                  <NavItem to="/work_log" icon={Clock} label="Work Log" />
                  <NavItem to="/risks" icon={AlertTriangle} label="Risks" /> */}
                </>
              
            </div>
          </div>
          )}

          {/* Group: Collapsible (Favorites & Projects) */}
          {/* <div className="space-y-4">
            <button className="flex items-center justify-between w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2 text-sm font-medium">
              <span>Favorites</span>
              <ChevronRight size={16} />
            </button>
            <button className="flex items-center justify-between w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2 text-sm font-medium">
              <span>Projects</span>
              <ChevronRight size={16} />
            </button>
          </div> */}
        </div>

        {/* 3. Footer: Profile & Settings (Sticky Bottom) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          {/* Profile Section */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-500 cursor-pointer"
          >
            {/* Avatar Circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {avatarInitial}
            </div>
            {/* Username */}
            <span className="truncate flex-1">{user?.username || "User"}</span>
          </div>

          {/* Nút Settings */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-500 cursor-pointer"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          {/* 👇 Nút Logout mới */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400  cursor-pointer"
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
