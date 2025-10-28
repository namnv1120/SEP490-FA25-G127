import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/products";

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
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());

    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm theo ID:", error);
    throw error;
  }
};

// ➕ Thêm sản phẩm
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
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};


export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      productData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
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
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
}

export const importProducts = async (products) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/import`,
      products,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi nhập sản phẩm:", error);
    throw error;
  }
};