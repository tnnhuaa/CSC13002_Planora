import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url && originalRequest.url.includes("/auth/signin")) {
      return Promise.reject(error);
    }

    // Don't retry refresh-token endpoint to prevent infinite loop
    if (originalRequest.url?.includes("/refresh-token")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/#/signin";
      return Promise.reject(error);
    }

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn("Session expired. Logging out immediately.");

      // 1. Clear the token
      localStorage.removeItem("accessToken");

      // 2. Redirect to login (Respecting your Hash Router #)
      if (!window.location.hash.includes("signin")) {
        window.location.href = "/#/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
