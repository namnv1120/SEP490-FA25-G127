import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/products";

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

// Lấy toàn bộ sản phẩm
export const getAllProducts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách sản phẩm:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải sản phẩm theo ID:", error);
    throw error;
  }
};

// Thêm sản phẩm
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
          // Không set Content-Type - axios sẽ tự động set với boundary cho FormData
        },
      }
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    throw error;
  }
};

// Cập nhật sản phẩm
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
          // Không set Content-Type - axios sẽ tự động set với boundary cho FormData
        },
      }
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    if (error.response?.data?.message) {
      console.error("📝 Thông báo lỗi từ server:", error.response.data.message);
    }
    throw error;
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};

// Import danh sách sản phẩm
export const importProducts = async (products) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/import`,
      products,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi import sản phẩm:", error);
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
    console.error("❌ Lỗi khi tải danh sách sản phẩm theo nha cung cap:", error);
    throw error;
  }
};