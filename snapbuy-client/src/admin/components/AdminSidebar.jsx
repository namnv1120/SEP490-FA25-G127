import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaStore,
  FaUserShield,
  FaUsers,
  FaCog,
  FaChartLine,
  FaDatabase,
  FaBell,
  FaFileAlt,
} from "react-icons/fa";
import { Modal } from "antd";

const AdminSidebar = () => {
  const [showDevModal, setShowDevModal] = useState(false);

  const navItems = [
    {
      section: "Tổng Quan",
      items: [
        {
          path: "/dashboard",
          icon: <FaTachometerAlt />,
          label: "Bảng Điều Khiển",
          badge: null,
        },
        {
          path: "/analytics",
          icon: <FaChartLine />,
          label: "Phân Tích",
          badge: null,
        },
      ],
    },
    {
      section: "Quản Lý",
      items: [
        {
          path: "/stores",
          icon: <FaStore />,
          label: "Quản Lý Cửa Hàng",
          badge: null,
        },
        {
          path: "/accounts",
          icon: <FaUsers />,
          label: "Quản Lý Tài Khoản",
          badge: null,
        },
        {
          path: "/roles",
          icon: <FaUserShield />,
          label: "Quản Lý Vai Trò",
          badge: null,
        },
      ],
    },
    {
      section: "Hệ Thống",
      items: [
        {
          path: "/database",
          icon: <FaDatabase />,
          label: "Cơ Sở Dữ Liệu",
          badge: null,
          disabled: true,
        },
        {
          path: "/notifications",
          icon: <FaBell />,
          label: "Thông Báo",
          badge: null,
          disabled: true,
        },
        {
          path: "/logs",
          icon: <FaFileAlt />,
          label: "Nhật Ký Hệ Thống",
          badge: null,
          disabled: true,
        },
        {
          path: "/settings",
          icon: <FaCog />,
          label: "Cài Đặt",
          badge: null,
          disabled: true,
        },
      ],
    },
  ];

  const handleDisabledClick = (e) => {
    e.preventDefault();
    setShowDevModal(true);
  };

  return (
    <aside className="admin-sidebar admin-slide-in">
      <div className="admin-sidebar-header">
        <div
          className="admin-sidebar-logo"
          style={{ background: "transparent" }}
        >
          <img
            src="/src/assets/img/logo.png"
            alt="SnapBuy"
            style={{
              width: "65px",
              height: "auto",
            }}
          />
        </div>
        <div className="admin-sidebar-brand">
          <h2 className="admin-sidebar-brand-title">SnapBuy</h2>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((section, idx) => (
          <div key={idx} className="admin-nav-section">
            <h3 className="admin-nav-section-title">{section.section}</h3>
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="admin-nav-item">
                {item.disabled ? (
                  <a
                    href="#"
                    className="admin-nav-link"
                    onClick={handleDisabledClick}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="admin-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="admin-nav-badge">{item.badge}</span>
                    )}
                  </a>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `admin-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="admin-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="admin-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

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
    </aside>
  );
};

export default AdminSidebar;
