import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/accounts';

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getAllAccounts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("❌ Failed to fetch accounts:", error);
    throw error;
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to fetch account by ID:", error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      accountData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to create account:", error);
    throw error;
  }
};

export const updateAccount = async (id, accountData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      accountData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to update account:", error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to delete account:", error);
    throw error;
  }
};  