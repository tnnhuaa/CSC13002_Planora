// hooks/UseSignIn.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// Schema validation
const signInSchema = z.object({
    account: z.string().trim().min(1, "Please enter your account"),
    password: z
        .string()
        .min(1, "Please enter your password")
        .min(3, "Password"),
});

const UseSignIn = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signInSchema),
        mode: "all",
    });

    const onSubmitLogic = async (data) => {
        setIsLoading(true);
        setApiError("");

        // Mock backend check
        setTimeout(() => {
            if (data.account === "admin" && data.password === "12345") {
                // Authenticated (local storage)
                localStorage.setItem(
                    "userLogin",
                    JSON.stringify({ account: data.account })
                );

                alert("Login successful!");
                navigate("/dashboard");
            } else {
                setApiError("Invalid account or password");
            }
            setIsLoading(false);
        }, 1000);
    };

    return {
        register,
        handleSubmit,
        errors,
        apiError,
        showPassword,
        isLoading,
        togglePasswordVisibility: () => setShowPassword(!showPassword),
        onSubmit: onSubmitLogic,
    };
};

export default UseSignIn;
