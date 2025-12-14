import axiosInstance from "../libs/axios";

const BASE_URL = "/api/issues";

export const issueService = {
    createIssue: async (issueData) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}`, issueData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    updateIssue: async (id, updatedData) => {
        try {
            // Endpoint: /api/issues/:id
            const response = await axiosInstance.put(
                `${BASE_URL}/${id}`,
                updatedData
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getIssues: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    getIssuesForUser: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    deleteIssue: async (id) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
};
