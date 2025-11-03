import api from "./api";

export const salesReturnService = {
  // Lấy tất cả sales returns
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/sales-returns', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales returns:", error);
      throw error;
    }
  },

  // Lấy chi tiết sales return
  getById: async (id) => {
    try {
      const response = await api.get(`/sales-returns/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sales return:", error);
      throw error;
    }
  },

  // Tạo sales return mới
  create: async (salesReturnData) => {
    try {
      const response = await api.post('/sales-returns', salesReturnData);
      return response.data;
    } catch (error) {
      console.error("Error creating sales return:", error);
      throw error;
    }
  },

  // Cập nhật sales return
  update: async (id, salesReturnData) => {
    try {
      const response = await api.put(`/sales-returns/${id}`, salesReturnData);
      return response.data;
    } catch (error) {
      console.error("Error updating sales return:", error);
      throw error;
    }
  },

  // Xóa sales return
  delete: async (id) => {
    try {
      const response = await api.delete(`/sales-returns/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting sales return:", error);
      throw error;
    }
  },

  // Xóa nhiều sales returns
  bulkDelete: async (ids) => {
    try {
      const response = await api.post('/sales-returns/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting sales returns:", error);
      throw error;
    }
  },

  // Lấy danh sách customers
  getCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      const response = await api.get('/sales-returns/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-returns-${Date.now()}.pdf`);
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
      const response = await api.get('/sales-returns/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-returns-${Date.now()}.xlsx`);
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