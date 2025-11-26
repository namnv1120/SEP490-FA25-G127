import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/orders";

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
  const response = await axios.get(REST_API_BASE_URL, {
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
  const response = await axios.get(`${REST_API_BASE_URL}/by-account/${accountId}/by-range`, {
    ...getAuthHeaders(),
    params: { from: fromISO, to: toISO },
  });
  return response.data?.result || response.data || [];
};
