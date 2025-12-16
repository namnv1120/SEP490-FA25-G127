import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  type = "warning", // warning, danger, info, success
}) => {
  if (!show) return null;

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "var(--admin-accent-danger)";
      case "success":
        return "var(--admin-accent-success)";
      case "info":
        return "var(--admin-accent-info)";
      case "warning":
      default:
        return "var(--admin-accent-warning)";
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "danger";
      case "success":
        return "success";
      case "info":
        return "info";
      case "warning":
      default:
        return "warning";
    }
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
      onClick={loading ? undefined : onClose}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "450px",
          width: "100%",
          padding: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
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
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--admin-text-secondary)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1.25rem",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Icon & Content */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: `${getIconColor()}20`,
              marginBottom: "1rem",
            }}
          >
            <FaExclamationTriangle
              style={{
                fontSize: "2rem",
                color: getIconColor(),
              }}
            />
          </div>

          {message && (
            <p
              style={{
                fontSize: "1rem",
                color: "var(--admin-text-primary)",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              {message}
            </p>
          )}

          {description && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--admin-text-secondary)",
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="admin-btn admin-btn-secondary"
            style={{
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`admin-btn admin-btn-${getButtonClass()}`}
            style={{
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
