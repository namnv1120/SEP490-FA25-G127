import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/permissions";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return { Authorization: `${tokenType} ${token}` };
};
export const getAllPermissions = async (activeFilter) => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get(REST_API_BASE_URL, {
      headers,
      params: activeFilter !== undefined ? { active: activeFilter } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

export const getPermissionById = async (id) => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching permission with ID ${id}:`, error);
    throw error;
  }
};

export const createPermission = async (permissionData) => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post(REST_API_BASE_URL, permissionData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating permission:", error);
    throw error;
  }
};

export const updatePermission = async (id, updateData) => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, updateData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating permission with ID ${id}:`, error);
    throw error;
  }
};

export const deletePermission = async (id) => {
  try {
    const headers = getAuthHeader();
    await axios.delete(`${REST_API_BASE_URL}/${id}`, { headers });
  } catch (error) {
    console.error(`Error deleting permission with ID ${id}:`, error);
    throw error;
  }
};
