// src/hooks/UseForgotPassword.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

// Schema: Email + OTP + New Password + Confirm
const forgotSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email")
      .email("Invalid email format"),

    otp: z.string().trim().min(1, "Please enter OTP code"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Need at least 1 uppercase letter")
      .regex(/[0-9]/, "Need at least 1 number"),

    confirmPassword: z.string().min(1, "Please confirm new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const UseForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isLoading, error, clearError } =
    useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: "all",
  });

  const togglePass = () => setShowPass(!showPass);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  // Send OTP to email
  const handleSendOTP = async () => {
    clearError();
    const email = getValues("email");
    if (!email) {
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setOtpSent(true);
      setCurrentEmail(email);
      alert(result.message || "OTP sent to your email");
    }
  };

  // Submit reset password with OTP
  const onSubmit = async (data) => {
    clearError();
    const result = await resetPassword(data.email, data.otp, data.password);

    if (result.success) {
      alert(result.message || "Password reset successfully!");
      navigate("/signin");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    apiError: error,
    isLoading,
    showPass,
    togglePass,
    showConfirm,
    toggleConfirm,
    otpSent,
    handleSendOTP,
    onSubmit,
  };
};

export default UseForgotPassword;
