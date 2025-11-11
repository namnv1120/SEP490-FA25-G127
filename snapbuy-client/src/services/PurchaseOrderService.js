/* eslint-disable no-useless-catch */
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/purchase-orders";

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

export const getAllPurchaseOrders = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const createPurchaseOrder = async (orderData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      orderData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const getPurchaseOrderById = async (orderId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${orderId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || "Không thể tải chi tiết đơn hàng";
      throw new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
    } else {
      throw new Error(error.message || "Có lỗi xảy ra khi tải chi tiết đơn hàng");
    }
  }
};

export const updatePurchaseOrder = async (orderId, updatedData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}`,
      updatedData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePurchaseOrder = async (orderId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${orderId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const approvePurchaseOrder = async (orderId, approveData = {}) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/approve`,
      approveData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const receivePurchaseOrder = async (orderId, receiveData = {}) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/receive`,
      receiveData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelPurchaseOrder = async (orderId) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/cancel`,
      {},
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPurchaseOrders = async (keyword, page = 0, size = 10, sortBy = 'orderDate', sortDir = 'DESC') => {
  try {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    const url = `${REST_API_BASE_URL}/search-by-keyword?${params}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

