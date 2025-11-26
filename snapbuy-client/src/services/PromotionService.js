import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/promotions";

// Helper function để lấy headers với token
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

// Lấy tất cả khuyến mãi
export const getAllPromotions = async () => {
  const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
  return response.data?.result || response.data || [];
};

// Lấy chi tiết khuyến mãi theo ID
export const getPromotionById = async (id) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Tạo khuyến mãi mới
export const createPromotion = async (promotionData) => {
  const response = await axios.post(
    REST_API_BASE_URL,
    promotionData,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Cập nhật khuyến mãi
export const updatePromotion = async (id, promotionData) => {
  const response = await axios.put(
    `${REST_API_BASE_URL}/${id}`,
    promotionData,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy % giảm giá tốt nhất cho sản phẩm
export const getBestDiscountForProduct = async (productId, unitPrice) => {
  try {
    const url = unitPrice
      ? `${REST_API_BASE_URL}/product/${productId}/discount?unitPrice=${unitPrice}`
      : `${REST_API_BASE_URL}/product/${productId}/discount`;
    const response = await axios.get(url, getAuthHeaders());
    const discount = response.data?.result || 0;
    return discount;
  } catch (error) {
    console.error("Error getting discount for product:", error);
    return 0;
  }
};

// Lấy thông tin giảm giá chi tiết (loại + giá trị)
export const getBestDiscountInfoForProduct = async (productId, unitPrice) => {
  try {
    const url = unitPrice
      ? `${REST_API_BASE_URL}/product/${productId}/discount-info?unitPrice=${unitPrice}`
      : `${REST_API_BASE_URL}/product/${productId}/discount-info`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data?.result || { discountType: null, discountValue: 0, discountPercent: 0 };
  } catch (error) {
    console.error("Error getting discount info for product:", error);
    return { discountType: null, discountValue: 0, discountPercent: 0 };
  }
};

// Xóa khuyến mãi (nếu backend có API này)
export const deletePromotion = async (id) => {
  const response = await axios.delete(
    `${REST_API_BASE_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data;
};

// Toggle trạng thái khuyến mãi
export const togglePromotionStatus = async (id) => {
  const response = await axios.patch(
    `${REST_API_BASE_URL}/${id}/toggle-status`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
