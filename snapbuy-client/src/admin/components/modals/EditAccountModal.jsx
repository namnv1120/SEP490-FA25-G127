import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const EditAccountModal = ({
  show,
  onClose,
  onSubmit,
  loading,
  accountData,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (accountData) {
      setFormData({
        fullName: accountData.name || "",
        email: accountData.email || "",
        phone: accountData.phone || "",
        newPassword: "",
      });
    }
  }, [accountData]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "1rem",
      }}
      onClick={handleClose}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--admin-border-color)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "var(--admin-text-primary)",
            }}
          >
            Cập Nhật Tài Khoản
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: loading ? "not-allowed" : "pointer",
              color: "var(--admin-text-muted)",
              padding: "0.25rem",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Account Info */}
        {accountData && (
          <div
            style={{
              background: "var(--admin-bg-tertiary)",
              padding: "1rem",
              borderRadius: "var(--admin-radius-md)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "var(--admin-text-primary)" }}>
                Vai trò:
              </strong>{" "}
              <span
                className="admin-badge success"
                style={{ marginLeft: "0.5rem" }}
              >
                {accountData.role}
              </span>
            </div>
            <div>
              <strong style={{ color: "var(--admin-text-primary)" }}>
                Cửa hàng:
              </strong>{" "}
              <code
                style={{
                  color: "var(--admin-accent-primary)",
                  fontSize: "0.875rem",
                }}
              >
                {accountData.store}
              </code>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Full Name */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              >
                Họ Tên <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ tên đầy đủ"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${
                    errors.fullName
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                  }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.fullName && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              >
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${
                    errors.email
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                  }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.email && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              >
                Số Điện Thoại <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0123456789"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${
                    errors.phone
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                  }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.phone && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password Section */}
            <div
              style={{
                background: "var(--admin-bg-tertiary)",
                padding: "1rem",
                borderRadius: "var(--admin-radius-md)",
                border: "1px solid var(--admin-border-color)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "var(--admin-text-primary)",
                }}
              >
                Thay Đổi Mật Khẩu
              </h3>

              {/* New Password (Optional) */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "var(--admin-text-primary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Mật Khẩu Mới (Tùy chọn)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới nếu muốn thay đổi"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "var(--admin-bg-primary)",
                    border: "1px solid var(--admin-border-color)",
                    borderRadius: "var(--admin-radius-md)",
                    color: "var(--admin-text-primary)",
                    fontSize: "0.875rem",
                  }}
                />
                <p
                  style={{
                    color: "var(--admin-text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  Để trống nếu không muốn thay đổi mật khẩu
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--admin-border-color)",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="admin-btn admin-btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập Nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountModal;
