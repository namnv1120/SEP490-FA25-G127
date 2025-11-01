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
    console.error('Failed to fetch accounts:', error.response?.data || error.message);
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
    console.error('Failed to create account:', error.response?.data || error.message);
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
    console.error('Failed to fetch account:', error.response?.data || error.message);
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
    console.error('Failed to fetch current user info:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch current user info!');
  }
};

export const updateAccount = async (id, updatedData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, updatedData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update account:', error.response?.data || error.message);
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
    console.error('Failed to delete account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete account!');
  }
};
