
import axiosInstance from "../libs/axios";

const BASE_URL = "/api/users";

export const userService = {
    getAssignee: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/assignees`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/me`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getAllUser: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/allusers`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};