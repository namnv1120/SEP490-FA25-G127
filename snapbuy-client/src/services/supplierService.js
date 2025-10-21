import axios from "axios";

// Base URL - có thể đưa vào file config
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Tạo axios instance với config chung
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header (nếu cần)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý error chung
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Supplier Service
const supplierService = {
  // Get all suppliers với pagination và search
  getSuppliers: async (params = {}) => {
    try {
      const response = await apiClient.get("/suppliers", { params });
      return {
        success: true,
        data: response.data.data || response.data,
        total: response.data.total || response.data.length,
        message: "Suppliers fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || "Failed to fetch suppliers",
        error: error,
      };
    }
  },

  // Get supplier by ID
  getSupplierById: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Supplier fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch supplier",
        error: error,
      };
    }
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    try {
      const response = await apiClient.post("/suppliers", supplierData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data,
        message: "Supplier created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create supplier",
        error: error,
      };
    }
  },

  // Update supplier
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, supplierData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        success: true,
        data: response.data,
        message: "Supplier updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update supplier",
        error: error,
      };
    }
  },

  // Delete supplier
  deleteSupplier: async (id) => {
    try {
      const response = await apiClient.delete(`/suppliers/${id}`);
      return {
        success: true,
        data: response.data,
        message: "Supplier deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to delete supplier",
        error: error,
      };
    }
  },

  // Bulk delete suppliers
  bulkDeleteSuppliers: async (ids) => {
    try {
      const response = await apiClient.post("/suppliers/bulk-delete", { ids });
      return {
        success: true,
        data: response.data,
        message: "Suppliers deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to delete suppliers",
        error: error,
      };
    }
  },

  // Update supplier status
  updateSupplierStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/suppliers/${id}/status`, { status });
      return {
        success: true,
        data: response.data,
        message: "Supplier status updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update supplier status",
        error: error,
      };
    }
  },
};

export default supplierService;