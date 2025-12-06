import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.ACCOUNTS;

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return { Authorization: `${tokenType} ${token}` };
};

export const getAllAccounts = async () => {
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

export const searchAccounts = async ({ keyword, active, role }) => {
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

export const searchAccountsPaged = async ({
  keyword,
  active,
  role,
  page = 0,
  size = 10,
  sortBy = "fullName",
  sortDir = "ASC",
}) => {
  try {
    const params = { page, size, sortBy, sortDir };
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (typeof active === "boolean") params.active = active;
    if (role && role.trim()) params.role = role.trim();
    const response = await axios.get(`${REST_API_BASE_URL}/search-paged`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search accounts (paged)!"
    );
  }
};

export const searchStaffAccountsPaged = async ({
  keyword,
  active,
  role,
  page = 0,
  size = 10,
  sortBy = "fullName",
  sortDir = "ASC",
}) => {
  try {
    const params = { page, size, sortBy, sortDir };
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (typeof active === "boolean") params.active = active;
    if (role && role.trim()) params.role = role.trim();
    const response = await axios.get(
      `${REST_API_BASE_URL}/staff/search-paged`,
      {
        headers: getAuthHeader(),
        params,
      }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to search staff accounts (paged)!"
    );
  }
};

export const createAccount = async (userData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create account!"
    );
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch account!"
    );
  }
};

export const getMyInfo = async () => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/my-info`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch current user info!"
    );
  }
};

export const updateAccount = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}/json`,
      updatedData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update account!"
    );
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete account!"
    );
  }
};

export const toggleAccountStatus = async (accountId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${accountId}/toggle-status`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Lỗi khi chuyển đổi trạng thái tài khoản!"
    );
  }
};

export const requestEmailVerification = async (email) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/me/request-email-verification`,
      { email },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể gửi email xác nhận"
    );
  }
};

export const verifyEmailOtp = async (newEmail, code) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/me/verify-email-otp`,
      { newEmail, code },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Xác thực email thất bại");
  }
};

export const getAccountsByRoleName = async (roleName) => {
  try {
    const encodedRoleName = encodeURIComponent(roleName);
    const response = await axios.get(
      `${REST_API_BASE_URL}/by-role/${encodedRoleName}`,
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch accounts by role!"
    );
  }
};

export const createStaff = async (userData) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/staff`, userData, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create staff account!"
    );
  }
};

export const getStaffAccountByIdForOwner = async (staffId) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/staff/${staffId}`, {
      headers: getAuthHeader(),
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch staff account for owner!"
    );
  }
};

export const updateStaffByOwner = async (staffId, updatedData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/staff/${staffId}`,
      updatedData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update staff!");
  }
};

export const updateStaffRolesByOwner = async (staffId, roles) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/staff/${staffId}/roles`,
      { roles },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update staff roles!"
    );
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/me/change-password`,
      passwordData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ."
    );
  }
};
