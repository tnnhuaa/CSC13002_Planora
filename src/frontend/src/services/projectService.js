import axiosInstance from "../libs/axios";

const BASE_URL = "/api/projects";

export const projectService = {
  createProject: async (projectData) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/`, projectData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getAllProjects: async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  async getProjectsManagedByUser(userId) {
    return await projectRepository.findProjectsByManager(userId);
  },
  getProjectsByManager: async (managerId) => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/manager/${managerId}`
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getMyProjects: async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/mine`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteProject: async (id) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  getProjectDetails: async (id) => {
    try {
      // Gọi API GET /api/projects/:id
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  addMemberToProject: async (projectId, memberData) => {
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/${projectId}/members`,
        memberData
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/${projectId}`,
        projectData
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  deleteProject: async (projectId) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/${projectId}`);
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};
