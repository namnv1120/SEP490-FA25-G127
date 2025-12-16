import axios from 'axios';
import { getTenantContext } from './tenantUtils';

let isSessionExpiredShown = false;

// Set baseURL cho development - Vite proxy sẽ forward /api sang localhost:8080
// Không set trong production để dùng relative URL
if (import.meta.env.DEV) {
  axios.defaults.baseURL = '';
}

// Axios Request Interceptor để thêm tenant ID và subdomain info
axios.interceptors.request.use(
  (config) => {
    // Lấy thông tin tenant từ subdomain
    const tenantContext = getTenantContext();

    // Thêm Authorization header nếu có token
    const token = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('authTokenType');
    if (token) {
      config.headers.Authorization = `${tokenType || 'Bearer'} ${token}`;
    }

    // Thêm X-Tenant-Slug header (từ subdomain)
    if (tenantContext.tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantContext.tenantSlug;
    }

    // Thêm X-Tenant-ID header nếu có (từ localStorage sau khi login)
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // Thêm X-Is-Admin header để backend biết request từ admin portal
    if (tenantContext.isAdmin) {
      config.headers['X-Is-Admin'] = 'true';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor để xử lý lỗi 401 (Unauthorized)
axios.interceptors.response.use(
  (response) => {
    // Nếu response thành công, trả về response
    return response;
  },
  (error) => {
    // Kiểm tra nếu lỗi là 401 Unauthorized
    if (error.response && error.response.status === 401) {
      const errorCode = error.response.data?.code;

      // Kiểm tra các trường hợp token hết hạn hoặc không hợp lệ
      const isTokenExpired =
        errorCode === 'TOKEN_EXPIRED' ||
        errorCode === 'TOKEN_REVOKED' ||
        errorCode === 'TOKEN_INVALID' ||
        errorCode === 'UNAUTHENTICATED';

      if (isTokenExpired && !isSessionExpiredShown) {
        // Đánh dấu đã xử lý để tránh spam
        isSessionExpiredShown = true;

        // Xóa token và thông tin user khỏi localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenType');
        localStorage.removeItem('role');
        localStorage.removeItem('roleName');
        localStorage.removeItem('fullName');
        localStorage.removeItem('accountId');
        localStorage.removeItem('username');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantCode');

        // Redirect về trang login ngay lập tức
        window.location.href = '/login';
      }
    }

    // Trả về lỗi để các service khác có thể xử lý
    return Promise.reject(error);
  }
);

export default axios;

