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
const getAllProducts = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách sản phẩm:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (id) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải sản phẩm theo ID:", error);
    throw error;
  }
};

// Thêm sản phẩm
const createProduct = async (productData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      productData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    throw error;
  }
};

// Cập nhật sản phẩm
const updateProduct = async (id, productData) => {
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

// Xóa sản phẩm
const deleteProduct = async (id) => {
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
const importProducts = async (products) => {
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

const ProductService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
};

export default ProductService;