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
  getSprintsByProject: async (projectId) => {
    const response = await axiosInstance.get(
      `${BASE_URL}/project/${projectId}`
    );
    return response.data;
  },
};
