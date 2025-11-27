import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const LoginConfirm = () => {
    const isAuthenticated = localStorage.getItem("userLogin");
    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default LoginConfirm;
