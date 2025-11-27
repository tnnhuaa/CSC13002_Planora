// src/hooks/UseForgotPassword.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// Schema: Account + Pass Mới + Confirm
const forgotSchema = z
    .object({
        account: z.string().trim().min(1, "Please enter your account"),

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

    // State ẩn/hiện cho 2 ô mật khẩu
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotSchema),
        mode: "all",
    });

    // Actions Toggle
    const togglePass = () => setShowPass(!showPass);
    const toggleConfirm = () => setShowConfirm(!showConfirm);

    const onSubmit = (data) => {
        setIsLoading(true);
        // Giả lập reset thành công luôn
        setTimeout(() => {
            console.log("Resetting password for:", data.account);
            console.log("New Password:", data.password);

            alert(
                `Password for account '${data.account}' has been reset successfully!`
            );
            navigate("/signin"); // Đá về trang login

            setIsLoading(false);
        }, 1500);
    };

    return {
        register,
        handleSubmit,
        errors,
        isLoading,
        // Export state & function
        showPass,
        togglePass,
        showConfirm,
        toggleConfirm,
        onSubmit,
    };
};

export default UseForgotPassword;
