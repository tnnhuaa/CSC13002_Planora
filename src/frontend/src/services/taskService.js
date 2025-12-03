import axiosInstance from "../libs/axios";

const BASE_URL = "/api/tasks";

export const taskService = {
    createTask: async (taskData) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/`, taskData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getTasks: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    deleteTask: async (id) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
};