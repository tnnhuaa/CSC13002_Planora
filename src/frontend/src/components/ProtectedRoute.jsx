import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  // Check if user has one of the allowed roles
  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    // Redirect to dashboard if not authorized
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
