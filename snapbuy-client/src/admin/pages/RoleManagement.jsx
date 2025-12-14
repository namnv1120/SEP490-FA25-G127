import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaShieldAlt,
} from "react-icons/fa";
import { message, Modal } from "antd";
import {
  getAllRoles,
  deleteRole,
  createRole,
  updateRole,
} from "../../services/RoleService";
import "../styles/admin.css";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);

      // Check authentication
      const token = localStorage.getItem("authToken");
      console.log("🔑 Auth Token:", token ? "Có token" : "Không có token");
      console.log("🔑 Token Type:", localStorage.getItem("authTokenType"));

      if (!token) {
        message.error("Vui lòng đăng nhập để truy cập");
        return;
      }

      const data = await getAllRoles();
      console.log("✅ Raw API data:", data);

      // Map API data to component format
      const mappedRoles = data.map((role) => {
        return {
          id: role.roleId || role.id,
          name: role.roleName || role.name,
          description: role.description || "",
          userCount: role.userCount || 0,
          color: getRoleColor(role.roleName || role.name),
          createdAt:
            role.createdDate || role.createdAt || new Date().toISOString(),
        };
      });
      console.log("✅ Mapped roles:", mappedRoles);
      setRoles(mappedRoles);
      if (mappedRoles.length > 0) {
        message.success(`Đã tải ${mappedRoles.length} vai trò`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải vai trò:", error);
      if (
        error.message.includes("Access Denied") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        message.error(
          "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin."
        );
      } else {
        message.error(error.message || "Không thể tải danh sách vai trò");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName) => {
    if (!roleName) return "secondary";
    const name = roleName.toLowerCase();
    if (name.includes("admin") || name.includes("quản trị")) return "danger";
    if (name.includes("manager") || name.includes("quản lý")) return "primary";
    if (name.includes("owner") || name.includes("chủ")) return "success";
    if (name.includes("staff") || name.includes("nhân viên")) return "info";
    if (name.includes("inventory") || name.includes("kho")) return "warning";
    return "secondary";
  };

  const filteredRoles = roles.filter(
    (role) =>
      (role.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Roles:", roles);
  console.log("Filtered roles:", filteredRoles);

  const handleDelete = (role) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa vai trò "${role.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteRole(role.id);
          message.success("Xóa vai trò thành công");
          fetchRoles();
        } catch (error) {
          console.error("Lỗi khi xóa vai trò:", error);
          message.error(error.message || "Không thể xóa vai trò");
        }
      },
    });
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        roleName: role.name,
        description: role.description,
      });
    } else {
      setEditingRole(null);
      setFormData({
        roleName: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      roleName: "",
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roleName.trim()) {
      message.error("Vui lòng nhập tên vai trò");
      return;
    }

    try {
      setLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        message.success("Cập nhật vai trò thành công");
      } else {
        await createRole(formData);
        message.success("Tạo vai trò thành công");
      }
      handleCloseModal();
      fetchRoles();
    } catch (error) {
      console.error("Lỗi khi lưu vai trò:", error);
      message.error(error.message || "Không thể lưu vai trò");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-fade-in">
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            Đang tải...
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="admin-flex-between admin-mb-3">
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "700",
              color: "var(--admin-text-primary)",
              margin: 0,
            }}
          >
            Quản Lý Vai Trò
          </h1>
          <p
            style={{
              color: "var(--admin-text-secondary)",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
            }}
          >
            Quản lý vai trò và quyền hạn người dùng trên tất cả cửa hàng
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <FaPlus /> Tạo Vai Trò Mới
        </button>
      </div>

      {/* Search */}
      <div className="admin-card admin-mb-3">
        <div style={{ position: "relative" }}>
          <FaSearch
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--admin-text-muted)",
            }}
          />
          <input
            type="text"
            className="admin-form-input"
            placeholder="Tìm kiếm vai trò theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid admin-mb-3">
        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Tổng Số Vai Trò</span>
            <div className="admin-stats-icon primary">
              <FaUserShield />
            </div>
          </div>
          <div className="admin-stats-value">{roles.length}</div>
        </div>

        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Tổng Người Dùng</span>
            <div className="admin-stats-icon success">
              <FaShieldAlt />
            </div>
          </div>
          <div className="admin-stats-value">
            {roles.reduce((sum, r) => sum + r.userCount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "var(--admin-spacing-md)",
        }}
      >
        {filteredRoles.map((role) => (
          <div key={role.id} className="admin-card" style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--admin-radius-md)",
                    background: `rgba(${
                      role.color === "danger"
                        ? "239, 68, 68"
                        : role.color === "primary"
                        ? "99, 102, 241"
                        : role.color === "success"
                        ? "16, 185, 129"
                        : role.color === "info"
                        ? "59, 130, 246"
                        : role.color === "warning"
                        ? "245, 158, 11"
                        : "156, 163, 175"
                    }, 0.1)`,
                    color: `var(--admin-accent-${role.color})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  <FaUserShield />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    {role.name}
                  </h3>
                  <span
                    className={`admin-badge ${role.color}`}
                    style={{ marginTop: "0.25rem" }}
                  >
                    {role.userCount} người dùng
                  </span>
                </div>
              </div>
              <div className="admin-action-btns">
                <button
                  className="admin-btn-icon edit"
                  title="Sửa Vai Trò"
                  onClick={() => handleOpenModal(role)}
                >
                  <FaEdit />
                </button>
                <button
                  className="admin-btn-icon delete"
                  title="Xóa Vai Trò"
                  onClick={() => handleDelete(role)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <p
              style={{
                color: "var(--admin-text-secondary)",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              {role.description || "Không có mô tả"}
            </p>

            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--admin-border-color)",
                fontSize: "0.75rem",
                color: "var(--admin-text-muted)",
              }}
            >
              Ngày tạo: {new Date(role.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div
          className="admin-card"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <FaUserShield
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              opacity: 0.3,
              color: "var(--admin-text-muted)",
            }}
          />
          <p style={{ color: "var(--admin-text-muted)" }}>
            Không tìm thấy vai trò
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
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
          onClick={handleCloseModal}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
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
                {editingRole ? "Chỉnh Sửa Vai Trò" : "Tạo Vai Trò Mới"}
              </h2>
              <button
                onClick={handleCloseModal}
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

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  Tên Vai Trò{" "}
                  <span style={{ color: "var(--admin-accent-danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Nhập tên vai trò..."
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  Mô Tả
                </label>
                <textarea
                  className="admin-form-input"
                  placeholder="Nhập mô tả vai trò..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Đang lưu..."
                    : editingRole
                    ? "Cập Nhật"
                    : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
