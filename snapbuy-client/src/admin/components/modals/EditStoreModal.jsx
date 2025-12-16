import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const EditStoreModal = ({ show, onClose, onSubmit, loading, storeData }) => {
  const [formData, setFormData] = useState({
    tenantName: "",
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (storeData) {
      setFormData({
        tenantName: storeData.name || "",
        ownerFullName: storeData.owner || "",
        ownerEmail: storeData.email || "",
        ownerPhone: storeData.phone || "",
      });
    }
  }, [storeData]);

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

    // Tenant Name validation
    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Tên cửa hàng không được để trống";
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
            Cập Nhật Cửa Hàng
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

        {/* Store Info */}
        {storeData && (
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
                Mã cửa hàng:
              </strong>{" "}
              <code
                style={{
                  color: "var(--admin-accent-primary)",
                  fontSize: "0.875rem",
                }}
              >
                {storeData.tenantCode}
              </code>
            </div>
            <div>
              <strong style={{ color: "var(--admin-text-primary)" }}>
                Domain:
              </strong>{" "}
              <code
                style={{
                  color: "var(--admin-accent-primary)",
                  fontSize: "0.875rem",
                }}
              >
                {storeData.domain}
              </code>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Store Name */}
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
                  border: `1px solid ${
                    errors.tenantName
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

            {/* Owner Name */}
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
                  border: `1px solid ${
                    errors.ownerFullName
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
                  border: `1px solid ${
                    errors.ownerEmail
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
                  border: `1px solid ${
                    errors.ownerPhone
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

export default EditStoreModal;
