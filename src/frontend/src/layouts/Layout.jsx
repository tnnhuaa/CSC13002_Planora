import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex">
            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header (Chỉ hiện trên mobile để mở menu) */}
                <header className="md:hidden bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 sticky top-0 z-20">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg text-slate-800 dark:text-white">
                        Planora
                    </span>
                </header>

                {/* Nội dung trang thay đổi ở đây */}
                <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
