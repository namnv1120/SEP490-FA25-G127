/* eslint-disable no-useless-catch */
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/pos-shifts";

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

export const getCurrentShift = async () => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/current`, getAuthHeaders());
    return response.data?.result || response.data || null;
  } catch (error) {
    throw error;
  }
};

export const openShift = async (initialCash) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/open`, { initialCash }, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const closeShift = async (closingCash, note) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/close`, { closingCash, note }, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const isShiftOpen = async () => {
  try {
    const current = await getCurrentShift();
    return !!(current && current.status === "Mở");
  } catch (error) {
    throw error;
  }
};

export const getMyShifts = async (status) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/my`, { ...getAuthHeaders(), params: status ? { status } : {} });
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const getShiftsByAccountId = async (accountId, status) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/by-account/${accountId}`, {
      ...getAuthHeaders(),
      params: status ? { status } : {},
    });
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};
