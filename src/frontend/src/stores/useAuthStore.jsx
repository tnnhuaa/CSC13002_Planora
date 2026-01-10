import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Sign Up
            signup: async (username, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.signup(username, email, password);

                    set({
                        isLoading: false,
                    });

                    return {
                        success: true,
                        message: "Account created successfully",
                    };
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.message || "Signup failed";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Sign In
            signin: async (username, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.signin(
                        username,
                        password
                    );

                    if (response.accessToken) {
                        localStorage.setItem(
                            "accessToken",
                            response.accessToken
                        );
                    }

                    // Store user data from response
                    set({
                        user: response.user || { username },
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return { success: true, message: "Signin successful" };
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.message || "Signin failed";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Forgot Password (Send OTP)
            forgotPassword: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.forgotPassword(email);

                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.message || "Failed to send OTP";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Reset Password (with OTP)
            resetPassword: async (email, otp, newPassword) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.resetPassword(
                        email,
                        otp,
                        newPassword
                    );

                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    const errorMessage =
                        error.response?.data?.message ||
                        "Failed to reset password";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Sign Out
            signout: async () => {
                set({ isLoading: true });
                try {
                    await authService.signout();
                } catch (error) {
                    console.error("Signout error:", error);
                } finally {
                    localStorage.removeItem("accessToken");
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            // Refresh Token
            refreshAccessToken: async () => {
                try {
                    const response = await authService.refreshToken();
                    if (response.accessToken) {
                        localStorage.setItem(
                            "accessToken",
                            response.accessToken
                        );
                        return { success: true };
                    }
                    return { success: false };
                } catch (error) {
                    console.error("Token refresh error:", error);
                    return { success: false };
                }
            },

            // Fetch current user data from backend
            fetchUser: async () => {
                try {
                    const response = await userService.getCurrentUser();
                    if (response.success && response.user) {
                        set({ user: response.user });
                        return { success: true, user: response.user };
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    return { success: false };
                }
            },

            // Check if user is authenticated
            checkAuth: async () => {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    set({ isAuthenticated: true });
                    // Fetch user data if authenticated
                    const { user } = useAuthStore.getState();
                    if (!user || !user.role) {
                        await useAuthStore.getState().fetchUser();
                    }
                } else {
                    set({ isAuthenticated: false, user: null });
                }
            },

            // Clear Error
            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
