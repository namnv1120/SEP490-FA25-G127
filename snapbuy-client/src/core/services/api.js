// src/core/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:4000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Optional: interceptors (auth token)
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("authToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
