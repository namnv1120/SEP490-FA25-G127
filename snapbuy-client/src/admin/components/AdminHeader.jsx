import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { Modal } from "antd";
import { adminLogout } from "../../services/AdminAuthService";

const AdminHeader = ({ title = "Bảng Điều Khiển" }) => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  useEffect(() => {
    // Load admin user from localStorage
    const username = localStorage.getItem("username");
    setAdminUser({ name: username || "Admin" });
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    setShowDevModal(true);
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-header-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        {/* Search */}
        <div className="admin-header-search">
          <FaSearch className="admin-header-search-icon" />
          <input
            type="text"
            className="admin-header-search-input"
            placeholder="Tìm kiếm cửa hàng, tài khoản, vai trò..."
          />
        </div>

        {/* User Menu */}
        <div
          className="admin-user-menu"
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ position: "relative" }}
        >
          <div className="admin-user-avatar">
            {adminUser?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="admin-user-info">
            <div className="admin-user-name">
              {adminUser?.name || "Quản Trị Viên"}
            </div>
            <div className="admin-user-role">
              {localStorage.getItem("roleName") || "Quản Trị Viên"}
            </div>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                background: "var(--admin-bg-card)",
                border: "1px solid var(--admin-border-color)",
                borderRadius: "var(--admin-radius-md)",
                boxShadow: "var(--admin-shadow-lg)",
                minWidth: "200px",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--admin-border-color)",
                  cursor: "pointer",
                  transition: "var(--admin-transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onClick={handleSettingsClick}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--admin-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <FaCog />
                <span>Cài Đặt</span>
              </div>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  transition: "var(--admin-transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--admin-accent-danger)",
                }}
                onClick={handleLogout}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--admin-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <FaSignOutAlt />
                <span>Đăng Xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
          <span style={{ color: "var(--admin-text-primary)" }}>
            🚧 Tính Năng Đang Phát Triển
          </span>
        }
        open={showDevModal}
        onOk={() => setShowDevModal(false)}
        onCancel={() => setShowDevModal(false)}
        closable={false}
        footer={[
          <button
            key="ok"
            className="admin-btn admin-btn-primary"
            onClick={() => setShowDevModal(false)}
          >
            Đã Hiểu
          </button>,
        ]}
        centered
        styles={{
          mask: { backgroundColor: "rgba(0, 0, 0, 0.45)" },
          content: {
            backgroundColor: "var(--admin-bg-card)",
            color: "var(--admin-text-primary)",
          },
          header: {
            backgroundColor: "var(--admin-bg-card)",
            borderBottom: "1px solid var(--admin-border-color)",
          },
          body: {
            color: "var(--admin-text-primary)",
          },
        }}
      >
        <div style={{ padding: "1rem 0" }}>
          <p
            style={{
              fontSize: "1rem",
              marginBottom: "0.5rem",
              color: "var(--admin-text-primary)",
            }}
          >
            Tính năng này hiện đang trong quá trình phát triển.
          </p>
          <p
            style={{
              color: "var(--admin-text-muted)",
              marginBottom: 0,
            }}
          >
            Vui lòng quay lại sau hoặc liên hệ với đội ngũ phát triển để biết
            thêm thông tin.
          </p>
        </div>
      </Modal>
    </header>
  );
};

export default AdminHeader;
