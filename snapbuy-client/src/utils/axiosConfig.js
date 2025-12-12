import axios from 'axios';

let isSessionExpiredShown = false;

// Set baseURL cho development - Vite proxy sẽ forward /api sang localhost:8080
// Không set trong production để dùng relative URL
if (import.meta.env.DEV) {
  axios.defaults.baseURL = '';
}

// Axios Request Interceptor để thêm tenant ID
axios.interceptors.request.use(
  (config) => {
    // Thêm Authorization header nếu có token
    const token = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('authTokenType');
    if (token) {
      config.headers.Authorization = `${tokenType || 'Bearer'} ${token}`;
    }

    // Thêm X-Tenant-ID header nếu có (quan trọng cho multi-tenancy)
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm hiển thị modal session expired với countdown
const showSessionExpiredModal = () => {
  let countdown = 5;

  // Tạo overlay mờ
  const overlay = document.createElement('div');
  overlay.id = 'session-expired-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9998;
    backdrop-filter: blur(5px);
  `;
  document.body.appendChild(overlay);

  // Tạo modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'session-expired-modal';
  modalContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    min-width: 450px;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  `;

  // Thêm animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -60%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;
  document.head.appendChild(style);

  // Nội dung modal
  modalContainer.innerHTML = `
    <div style="margin-bottom: 20px;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#ff4d4f" stroke-width="2"/>
        <path d="M12 8V12" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="16" r="1" fill="#ff4d4f"/>
      </svg>
    </div>
    <h2 style="font-size: 24px; font-weight: 600; color: #262626; margin-bottom: 12px;">
      Phiên đăng nhập đã hết hạn
    </h2>
    <p style="font-size: 16px; color: #595959; margin-bottom: 24px;">
      Vui lòng đăng nhập lại
    </p>
    <p style="font-size: 14px; color: #8c8c8c;">
      Quay trở lại trang đăng nhập sau <span id="countdown" style="font-weight: 600; color: #ff4d4f; font-size: 18px;">${countdown}</span> giây
    </p>
  `;

  document.body.appendChild(modalContainer);

  // Countdown timer
  const countdownElement = document.getElementById('countdown');
  const timer = setInterval(() => {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(timer);
      // Redirect về trang login
      window.location.href = '/login';
    }
  }, 1000);
};

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
        // Đánh dấu đã hiển thị thông báo để tránh spam
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

        // Hiển thị modal với countdown
        showSessionExpiredModal();
      }
    }

    // Trả về lỗi để các service khác có thể xử lý
    return Promise.reject(error);
  }
);

export default axios;

