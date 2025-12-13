import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.ORDERS;

export const getAllOrders = async (params = {}) => {
  const response = await axios.get(REST_API_BASE_URL, {
    ...getAuthHeaders(),
    params: params,
  });
  return response.data?.result || response.data || [];
};

export const getReturnOrders = async (params = {}) => {
  const response = await axios.get(`${REST_API_BASE_URL}/returns`, {
    ...getAuthHeaders(),
    params: params,
  });
  return response.data?.result || response.data || [];
};

export const getOrderById = async (id) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const getMyTodayOrderCount = async (paymentStatus = "Đã thanh toán") => {
  const params = paymentStatus ? { paymentStatus } : {};
  const response = await axios.get(`${REST_API_BASE_URL}/my/today-count`, {
    ...getAuthHeaders(),
    params,
  });
  return response.data?.result ?? response.data;
};

export const getMyTodayOrders = async () => {
  const response = await axios.get(`${REST_API_BASE_URL}/my/today`, {
    ...getAuthHeaders(),
  });
  return response.data?.result || response.data || [];
};

export const createOrder = async (orderData) => {
  const response = await axios.post(
    REST_API_BASE_URL,
    orderData,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const completeOrder = async (orderId) => {
  const response = await axios.post(
    `${REST_API_BASE_URL}/${orderId}/complete`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await axios.post(
    `${REST_API_BASE_URL}/${orderId}/cancel`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const markOrderForReturn = async (orderId) => {
  const response = await axios.post(
    `${REST_API_BASE_URL}/${orderId}/mark-for-return`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const revertReturnStatus = async (orderId) => {
  const response = await axios.post(
    `${REST_API_BASE_URL}/${orderId}/revert-return`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const getMyOrdersByDateTimeRange = async (fromISO, toISO) => {
  console.log("🔍 API Call - getMyOrdersByDateTimeRange");
  console.log("  URL:", `${REST_API_BASE_URL}/my/by-range`);
  console.log("  Params:", { from: fromISO, to: toISO });

  const response = await axios.get(`${REST_API_BASE_URL}/my/by-range`, {
    ...getAuthHeaders(),
    params: { from: fromISO, to: toISO },
  });

  console.log("  Response status:", response.status);
  console.log("  Response data:", response.data);
  console.log("  Result:", response.data?.result || response.data || []);

  return response.data?.result || response.data || [];
};

export const getOrdersByAccountAndRange = async (accountId, fromISO, toISO) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/by-account/${accountId}/by-range`,
    {
      ...getAuthHeaders(),
      params: { from: fromISO, to: toISO },
    }
  );
  return response.data?.result || response.data || [];
};

// Simulate MoMo return callback
export const simulateMoMoCallback = async (momoOrderId, resultCode = 0) => {
  const response = await axios.post(
    `${API_ENDPOINTS.BASE_URL}/api/payments/momo/return-notify`,
    {
      orderId: momoOrderId,
      resultCode: resultCode,
      transId: `LOCAL-${Date.now()}`,
      message: resultCode === 0 ? "Successful" : "Failed",
    }
  );
  return response.data;
};
