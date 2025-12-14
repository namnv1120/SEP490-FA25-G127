import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const ADMIN_AUTH_URL = `${API_BASE_URL}/api/admin/auth`;

/**
 * Admin Authentication Service
 * Quản lý đăng nhập cho admin portal
 */

/**
 * Đăng nhập admin
 * @param {string} username - Tên đăng nhập admin
 * @param {string} password - Mật khẩu
 * @returns {Promise<Object>} Token và thông tin admin
 */
export const adminLogin = async (username, password) => {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  try {
    const response = await axios.post(`${ADMIN_AUTH_URL}/login`, {
      username,
      password,
    });

    const { result, code, message } = response.data;

    // Kiểm tra response code
    if (code && code !== 1000) {
      throw new Error(message || "Đăng nhập thất bại");
    }

    if (result && result.token) {
      // Lưu token và thông tin admin
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("authTokenType", result.tokenType || "Bearer");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("username", username);

      return {
        success: true,
        data: result,
        message: message || "Đăng nhập thành công",
      };
    } else {
      throw new Error("Login failed: No token received.");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đăng nhập thất bại. Vui lòng thử lại.";
    console.error("Admin login error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Đăng xuất admin
 */
export const adminLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authTokenType");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("accountId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("roleName");
};

export default {
  adminLogin,
  adminLogout,
};
