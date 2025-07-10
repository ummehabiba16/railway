import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Only attach token if endpoint is not public
    if (
      token &&
      !config.url.startsWith("/public/") // Allow public access without token
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.location.href = "/login"; // Redirect to login on auth failure
    }
    return Promise.reject(error);
  }
);

export default api;
