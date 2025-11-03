// src/services/salesService.js
import api from "./api";

export const salesService = {
  // Lấy tất cả sales
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/sales', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },

  // Lấy chi tiết sale
  getById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sale:", error);
      throw error;
    }
  },

  // Tạo sale mới
  create: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  },

  // Cập nhật sale
  update: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/${id}`, saleData);
      return response.data;
    } catch (error) {
      console.error("Error updating sale:", error);
      throw error;
    }
  },

  // Xóa sale
  delete: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  },

  // Lấy payments của sale
  getPayments: async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}/payments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Tạo payment mới
  createPayment: async (saleId, paymentData) => {
    try {
      const response = await api.post(`/sales/${saleId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  // Cập nhật payment
  updatePayment: async (saleId, paymentId, paymentData) => {
    try {
      const response = await api.put(`/sales/${saleId}/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },

  // Xóa payment
  deletePayment: async (saleId, paymentId) => {
    try {
      const response = await api.delete(`/sales/${saleId}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },

  // Tìm sản phẩm theo code
  getProductByCode: async (code) => {
    try {
      const response = await api.get(`/products/search`, { params: { code } });
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Export to PDF
  exportToPDF: async (filters = {}) => {
    try {
      const response = await api.get('/sales/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      throw error;
    }
  },

  // Export to Excel
  exportToExcel: async (filters = {}) => {
    try {
      const response = await api.get('/sales/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  }
};