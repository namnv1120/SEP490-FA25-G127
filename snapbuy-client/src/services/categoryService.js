import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/categories";

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
    console.error("❌ Failed to fetch categories:", error);
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
    console.error(`❌ Failed to fetch category ${categoryId}:`, error);
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
    console.error("❌ Failed to create category:", error);
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
    console.error(`❌ Failed to update category ${categoryId}:`, error);
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
    console.error(`❌ Failed to delete category ${categoryId}:`, error);
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
    console.error(`❌ Failed to fetch subcategories for ${parentCategoryId}:`, error);
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
    console.error(`❌ Failed to toggle status for category ${categoryId}:`, error);
    throw error;
  }
};
