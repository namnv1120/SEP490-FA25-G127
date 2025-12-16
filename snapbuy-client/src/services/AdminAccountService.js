import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

const REST_API_BASE_URL = "/api/admin/accounts";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return { Authorization: `${tokenType} ${token}` };
};

export const getAllAdminAccounts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch accounts!"
    );
  }
};

export const searchAdminAccounts = async ({ keyword, active, role }) => {
  try {
    const params = {};
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (typeof active === "boolean") params.active = active;
    if (role && role.trim()) params.role = role.trim();
    const response = await axios.get(`${REST_API_BASE_URL}/search`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search accounts!"
    );
  }
};

export const deleteAdminAccount = async (tenantId, accountId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${tenantId}/${accountId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete account!"
    );
  }
};

export const toggleAccountStatus = async (tenantId, accountId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${tenantId}/${accountId}/toggle-status`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to toggle account status!"
    );
  }
};

export const updateAdminAccount = async (tenantId, accountId, accountData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${tenantId}/${accountId}`,
      accountData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update account!"
    );
  }
};
