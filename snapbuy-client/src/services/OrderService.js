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


export const getAllOrders = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, orderData, getAuthHeaders());    
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
};