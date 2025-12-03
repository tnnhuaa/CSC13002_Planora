// hooks/UseSignIn.js
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

// Schema validation
const signInSchema = z.object({
  account: z.string().trim().min(1, "Please enter your account"),
  password: z.string().min(1, "Please enter your password"),
});

const UseSignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { signin, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: "all",
  });

  const onSubmitLogic = async (data) => {
    clearError();
    const result = await signin(data.account, data.password);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    apiError: error,
    showPassword,
    isLoading,
    togglePasswordVisibility: () => setShowPassword(!showPassword),
    onSubmit: onSubmitLogic,
  };
};

export default UseSignIn;
