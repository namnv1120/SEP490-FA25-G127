import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { notification } from "antd";
import AdminLoading from "../components/AdminLoading";
import { adminLogin } from "../../services/AdminAuthService";
import "../styles/admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call admin login API
      const result = await adminLogin(formData.username, formData.password);

      if (result.success) {
        notification.success({
          message: "Đăng nhập thành công!",
          description:
            result.message || "Chào mừng bạn đến với hệ thống quản trị SnapBuy",
          duration: 2,
        });

        // Navigate to admin dashboard
        navigate("/dashboard");
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description:
            result.error || "Vui lòng kiểm tra lại thông tin đăng nhập",
          duration: 3,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      notification.error({
        message: "Lỗi đăng nhập",
        description: error.message || "Lỗi kết nối đến máy chủ",
        duration: 3,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <AdminLoading message="Đang đăng nhập..." />}

      <div className="admin-login-container">
        <div className="admin-login-box admin-fade-in">
          <div className="admin-login-header">
            <div
              className="admin-login-logo"
              style={{
                background: "transparent",
                boxShadow: "none",
                width: "280px",
                height: "auto",
                margin: "0 auto",
              }}
            >
              <img
                src="/src/assets/img/logo.png"
                alt="SnapBuy"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                <FaUser style={{ marginRight: "0.5rem" }} />
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                className="admin-form-input"
                placeholder="Tên đăng nhập của bạn"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                <FaLock style={{ marginRight: "0.5rem" }} />
                Mật Khẩu
              </label>
              <input
                type="password"
                name="password"
                className="admin-form-input"
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div
              className="admin-form-group"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                name="remember"
                id="remember"
                checked={formData.remember}
                onChange={handleChange}
                style={{ width: "auto" }}
              />
              <label
                htmlFor="remember"
                className="admin-form-label"
                style={{ margin: 0, cursor: "pointer" }}
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Đăng Nhập Quản Trị
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <a
              href="#"
              style={{
                color: "var(--admin-accent-primary)",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
