import React from "react";

const DeleteConfirmModal = ({
  show,
  onClose,
  onConfirm,
  itemName,
  loading,
}) => {
  if (!show) return null;

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
      onClick={onClose}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: "450px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            Xác nhận xóa
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--admin-text-muted)",
              padding: "0.25rem",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              color: "var(--admin-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            Bạn có chắc muốn xóa{" "}
            <strong style={{ color: "var(--admin-text-primary)" }}>
              "{itemName}"
            </strong>
            ?
          </p>
          <p
            style={{
              color: "var(--admin-accent-danger)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            ⚠️ Hành động này không thể hoàn tác!
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--admin-radius-md)",
              fontWeight: "600",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "var(--admin-transition-base)",
              border: "none",
              background: "var(--admin-accent-danger)",
              color: "white",
            }}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
