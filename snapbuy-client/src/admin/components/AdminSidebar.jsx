import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaStore,
    FaUserShield,
    FaUsers,
    FaCog,
    FaChartLine,
    FaDatabase,
    FaBell,
    FaFileAlt
} from 'react-icons/fa';

const AdminSidebar = () => {
    const navItems = [
        {
            section: 'Tổng Quan',
            items: [
                { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Bảng Điều Khiển', badge: null },
                { path: '/admin/analytics', icon: <FaChartLine />, label: 'Phân Tích', badge: null }
            ]
        },
        {
            section: 'Quản Lý',
            items: [
                { path: '/admin/stores', icon: <FaStore />, label: 'Quản Lý Cửa Hàng', badge: '12' },
                { path: '/admin/roles', icon: <FaUserShield />, label: 'Quản Lý Vai Trò', badge: null },
                { path: '/admin/accounts', icon: <FaUsers />, label: 'Quản Lý Tài Khoản', badge: '3' }
            ]
        },
        {
            section: 'Hệ Thống',
            items: [
                { path: '/admin/database', icon: <FaDatabase />, label: 'Cơ Sở Dữ Liệu', badge: null },
                { path: '/admin/notifications', icon: <FaBell />, label: 'Thông Báo', badge: '5' },
                { path: '/admin/logs', icon: <FaFileAlt />, label: 'Nhật Ký Hệ Thống', badge: null },
                { path: '/admin/settings', icon: <FaCog />, label: 'Cài Đặt', badge: null }
            ]
        }
    ];

    return (
        <aside className="admin-sidebar admin-slide-in">
            <div className="admin-sidebar-header">
                <div className="admin-sidebar-logo" style={{ background: 'transparent' }}>
                    <img
                        src="/src/assets/img/logo.png"
                        alt="SnapBuy"
                        style={{
                            width: '65px',
                            height: 'auto'
                        }}
                    />
                </div>
                <div className="admin-sidebar-brand">
                    <h2 className="admin-sidebar-brand-title">SnapBuy</h2>
                    <p className="admin-sidebar-brand-subtitle">Cổng Quản Trị</p>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {navItems.map((section, idx) => (
                    <div key={idx} className="admin-nav-section">
                        <h3 className="admin-nav-section-title">{section.section}</h3>
                        {section.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="admin-nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `admin-nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="admin-nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="admin-nav-badge">{item.badge}</span>
                                    )}
                                </NavLink>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
