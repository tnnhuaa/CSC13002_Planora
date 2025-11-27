// src/pages/ForgotPassword.jsx
import React from "react";
import UseForgotPassword from "../hooks/UseForgotPassword";
import ChangeTheme from "../components/ChangTheme";
import { EyeIcon, EyeOffIcon, KeyIcon } from "../components/Icon"; // Nhớ import KeyIcon
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        errors,
        isLoading,
        showPass,
        togglePass,
        showConfirm,
        toggleConfirm,
        onSubmit,
    } = UseForgotPassword();

    return (
        <div className="min-h-screen bg-[#F3F5F9] dark:bg-[#0F172A] flex items-center justify-center relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 px-4">
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <ChangeTheme />
            </div>

            <div className="bg-white dark:bg-[#1E293B] p-6 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none w-full max-w-[480px] border border-transparent dark:border-slate-700">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        {/* Icon Ổ khóa reset */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        Reset Password
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Enter account & new password to reset
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* 1. Account Input */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold ml-1">
                            Account
                        </label>
                        <input
                            {...register("account")}
                            type="text"
                            placeholder="Enter your account"
                            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                ${
                                    errors.account
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 dark:border-slate-600 focus:border-blue-500"
                                }`}
                        />
                        {errors.account && (
                            <p className="text-red-500 text-xs ml-1">
                                {errors.account.message}
                            </p>
                        )}
                    </div>

                    {/* 2. New Password */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPass ? "text" : "password"}
                                placeholder="Create new password"
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                    ${
                                        errors.password
                                            ? "border-red-500 ring-1 ring-red-500"
                                            : "border-slate-200 dark:border-slate-600 focus:border-blue-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={togglePass}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showPass ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs ml-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* 3. Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#28344B] text-sm outline-none transition-all placeholder:text-slate-400
                                    ${
                                        errors.confirmPassword
                                            ? "border-red-500 ring-1 ring-red-500"
                                            : "border-slate-200 dark:border-slate-600 focus:border-blue-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirm}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                        {!isLoading && <KeyIcon />}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <Link
                        to="/signin"
                        className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 text-sm"
                    >
                        Cancel & Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
