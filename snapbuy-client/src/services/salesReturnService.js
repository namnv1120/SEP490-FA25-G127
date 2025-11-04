import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/sales-returns";

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

export const salesReturnService = {
  // Lấy tất cả sales returns
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(REST_API_BASE_URL, {
        ...getAuthHeaders(),
        params,
      });
      return response.data?.result || response.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách sales returns:", error);
      throw error;
    }
  },

  // Lấy chi tiết sales return theo ID
  getById: async (id) => {
    try {
      const response = await axios.get(
        `${REST_API_BASE_URL}/${id}`,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tải sales return theo ID:", error);
      throw error;
    }
  },

  // Tạo sales return mới
  create: async (salesReturnData) => {
    try {
      const response = await axios.post(
        REST_API_BASE_URL,
        salesReturnData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo sales return:", error);
      throw error;
    }
  },

  // Cập nhật sales return
  update: async (id, salesReturnData) => {
    try {
      const response = await axios.put(
        `${REST_API_BASE_URL}/${id}`,
        salesReturnData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sales return:", error);
      throw error;
    }
  },

  // Xóa sales return
  delete: async (id) => {
    try {
      const response = await axios.delete(
        `${REST_API_BASE_URL}/${id}`,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi xóa sales return:", error);
      throw error;
    }
  },

  // Xóa nhiều sales returns
  bulkDelete: async (ids) => {
    try {
      const response = await axios.post(
        `${REST_API_BASE_URL}/bulk-delete`,
        { ids },
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi xóa hàng loạt sales returns:", error);
      throw error;
    }
  },

  // Lấy danh sách customers
  getCustomers: async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/customers",
        getAuthHeaders()
      );
      return response.data?.result || response.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách customers:", error);
      throw error;
    }
  },

  // Tìm sản phẩm theo code
  getProductByCode: async (code) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/products/search`,
        {
          ...getAuthHeaders(),
          params: { code },
        }
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tìm sản phẩm theo code:", error);
      throw error;
    }
  },

  // Export to PDF
  exportToPDF: async (filters = {}) => {
    try {
      const token = localStorage.getItem("authToken");
      const tokenType = localStorage.getItem("authTokenType") || "Bearer";

      const response = await axios.get(
        `${REST_API_BASE_URL}/export/pdf`,
        {
          params: filters,
          responseType: "blob",
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-returns-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi export PDF:", error);
      throw error;
    }
  },

  // Export to Excel
  exportToExcel: async (filters = {}) => {
    try {
      const token = localStorage.getItem("authToken");
      const tokenType = localStorage.getItem("authTokenType") || "Bearer";

      const response = await axios.get(
        `${REST_API_BASE_URL}/export/excel`,
        {
          params: filters,
          responseType: "blob",
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-returns-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi export Excel:", error);
      throw error;
    }
  },
};