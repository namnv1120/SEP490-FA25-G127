// API Configuration
// Sử dụng environment variable hoặc fallback về localhost cho development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getApiBaseUrl = () => API_BASE_URL;

export const getApiUrl = (endpoint) => {
  // Đảm bảo endpoint bắt đầu với /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default API_BASE_URL;

