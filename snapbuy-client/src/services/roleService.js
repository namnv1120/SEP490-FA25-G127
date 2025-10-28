import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/roles';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');
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
    console.error('Failed to fetch roles:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch roles!');
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Failed to fetch role:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch role!');
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, roleData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create role:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create role!');
  }
};

export const updateRole = async (roleId, updatedData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${roleId}`, updatedData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update role:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update role!');
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete role:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete role!');
  }
};

export const listPermissions = async (roleId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${roleId}/permissions`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Failed to fetch role permissions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch role permissions!');
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
    console.error('Failed to add permission:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add permission!');
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
    console.error('Failed to remove permission:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to remove permission!');
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
    console.error('Failed to set permissions:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to set permissions!');
  }
};
