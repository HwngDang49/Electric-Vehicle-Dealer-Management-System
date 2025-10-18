import axios from "axios";

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5014/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Temporarily bypass 401 redirect to login
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   localStorage.removeItem("authToken");
    //   localStorage.removeItem("userRole");
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

export default apiClient;
