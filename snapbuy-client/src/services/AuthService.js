import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // ✅ Import thêm
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/auth');

// 🔐 API đăng nhập
export const login = async (username, password) => {
  if (!username || !password)
    throw new Error('Username and password are required.');

  try {
    const response = await axios.post(`${REST_API_BASE_URL}/login`, {
      username,
      password,
    });

    const { token, tokenType, accountId, roleName, fullName } =
      response.data.result || {};

    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authTokenType', tokenType || 'Bearer');
      try {
        const decoded = jwtDecode(token);
        const role = decoded.roles[0].authority;
        const cleanRole = role.replace('ROLE_', '');
        localStorage.setItem('role', cleanRole);
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
      }
      return response.data.result;
    } else {
      throw new Error('Login failed: No token received.');
    }

    // ✅ Lưu thêm thông tin người dùng đang đăng nhập
    if (accountId) {
      localStorage.setItem('accountId', accountId);
    }
    if (username) {
      localStorage.setItem('username', username);
    }
    if (fullName) {
      localStorage.setItem('fullName', fullName);
    }
    if (roleName) {
      localStorage.setItem('roleName', roleName);
    }

    return response.data.result;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authTokenType');
  localStorage.removeItem('role');
};
