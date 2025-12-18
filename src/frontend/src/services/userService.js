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
  },

  toggleBanUser: async (userId) => {
    try {
      const response = await axiosInstance.patch(`${BASE_URL}/${userId}/ban`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};
