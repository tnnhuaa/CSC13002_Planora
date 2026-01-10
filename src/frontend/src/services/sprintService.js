import axiosInstance from "../libs/axios";

const BASE_URL = "/api/sprints";

export const sprintService = {
  getAllSprints: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data.data;
  },

  addIssueToSprint: async (sprintId, issueId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/issues`,
      {
        issueId,
      }
    );
    return response.data.data;
  },

  removeIssueFromSprint: async (sprintId, issueId, unchangedStatus = false) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${sprintId}/issues`,
      {
        data: { issueId, unchangedStatus },
      }
    );
    return response.data.data;
  },

  getSprintById: async (sprintId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${sprintId}`
    );
    return response.data.data;
  },

  updateSprint: async (sprintId, sprintData) => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${sprintId}`,
      sprintData
    );
    return response.data.data;
  },

  getSprintsByProject: async (projectId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/project/${projectId}`
    );
    return response.data.data;
  },

  getSprintStats: async (sprintId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${sprintId}/stats`
    );
    return response.data.data;
  },

  createSprint: async (sprintData) => {
    const response = await axiosInstance.post(
      `${BASE_URL}`,
      sprintData
    );
    return response.data.data;
  },

  startSprint: async (sprintId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/start`
    );
    return response.data.data;
  },

  completeSprint: async (sprintId) => {
    const response = await axiosInstance.post(
      `${BASE_URL}/${sprintId}/complete`
    );
    return response.data.data;
  },

  deleteSprint: async (sprintId) => {
    const response = await axiosInstance.delete(
      `${BASE_URL}/${sprintId}`
    );
    return response.data.data;
  },
};
