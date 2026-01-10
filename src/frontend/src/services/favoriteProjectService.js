import axiosInstance from "../libs/axios";

const BASE_URL = "/api/favorites";

export const favoriteProjectService = {
  getFavorites: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  addFavorite: async (projectId) => {
    const response = await axiosInstance.post(BASE_URL, { projectId });
    return response.data;
  },

  removeFavorite: async (projectId) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${projectId}`);
    return response.data;
  },
};
