import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/accounts';


const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');
  return { Authorization: `${tokenType} ${token}` };
};

export const getAllAccounts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch accounts!');
  }
};

// Tạo tài khoản mới
export const createAccount = async (userData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create account!');
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch account!');
  }
};

// Lấy thông tin tài khoản hiện tại (đăng nhập)
export const getMyInfo = async () => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/my-info`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch current user info!');
  }
};

// Cập nhật tài khoản
export const updateAccount = async (id, updatedData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, updatedData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update account!');
  }
};

// Xóa tài khoản
export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete account!');
  }
};

// Đổi mật khẩu
export const changePassword = async (id, passwordData) => {
  return handleRequest('put', `${BASE_URL}/${id}/change-password`, passwordData);
};

// Gán role cho tài khoản
export const assignRole = async (accountId, roleId) => {
  return handleRequest('post', `${BASE_URL}/${accountId}/roles/${roleId}`);
};

// Bỏ gán role
export const unassignRole = async (accountId, roleId) => {
  return handleRequest('delete', `${BASE_URL}/${accountId}/roles/${roleId}`);
};

// Cập nhật thông tin nhân viên (bởi chủ shop)
export const updateStaffByOwner = async (staffId, data) => {
  return handleRequest('put', `${BASE_URL}/owner/${staffId}`, data);
};

// Cập nhật vai trò nhân viên (bởi chủ shop)
export const updateStaffRolesByOwner = async (staffId, data) => {
  return handleRequest('put', `${BASE_URL}/owner/${staffId}/roles`, data);
};