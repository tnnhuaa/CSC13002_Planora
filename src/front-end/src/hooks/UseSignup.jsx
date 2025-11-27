// src/hooks/UseSignUp.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// 1. Định nghĩa Schema Validation
const signUpSchema = z
    .object({
        account: z
            .string()
            .trim()
            .min(3, "Account name must be at least 3 characters")
            .max(20, "Account name must not exceed 20 characters"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
            // Check chữ hoa
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter"
            )
            // Check số
            .regex(/[0-9]/, "Password must contain at least one number"),

        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // Gán lỗi vào field confirmPassword
    });

const UseSignUp = () => {
    const navigate = useNavigate();

    // --- UI State ---
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(signUpSchema),
        mode: "all", // Validate ngay khi gõ/blur
    });

    // --- Actions ---
    const togglePassword = () => setShowPassword((prev) => !prev);
    const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const onSubmit = (data) => {
        setIsLoading(true);
        // Giả lập call API đăng ký
        setTimeout(() => {
            console.log("Register Data:", data);
            alert(`Account registration successful: ${data.account}`);
            navigate("/signin");
            setIsLoading(false);
            // Sau khi thành công thì chuyển hướng về trang login (dùng navigate của router)
        }, 1500);
    };

    return {
        // RHF
        register,
        handleSubmit,
        errors,

        // State & Actions
        isLoading,
        showPassword,
        togglePassword,
        showConfirmPassword,
        toggleConfirmPassword,
        onSubmit,
    };
};

export default UseSignUp;
