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