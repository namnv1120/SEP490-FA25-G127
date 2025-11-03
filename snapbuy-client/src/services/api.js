// src/services/api.js
import axios from "axios";

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: "http://localhost:8080/api", // 👈 Thay bằng URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    
    // Xử lý các lỗi khác
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;