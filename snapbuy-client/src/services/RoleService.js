import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.ROLES;

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Không tìm thấy token xác thực!");
  return { Authorization: `${tokenType} ${token}` };
};

export const getAllRoles = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách vai trò!"
    );
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách vai trò!"
    );
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, roleData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo vai trò!");
  }
};

export const updateRole = async (roleId, updatedData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${roleId}`,
      updatedData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi cập nhật vai trò!"
    );
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${roleId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi xóa vai trò!");
  }
};

// Toggle trạng thái vai trò
export const toggleRoleStatus = async (roleId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${roleId}/toggle-status`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi chuyển đổi trạng thái vai trò!"
    );
  }
};

// Search roles với pagination
export const searchRolesPaged = async ({
  keyword,
  active,
  page = 0,
  size = 10,
  sortBy = "roleName",
  sortDir = "ASC",
}) => {
  try {
    const params = { page, size, sortBy, sortDir };
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (typeof active === "boolean") params.active = active;
    const response = await axios.get(`${REST_API_BASE_URL}/search-paged`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search roles (paged)!"
    );
  }
};
