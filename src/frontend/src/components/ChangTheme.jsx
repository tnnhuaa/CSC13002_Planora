// src/components/ChangeTheme.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

const ChangeTheme = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-8 w-16 rounded-full transition-all duration-300 shadow-lg border-2 ${
                isDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-blue-400 border-blue-300"
            }`}
            title="Toggle Theme"
        >
            {/* Toggle Circle */}
            <div
                className={`absolute h-7 w-7 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
                    isDark
                        ? "translate-x-8 bg-slate-700"
                        : "translate-x-0.5 bg-white"
                }`}
            >
                {isDark ? (
                    // Moon Icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-400"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                ) : (
                    // Sun Icon
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-yellow-400"
                    >
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                )}
            </div>
        </button>
    );
};

export default ChangeTheme;
