import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.PRODUCTS;

export const getAllProducts = async () => {
  const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
  return response.data?.result || response.data || [];
};

export const searchProducts = async (
  keyword,
  page = 0,
  size = 10,
  sortBy = "createdDate",
  sortDir = "DESC"
) => {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  params.append("page", page);
  params.append("size", size);
  params.append("sortBy", sortBy);
  params.append("sortDir", sortDir);
  const url = `${REST_API_BASE_URL}/search-by-keyword?${params}`;
  const response = await axios.get(url, getAuthHeaders());
  return response.data?.result || response.data;
};

export const searchProductsPaged = async ({
  keyword,
  active,
  categoryId,
  subCategoryId,
  page = 0,
  size = 10,
  sortBy = "createdDate",
  sortDir = "DESC",
}) => {
  try {
    const params = { page, size, sortBy, sortDir };
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (typeof active === "boolean") params.active = active;
    if (categoryId) params.categoryId = categoryId;
    if (subCategoryId) params.subCategoryId = subCategoryId;
    const response = await axios.get(`${REST_API_BASE_URL}/search-paged`, {
      headers: getAuthHeaders().headers,
      params,
    });
    return response.data.result || response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi tìm kiếm sản phẩm (phân trang)!"
    );
  }
};

export const getProductById = async (id) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const getProductByBarcode = async (barcode) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/barcode/${encodeURIComponent(barcode)}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const createProduct = async (formData) => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  const response = await axios.post(REST_API_BASE_URL, formData, {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });
  return response.data?.result || response.data;
};

export const updateProduct = async (id, formData) => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  const response = await axios.put(`${REST_API_BASE_URL}/${id}`, formData, {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });
  return response.data?.result || response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(
    `${REST_API_BASE_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const importProducts = async (products) => {
  const response = await axios.post(
    `${REST_API_BASE_URL}/import`,
    products,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const getProductsBySupplierId = async (supplierId) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/supplier/${supplierId}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

export const toggleProductStatus = async (productId) => {
  const response = await axios.patch(
    `${REST_API_BASE_URL}/${productId}/toggle-status`,
    {},
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
