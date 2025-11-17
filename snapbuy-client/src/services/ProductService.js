import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/products');

// Hàm lấy header kèm token
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

export const getAllProducts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const searchProducts = async (keyword, page = 0, size = 10, sortBy = 'createdDate', sortDir = 'DESC') => {
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

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/barcode/${encodeURIComponent(barcode)}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (formData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.post(
      REST_API_BASE_URL,
      formData,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      }
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      formData,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      }
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const importProducts = async (products) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/import`,
      products,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductsBySupplierId = async (supplierId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/supplier/${supplierId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleProductStatus = async (productId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${productId}/toggle-status`,
      {},
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};