// src/hooks/UseSignUp.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { showToast } from "../utils/toastUtils";

// Schema Validation
const signUpSchema = z
  .object({
    account: z
      .string()
      .trim()
      .min(3, "Account name must be at least 3 characters")
      .max(20, "Account name must not exceed 20 characters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email format"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const UseSignUp = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "all",
  });

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const onSubmit = async (data) => {
    clearError();
    const result = await signup(data.account, data.email, data.password);

    if (result.success) {
      showToast.success(result.message || "Account created successfully!");
      navigate("/signin");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    apiError: error,
    isLoading,
    showPassword,
    togglePassword,
    showConfirmPassword,
    toggleConfirmPassword,
    onSubmit,
  };
};

export default UseSignUp;
