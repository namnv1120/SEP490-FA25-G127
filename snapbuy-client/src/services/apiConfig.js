/**
 * API Configuration
 * Tập trung quản lý URL và cấu hình API
 */

// Base URL cho API - Rỗng = relative URL (hoạt động cả local Docker và production)
// In development, Vite proxy will redirect /api to localhost:8080
export const API_BASE_URL = import.meta.env.PROD ? "" : "";

// Các endpoint API
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  ACCOUNTS: `${API_BASE_URL}/api/accounts`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  INVENTORIES: `${API_BASE_URL}/api/inventories`,
  INVENTORY_TRANSACTIONS: `${API_BASE_URL}/api/inventory-transactions`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_SETTINGS: `${API_BASE_URL}/api/notification-settings`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  PERMISSIONS: `${API_BASE_URL}/api/permissions`,
  POS_SETTINGS: `${API_BASE_URL}/api/pos-settings`,
  POS_SHIFTS: `${API_BASE_URL}/api/pos-shifts`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_PRICES: `${API_BASE_URL}/api/product-prices`,
  PROMOTIONS: `${API_BASE_URL}/api/promotions`,
  PURCHASE_ORDERS: `${API_BASE_URL}/api/purchase-orders`,
  REVENUE: `${API_BASE_URL}/api/revenue`,
  ROLES: `${API_BASE_URL}/api/roles`,
  SUPPLIERS: `${API_BASE_URL}/api/suppliers`,
  // Reports
  REPORTS: {
    CUSTOMERS: `${API_BASE_URL}/api/reports/customers`,
    PRODUCTS: `${API_BASE_URL}/api/reports/products`,
    PRODUCTS_REVENUE: `${API_BASE_URL}/api/reports/products-revenue`,
    SUPPLIERS: `${API_BASE_URL}/api/reports/suppliers`,
    INVENTORIES: `${API_BASE_URL}/api/reports/inventory`,
  },
};

// Helper function để lấy headers với token
export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Helper function để lấy headers cho multipart/form-data
export const getMultipartHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getAuthHeaders,
  getMultipartHeaders,
};
