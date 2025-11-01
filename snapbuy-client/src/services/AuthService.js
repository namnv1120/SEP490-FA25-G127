import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // ✅ Import thêm

const REST_API_BASE_URL = 'http://localhost:8080/api/auth';

// API đăng nhập
export const login = async (username, password) => {
  if (!username || !password) throw new Error('Username and password are required.');

  try {
    const response = await axios.post(`${REST_API_BASE_URL}/login`, { username, password });
    const { token, tokenType } = response.data.result;

    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTokenType', tokenType || 'Bearer');
      
      try {
        const decoded = jwtDecode(token);

        if (decoded.roles && decoded.roles.length > 0) {
          const role = decoded.roles[0].authority;
          const cleanRole = role.replace('ROLE_', '');
          localStorage.setItem('role', cleanRole);
        } else {
          console.warn("⚠️ No roles found in JWT");
        }
      } catch (decodeError) {
        console.error("❌ Error decoding JWT:", decodeError);
      }
      return response.data.result;
    } else {
      throw new Error('Login failed: No token received.');
    }
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authTokenType');
  localStorage.removeItem('role');
};
