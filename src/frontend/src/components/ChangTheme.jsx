// src/components/ChangeTheme.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

const ChangeTheme = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 shadow-sm border
        ${
            isDark
                ? "bg-slate-700 border-slate-600 text-yellow-400 hover:bg-slate-600"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
            title="Toggle Theme"
        >
            {isDark ? (
                // Sun Icon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            ) : (
                // Moon Icon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            )}
        </button>
    );
};

export default ChangeTheme;
