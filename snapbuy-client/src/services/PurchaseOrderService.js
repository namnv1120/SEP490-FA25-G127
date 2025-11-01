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
    console.error("❌ Lỗi khi lấy danh sách đơn đặt hàng:", error);
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
    console.error("❌ Lỗi khi tạo đơn đặt hàng:", error);
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
    console.error("❌ Lỗi khi lấy đơn đặt hàng theo ID:", error);
    throw error;
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
    console.error("❌ Lỗi khi cập nhật đơn đặt hàng:", error);
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
    console.error("❌ Lỗi khi xóa đơn đặt hàng:", error);
    throw error;
  }
};

export const approvePurchaseOrder = async (orderId, approveData = {}) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/approve`,
      approveData, // Cần thêm request body này
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi phê duyệt đơn đặt hàng:", error);
    throw error;
  }
};

export const receivePurchaseOrder = async (orderId, receiveData = {}) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/receive`,
      receiveData, // Cần thêm request body này
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi nhận đơn đặt hàng:", error);
    throw error;
  }
};

// cancelPurchaseOrder đã đúng vì không cần body
export const cancelPurchaseOrder = async (orderId) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${orderId}/cancel`,
      {}, // Thêm empty body
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi hủy đơn đặt hàng:", error);
    throw error;
  }
};


