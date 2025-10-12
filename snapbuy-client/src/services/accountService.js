import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/accounts';

export const listAccounts = async () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data.result || response.data;
  } catch (error) {
    console.error('Failed to fetch accounts:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createAccount = async (userData) => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.post(REST_API_BASE_URL, userData, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getAccount = async (id) => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getMyInfo = async () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.get(`${REST_API_BASE_URL}/me`, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current user info:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateAccount = async (id, updatedData) => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, updatedData, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteAccount = async (id) => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');

  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${id}`, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};