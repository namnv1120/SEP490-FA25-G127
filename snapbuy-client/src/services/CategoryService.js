/* eslint-disable no-useless-catch */
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/categories";

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

export const getAllCategories = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${categoryId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      categoryData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${categoryId}`,
      categoryData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${categoryId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubCategories = async (parentCategoryId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${parentCategoryId}/subcategories`,
      getAuthHeaders()
    );
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const toggleCategoryStatus = async (categoryId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${categoryId}/toggle-status`,
      {},
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const searchParentCategories = async (keyword, page = 0, size = 10, sortBy = 'createdDate', sortDir = 'DESC') => {
  try {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    const url = `${REST_API_BASE_URL}/search-parent-categories?${params}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm danh mục:", error);
    throw error;
  }
};

export const searchSubCategories = async (keyword, page = 0, size = 10, sortBy = 'createdDate', sortDir = 'DESC') => {
  try {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    const url = `${REST_API_BASE_URL}/search-sub-categories?${params}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm danh mục con:", error);
    throw error;
  }
};
