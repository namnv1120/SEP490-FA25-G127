/* eslint-disable no-useless-catch */
import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/promotions');

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
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết khuyến mãi theo ID
export const getPromotionById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo khuyến mãi mới
export const createPromotion = async (promotionData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, promotionData, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (id, promotionData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, promotionData, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy % giảm giá tốt nhất cho sản phẩm
export const getBestDiscountForProduct = async (productId, unitPrice) => {
  try {
    const url = unitPrice
      ? `${REST_API_BASE_URL}/product/${productId}/discount?unitPrice=${unitPrice}`
      : `${REST_API_BASE_URL}/product/${productId}/discount`;
    const response = await axios.get(url, getAuthHeaders());
    const discount = response.data?.result || 0;
    console.log(`[PromotionService] Product ${productId} (price: ${unitPrice}) discount: ${discount}%`);
    return discount;
  } catch (error) {
    console.error("Error getting discount for product:", error);
    return 0;
  }
};

// Xóa khuyến mãi (nếu backend có API này)
export const deletePromotion = async (id) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

