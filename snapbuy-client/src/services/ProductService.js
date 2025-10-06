import axios from "axios";

//  Đặt URL backend của bạn ở đây (ví dụ localhost hoặc domain thực tế)
const API_BASE_URL = "http://localhost:5000/api";
//  Nhớ thay URL cho đúng với backend nhé!

//  Lấy danh sách sản phẩm (có hỗ trợ phân trang + search)
const getAllProducts = async ({ page = 1, limit = 10, search = "" }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { page, limit, search },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" getAllProducts error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch products",
    };
  }
};

//  Lấy chi tiết sản phẩm theo ID
const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" getProductById error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch product detail",
    };
  }
};

//  Thêm sản phẩm mới
const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, productData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" addProduct error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add product",
    };
  }
};

//  Cập nhật sản phẩm
const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" updateProduct error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update product",
    };
  }
};

//  Xóa sản phẩm
const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(" deleteProduct error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete product",
    };
  }
};

//  Export tất cả hàm
const productService = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
