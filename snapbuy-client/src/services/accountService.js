import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/accounts';

export const listAccounts = async () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  
  if (!token) {
    throw new Error('Unauthorized: No token found');
  }

  try {
    const response = await axios.get(`${REST_API_BASE_URL}`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch accounts:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const createAccount = (userData) => axios.post(REST_API_BASE_URL, userData);

export const getAccount = (id) => axios.get(REST_API_BASE_URL + '/' + id);

export const updateAccount = (id, updatedData) => axios.put(REST_API_BASE_URL + '/' + id, updatedData);

export const deleteAccount = (id) => axios.delete(REST_API_BASE_URL + '/' + id);