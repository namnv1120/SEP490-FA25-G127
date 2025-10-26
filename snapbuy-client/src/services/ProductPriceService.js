import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/product-prices";

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

export const getAllProductPrices = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("❌ Lỗi tại product prices:", error);
    throw error;
  }
};

export const deleteProductPrice = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi xóa product price:", error);
    throw error;
  }
};

export const createProductPrice = async (productPriceData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      productPriceData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi tạo product price:", error);
    throw error;
  }
};

export const updateProductPrice = async (id, productPriceData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      productPriceData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi cập nhật product price:", error);
    throw error;
  }
};

export const getProductPriceById = async (id) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi lấy product price theo ID:", error);
    throw error;
  }
};