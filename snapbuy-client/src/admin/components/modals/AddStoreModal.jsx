import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const AddStoreModal = ({ show, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tenantCode: "",
    tenantName: "",
    dbName: "",
    dbHost: "",
    dbPort: 1433,
    dbUsername: "",
    dbPassword: "",
    ownerUsername: "",
    ownerPassword: "",
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        tenantCode: "",
        tenantName: "",
        dbName: "",
        dbHost: "",
        dbPort: 1433,
        dbUsername: "",
        dbPassword: "",
        ownerUsername: "",
        ownerPassword: "",
        ownerFullName: "",
        ownerEmail: "",
        ownerPhone: "",
      });
      setErrors({});
    }
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Auto-generate dbName from tenantCode
    if (name === "tenantCode") {
      const dbName = value ? `snapbuy_${value.replace(/-/g, "_")}` : "";
      setFormData((prev) => ({
        ...prev,
        tenantCode: value,
        dbName: dbName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

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

    // Tenant Code validation
    if (!formData.tenantCode.trim()) {
      newErrors.tenantCode = "Mã cửa hàng không được để trống";
    } else if (!/^[a-z0-9_-]{3,50}$/.test(formData.tenantCode)) {
      newErrors.tenantCode =
        "Mã cửa hàng chỉ được chứa chữ thường, số, gạch dưới và gạch ngang (3-50 ký tự)";
    }

    // Tenant Name validation
    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Tên cửa hàng không được để trống";
    }

    // Database Name validation
    if (!formData.dbName.trim()) {
      newErrors.dbName = "Tên database không được để trống";
    }

    // Owner Username validation
    if (!formData.ownerUsername.trim()) {
      newErrors.ownerUsername = "Tên đăng nhập không được để trống";
    }

    // Owner Full Name validation
    if (!formData.ownerFullName.trim()) {
      newErrors.ownerFullName = "Họ tên chủ sở hữu không được để trống";
    }

    // Email validation
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = "Email không hợp lệ";
    }

    // Phone validation
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.ownerPhone)) {
      newErrors.ownerPhone = "Số điện thoại phải có 10-11 chữ số";
    }

    // Password validation
    if (!formData.ownerPassword.trim()) {
      newErrors.ownerPassword = "Mật khẩu không được để trống";
    } else if (formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = "Mật khẩu phải có ít nhất 6 ký tự";
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
    setFormData({
      tenantCode: "",
      tenantName: "",
      dbName: "",
      dbHost: "",
      dbPort: 1433,
      dbUsername: "",
      dbPassword: "",
      ownerUsername: "",
      ownerPassword: "",
      ownerFullName: "",
      ownerEmail: "",
      ownerPhone: "",
    });
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
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "550px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "1.25rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            paddingBottom: "0.75rem",
            borderBottom: "1px solid var(--admin-border-color)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "var(--admin-text-primary)",
            }}
          >
            Thêm Cửa Hàng Mới
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {/* Tenant Code */}
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
                Mã Cửa Hàng <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="tenantCode"
                value={formData.tenantCode}
                onChange={handleChange}
                placeholder="vd: my-store"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.tenantCode
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.tenantCode && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.tenantCode}
                </p>
              )}
              <p
                style={{
                  color: "var(--admin-text-muted)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  marginBottom: 0,
                }}
              >
                Domain: {formData.tenantCode || "my-store"}.snapbuy.com.vn
              </p>
            </div>

            {/* Tenant Name */}
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
                Tên Cửa Hàng <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleChange}
                placeholder="Nhập tên cửa hàng"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.tenantName
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.tenantName && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.tenantName}
                </p>
              )}
            </div>



            {/* Owner Full Name */}
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
                Họ Tên Chủ Sở Hữu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="ownerFullName"
                value={formData.ownerFullName}
                onChange={handleChange}
                placeholder="Nhập họ tên đầy đủ"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.ownerFullName
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.ownerFullName && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.ownerFullName}
                </p>
              )}
            </div>

            {/* Owner Email */}
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
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="email@example.com"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.ownerEmail
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.ownerEmail && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.ownerEmail}
                </p>
              )}
            </div>

            {/* Owner Phone */}
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
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="0123456789"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.ownerPhone
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.ownerPhone && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.ownerPhone}
                </p>
              )}
            </div>

            {/* Owner Username */}
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
                Tên Đăng Nhập <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="ownerUsername"
                value={formData.ownerUsername}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.ownerUsername
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.ownerUsername && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.ownerUsername}
                </p>
              )}
            </div>

            {/* Owner Password */}
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
                Mật Khẩu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                name="ownerPassword"
                value={formData.ownerPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--admin-bg-tertiary)",
                  border: `1px solid ${errors.ownerPassword
                      ? "var(--admin-accent-danger)"
                      : "var(--admin-border-color)"
                    }`,
                  borderRadius: "var(--admin-radius-md)",
                  color: "var(--admin-text-primary)",
                  fontSize: "0.875rem",
                }}
              />
              {errors.ownerPassword && (
                <p
                  style={{
                    color: "var(--admin-accent-danger)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    marginBottom: 0,
                  }}
                >
                  {errors.ownerPassword}
                </p>
              )}
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
              {loading ? "Đang tạo..." : "Tạo Cửa Hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
