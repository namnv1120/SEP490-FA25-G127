import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.AUTH;

// 🔐 API đăng nhập
export const login = async (username, password) => {
  if (!username || !password)
    throw new Error("Username and password are required.");

  try {
    const response = await axios.post(`${REST_API_BASE_URL}/login`, {
      username,
      password,
    });

    const { token, tokenType, accountId, roleName, fullName } =
      response.data.result || {};

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("authTokenType", tokenType || "Bearer");
      try {
        const decoded = jwtDecode(token);
        const role = decoded.roles[0].authority;
        const cleanRole = role.replace("ROLE_", "");
        localStorage.setItem("role", cleanRole);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
      // Lưu thêm thông tin người dùng đang đăng nhập trước khi trả về
      if (accountId) {
        localStorage.setItem("accountId", accountId);
      }
      if (username) {
        localStorage.setItem("username", username);
      }
      if (fullName) {
        localStorage.setItem("fullName", fullName);
      }
      if (roleName) {
        localStorage.setItem("roleName", roleName);
      }

      return response.data.result;
    } else {
      throw new Error("Login failed: No token received.");
    }
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.message : error.message
    );
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authTokenType");
  localStorage.removeItem("role");
};

// 📧 Gửi yêu cầu quên mật khẩu (gửi mã OTP về email)
export const requestPasswordReset = async (email) => {
  if (!email) throw new Error("Email is required.");
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/forgot-password/request`,
      { email }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể gửi yêu cầu đặt lại mật khẩu"
    );
  }
};

// ✅ Xác thực OTP trước khi đặt lại mật khẩu
export const verifyOtp = async (email, code) => {
  if (!email || !code) throw new Error("Thiếu thông tin bắt buộc.");
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/forgot-password/verify`,
      { email, code }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn"
    );
  }
};

// 🔒 Đặt lại mật khẩu bằng email + mã OTP
export const resetPassword = async (
  email,
  code,
  newPassword,
  confirmNewPassword
) => {
  if (!email || !code || !newPassword || !confirmNewPassword)
    throw new Error("Thiếu thông tin bắt buộc.");
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/forgot-password/reset`,
      {
        email,
        code,
        newPassword,
        confirmNewPassword,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đổi mật khẩu");
  }
};
