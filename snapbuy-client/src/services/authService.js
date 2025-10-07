import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/auth'; // URL cho đăng nhập, đăng ký

// API đăng nhập
export const login = async (username, password) => {
  if (!username || !password) throw new Error('Username and password are required.');

  try {
    const response = await axios.post(`${REST_API_BASE_URL}/login`, { username, password });
    const { token, tokenType } = response.data.result;

    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTokenType', tokenType || 'Bearer');
      return response.data.result;
    } else {
      throw new Error('Login failed: No token received.');
    }
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(`${REST_API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Fetching user profile failed:", error);
    throw error;
  }
};

// API logout (xoá token)
export const logout = () => {
  // Xoá token khỏi localStorage
  localStorage.removeItem('authToken');
};
