import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/roles';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Không tìm thấy token xác thực!');
  return { Authorization: `${tokenType} ${token}` };
};

export const getAllRoles = async (active) => {
  try {
    const params = active !== undefined ? { active } : {};
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params,
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vai trò: ', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách vai trò!');
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vai trò: ', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách vai trò!');
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, roleData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo vai trò:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo vai trò!');
  }
};

export const updateRole = async (roleId, updatedData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${roleId}`, updatedData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật vai trò!');
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa vai trò:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa vai trò!');
  }
};

export const listPermissions = async (roleId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${roleId}/permissions`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quyền:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách quyền!');
  }
};

export const addPermission = async (roleId, permissionId) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/${roleId}/permissions/${permissionId}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm quyền:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi thêm quyền!');
  }
};

export const removePermission = async (roleId, permissionId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${roleId}/permissions/${permissionId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa quyền:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa quyền!');
  }
};

export const setPermissions = async (roleId, permissionsData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${roleId}/permissions`,
      permissionsData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật quyền!');
  }
};
