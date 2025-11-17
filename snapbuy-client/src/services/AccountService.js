import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/accounts');


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

export const updateAccount = async (id, updatedData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}/json`, updatedData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update account!');
  }
};

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

export const toggleAccountStatus = async (accountId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${accountId}/toggle-status`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi chuyển đổi trạng thái tài khoản!');
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
    throw new Error(error.response?.data?.message || 'Không thể gửi email xác nhận');
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
    throw new Error(error.response?.data?.message || 'Xác thực email thất bại');
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
    throw new Error(error.response?.data?.message || 'Failed to fetch accounts by role!');
  }
};