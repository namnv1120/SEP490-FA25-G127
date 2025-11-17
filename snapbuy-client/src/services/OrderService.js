import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/orders');

// Hàm lấy header có token
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


export const getAllOrders = async (params = {}) => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      ...getAuthHeaders(),
      params: params,
    });
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, orderData, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const completeOrder = async (orderId) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/${orderId}/complete`, {}, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await axios.post(`${REST_API_BASE_URL}/${orderId}/cancel`, {}, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};