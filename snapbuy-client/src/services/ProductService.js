import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/products";

// 🧾 Lấy danh sách sản phẩm
export const getAllProducts = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.get(REST_API_BASE_URL, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    // Backend có thể trả về { result: [...] } hoặc { products: [...] } hoặc mảng trực tiếp
    return (
      response.data?.result ||
      response.data?.products ||
      response.data ||
      []
    );
  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    throw error;
  }
};

// 📋 Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to fetch product by ID:", error);
    throw error;
  }
};

// ➕ Thêm sản phẩm
export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.post(REST_API_BASE_URL, productData, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to create product:", error);
    throw error;
  }
};

// ✏️ Sửa sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      productData,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      }
    );

    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Failed to update product:", error);
    throw error;
  }
};

// 🗑️ Xoá sản phẩm
export const deleteProduct = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    await axios.delete(`${REST_API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });
  } catch (error) {
    console.error("❌ Failed to delete product:", error);
    throw error;
  }
};
