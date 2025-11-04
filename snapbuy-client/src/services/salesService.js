// src/services/salesService.js
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/sales";

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

export const salesService = {
  // Lấy tất cả sales
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(REST_API_BASE_URL, {
        ...getAuthHeaders(),
        params,
      });
      return response.data?.result || response.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách sales:", error);
      throw error;
    }
  },

  // Lấy chi tiết sale theo ID
  getById: async (id) => {
    try {
      const response = await axios.get(
        `${REST_API_BASE_URL}/${id}`,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tải sale theo ID:", error);
      throw error;
    }
  },

  // Tạo sale mới
  create: async (saleData) => {
    try {
      const response = await axios.post(
        REST_API_BASE_URL,
        saleData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo sale:", error);
      throw error;
    }
  },

  // Cập nhật sale
  update: async (id, saleData) => {
    try {
      const response = await axios.put(
        `${REST_API_BASE_URL}/${id}`,
        saleData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sale:", error);
      throw error;
    }
  },

  // Xóa sale
  delete: async (id) => {
    try {
      const response = await axios.delete(
        `${REST_API_BASE_URL}/${id}`,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi xóa sale:", error);
      throw error;
    }
  },

  // Lấy payments của một sale
  getPayments: async (saleId) => {
    try {
      const response = await axios.get(
        `${REST_API_BASE_URL}/${saleId}/payments`,
        getAuthHeaders()
      );
      return response.data?.result || response.data || [];
    } catch (error) {
      console.error("❌ Lỗi khi tải payments:", error);
      throw error;
    }
  },

  // Tạo payment mới
  createPayment: async (saleId, paymentData) => {
    try {
      const response = await axios.post(
        `${REST_API_BASE_URL}/${saleId}/payments`,
        paymentData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo payment:", error);
      throw error;
    }
  },

  // Cập nhật payment
  updatePayment: async (saleId, paymentId, paymentData) => {
    try {
      const response = await axios.put(
        `${REST_API_BASE_URL}/${saleId}/payments/${paymentId}`,
        paymentData,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật payment:", error);
      throw error;
    }
  },

  // Xóa payment
  deletePayment: async (saleId, paymentId) => {
    try {
      const response = await axios.delete(
        `${REST_API_BASE_URL}/${saleId}/payments/${paymentId}`,
        getAuthHeaders()
      );
      return response.data?.result || response.data;
    } catch (error) {
      console.error("❌ Lỗi khi xóa payment:", error);
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
      link.setAttribute("download", `sales-${Date.now()}.pdf`);
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
      link.setAttribute("download", `sales-${Date.now()}.xlsx`);
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