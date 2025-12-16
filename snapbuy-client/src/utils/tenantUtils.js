/**
 * Tenant Detection Utility
 * Phát hiện xem đang truy cập từ admin domain hay tenant subdomain
 */

/**
 * Lấy thông tin subdomain từ hostname
 * @returns {Object} { isAdmin: boolean, tenantSlug: string|null, hostname: string }
 */
export const getTenantInfo = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;

  // Development: localhost hoặc 127.0.0.1
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // Nếu không có port hoặc port 80, coi như admin
    // Hoặc có thể dùng localhost:3000 cho admin
    return {
      isAdmin: true,
      tenantSlug: null,
      hostname: hostname,
      isDevelopment: true,
    };
  }

  // Development với subdomain: tenant1.localhost, admin.localhost
  if (hostname.includes(".localhost")) {
    const subdomain = hostname.split(".")[0];

    // admin.localhost → Admin Portal
    if (subdomain === "admin" || subdomain === "www") {
      return {
        isAdmin: true,
        tenantSlug: null,
        hostname: hostname,
        isDevelopment: true,
      };
    }

    // tenant1.localhost → Tenant App
    return {
      isAdmin: false,
      tenantSlug: subdomain,
      hostname: hostname,
      isDevelopment: true,
    };
  }

  // Production: snapbuy.com.vn
  if (hostname === "snapbuy.com.vn" || hostname === "www.snapbuy.com.vn") {
    return {
      isAdmin: true,
      tenantSlug: null,
      hostname: hostname,
      isDevelopment: false,
    };
  }

  // Production với subdomain: tenant1.snapbuy.com.vn
  if (hostname.endsWith(".snapbuy.com.vn")) {
    const subdomain = hostname.split(".")[0];

    return {
      isAdmin: false,
      tenantSlug: subdomain,
      hostname: hostname,
      isDevelopment: false,
    };
  }

  // Default: coi như admin
  return {
    isAdmin: true,
    tenantSlug: null,
    hostname: hostname,
    isDevelopment: true,
  };
};

/**
 * Kiểm tra xem có phải admin portal không
 */
export const isAdminPortal = () => {
  return getTenantInfo().isAdmin;
};

/**
 * Lấy tenant slug
 */
export const getTenantSlug = () => {
  return getTenantInfo().tenantSlug;
};

/**
 * Lưu tenant info vào localStorage để dùng trong API calls
 */
export const saveTenantContext = () => {
  const tenantInfo = getTenantInfo();
  localStorage.setItem("tenantInfo", JSON.stringify(tenantInfo));
  return tenantInfo;
};

/**
 * Lấy tenant info từ localStorage
 */
export const getTenantContext = () => {
  const stored = localStorage.getItem("tenantInfo");
  return stored ? JSON.parse(stored) : getTenantInfo();
};

/**
 * Build URL cho tenant (để redirect hoặc link)
 */
export const buildTenantUrl = (tenantSlug, path = "/") => {
  const isDev = window.location.hostname.includes("localhost");

  if (isDev) {
    return `http://${tenantSlug}.localhost:${window.location.port || 5173}${path}`;
  }

  return `https://${tenantSlug}.snapbuy.com.vn${path}`;
};

/**
 * Build URL cho admin portal
 */
export const buildAdminUrl = (path = "/") => {
  const isDev = window.location.hostname.includes("localhost");

  if (isDev) {
    return `http://localhost:${window.location.port || 5173}${path}`;
  }

  return `https://snapbuy.com.vn${path}`;
};
