import axiosInstance from "../libs/axios";

const BASE_URL = "/api/sprints";

export const sprintService = {
  addIssueToSprint: async (sprintId, issueId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/issues`,
      {
        issueId,
      }
    );
    return response.data;
  },

  removeIssueFromSprint: async (sprintId, issueId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${sprintId}/issues`,
      {
        data: { issueId },
      }
    );
    return response.data;
  },

  getSprintById: async (sprintId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${sprintId}`
    );
    return response.data;
  },

  updateSprint: async (sprintId, sprintData) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${sprintId}`,
      sprintData
    );
    return response.data;
  },

  getSprintsByProject: async (projectId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/project/${projectId}`
    );
    return response.data;
  },

  getSprintStats: async (sprintId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${sprintId}/stats`
    );
    return response.data;
  },

  createSprint: async (sprintData) => {
    const response = await axiosInstance.post(
      `${BASE_URL}`,
      sprintData
    );
    return response.data;
  },

  startSprint: async (sprintId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/start`
    );
    return response.data;
  },

  completeSprint: async (sprintId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/complete`
    );
    return response.data;
  },

  deleteSprint: async (sprintId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${sprintId}`
    );
    return response.data;
  },
};
