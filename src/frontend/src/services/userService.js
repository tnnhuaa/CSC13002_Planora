import axiosInstance from "../libs/axios";

export const userService = {
    // Get current user information
    getCurrentUser: async () => {
        const response = await axiosInstance.get("/api/users/me");
        return response.data;
    },
};
