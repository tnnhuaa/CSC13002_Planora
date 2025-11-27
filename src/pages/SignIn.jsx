// SignIn.jsx
import React from "react";
import UseSignIn from "../hooks/UseSignIn";
import ChangeTheme from "../components/ChangTheme";
import { EyeIcon, EyeOffIcon } from "../components/Icon";
import { Link } from "react-router-dom";

const SignIn = () => {
    const {
        register,
        handleSubmit,
        errors,

        apiError,
        showPassword,
        isLoading,
        isDarkMode,

        // Actions
        toggleTheme,
        togglePasswordVisibility,
        onSubmit,
    } = UseSignIn();

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 px-4">
            {/* Nút ChangeTheme */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <ChangeTheme />
            </div>

            {/* Card Form */}
            <div className="bg-white dark:bg-[#1E293B] p-6 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none w-full max-w-[480px] transition-colors duration-300 border border-transparent dark:border-slate-700">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <span className="text-white text-xl font-bold">P</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        Welcome to Planora
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Sign in to continue to your workspace
                    </p>
                </div>

                {/* Form  */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Account Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Account
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Enter your account"
                                {...register("account")}
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500
                                        ${
                                            errors.account
                                                ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                                                : "border-slate-200 dark:border-slate-600 focus:ring-blue-500/50 focus:border-blue-500"
                                        }`}
                            />
                        </div>
                        {/* Hiển thị lỗi Zod */}
                        {errors.account && (
                            <p className="text-red-500 text-xs ml-1 font-medium">
                                {errors.account.message}
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...register("password")}
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500
                                        ${
                                            errors.password
                                                ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                                                : "border-slate-200 dark:border-slate-600 focus:ring-blue-500/50 focus:border-blue-500"
                                        }`}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {/* Hiển thị lỗi Zod */}
                        {errors.password && (
                            <p className="text-red-500 text-xs ml-1 font-medium">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Error Message (Lỗi chung từ API) */}
                    {apiError && (
                        <p className="text-red-500 dark:text-red-400 text-xs text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                            {apiError}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                        {!isLoading && (
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
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
