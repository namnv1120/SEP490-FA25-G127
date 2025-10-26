import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/accounts';

/** 
 * Lấy header xác thực từ localStorage 
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');
  return { Authorization: `${tokenType} ${token}` };
};

/** 
 * Hàm helper xử lý yêu cầu Axios thống nhất 
 */
const handleRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
      data,
      headers: getAuthHeader(),
    };

    const response = await axios(config);
    // Trả về `response.data.result` nếu có, ngược lại `response.data`
    return response.data.result || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred!';
    console.error(`Request failed [${method.toUpperCase()} ${url}]:`, message);
    throw new Error(message);
  }
};

/** ======================= ACCOUNT API ======================= **/

// Lấy danh sách tài khoản
export const listAccounts = async () => {
  return handleRequest('get', BASE_URL);
};

// Tạo tài khoản mới
export const createAccount = async (userData) => {
  return handleRequest('post', BASE_URL, userData);
};

// Lấy thông tin tài khoản theo ID
export const getAccount = async (id) => {
  return handleRequest('get', `${BASE_URL}/${id}`);
};

// Lấy thông tin tài khoản hiện tại (đăng nhập)
export const getMyInfo = async () => {
  return handleRequest('get', `${BASE_URL}/my-info`);
};

// Cập nhật tài khoản
export const updateAccount = async (id, updatedData) => {
  return handleRequest('put', `${BASE_URL}/${id}`, updatedData);
};

// Xóa tài khoản
export const deleteAccount = async (id) => {
  return handleRequest('delete', `${BASE_URL}/${id}`);
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