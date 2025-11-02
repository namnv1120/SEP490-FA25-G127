import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/auth';

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
    console.error(
      'Login failed:',
      error.response ? error.response.data : error.message
    );
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authTokenType');
  localStorage.removeItem('accountId');
  localStorage.removeItem('username');
  localStorage.removeItem('fullName');
  localStorage.removeItem('roleName');
};
