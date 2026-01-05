import axiosInstance from "../libs/axios";

const BASE_URL = "/api/comments";

export const commentService = {
  // Create a new comment
  createComment: async (issueId, message) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}`, {
        issueId,
        message,
      });
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all comments for an issue
  getCommentsByIssue: async (issueId) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/issue/${issueId}`);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update a comment
  updateComment: async (commentId, message) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${commentId}`, {
        message,
      });
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${commentId}`);
      return response.data.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};
