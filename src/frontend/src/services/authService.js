import axiosInstance from "../libs/axios";

export const authService = {
  // Sign Up
  signup: async (username, email, password) => {
    const response = await axiosInstance.post("/api/auth/signup", {
      username,
      email,
      password,
    });
    return response.data;
  },

  // Sign In
  signin: async (username, password) => {
    const response = await axiosInstance.post("/api/auth/signin", {
      username,
      password,
    });
    return response.data;
  },

  // Sign Out
  signout: async () => {
    const response = await axiosInstance.post("/api/auth/signout");
    return response.data;
  },

  // Refresh Token
  refreshToken: async () => {
    const response = await axiosInstance.post("/api/auth/refresh-token");
    return response.data;
  },

  // Forgot Password (Send OTP)
  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  // Reset Password (with OTP)
  resetPassword: async (email, otp, newPassword) => {
    const response = await axiosInstance.post("/api/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosInstance.post("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
