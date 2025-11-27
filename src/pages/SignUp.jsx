// src/pages/SignUp.jsx
import React from "react";
import UseSignUp from "../hooks/UseSignup";
import ChangeTheme from "../components/ChangTheme"; // Import component cũ
import { EyeIcon, EyeOffIcon } from "../components/Icon"; // Import component cũ
import { Link } from "react-router-dom";

const SignUp = () => {
    const {
        register,
        handleSubmit,
        errors,
        isDarkMode,
        toggleTheme,
        isLoading,
        showPassword,
        togglePassword,
        showConfirmPassword,
        toggleConfirmPassword,
        onSubmit,
    } = UseSignUp();

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Nút đổi Theme */}
            <div className="absolute top-6 right-6">
                <ChangeTheme />
            </div>

            {/* Card Container */}
            <div className="bg-white dark:bg-[#1E293B] p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none w-full max-w-[480px] transition-colors duration-300 border border-transparent dark:border-slate-700">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <span className="text-white text-xl font-bold">P</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        Create Account
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Sign up to get started with Planora
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* 1. Account Field */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Account
                        </label>
                        <input
                            {...register("account")}
                            type="text"
                            placeholder="Choose your account name"
                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                    ${
                                        errors.account
                                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                            : "border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    }`}
                        />
                        {errors.account && (
                            <p className="text-red-500 text-xs ml-1">
                                {errors.account.message}
                            </p>
                        )}
                    </div>

                    {/* 2. Password Field */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                        ${
                                            errors.password
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        }`}
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs ml-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* 3. Confirm Password Field */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                        ${
                                            errors.confirmPassword
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        }`}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPassword}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon />
                                ) : (
                                    <EyeIcon />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs ml-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                        {!isLoading && (
                            // Icon User Plus
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
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" x2="20" y1="8" y2="14" />
                                <line x1="23" x2="17" y1="11" y2="11" />
                            </svg>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
