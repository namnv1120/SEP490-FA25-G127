import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaEnvelope, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';

const AdminHeader = ({ title = 'Bảng Điều Khiển' }) => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // Load admin user from localStorage
        const user = localStorage.getItem('adminUser');
        if (user) {
            setAdminUser(JSON.parse(user));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
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

                {/* Actions */}
                <div className="admin-header-actions">
                    <button className="admin-header-btn" title="Thông Báo">
                        <FaBell />
                        <span className="admin-header-btn-badge">5</span>
                    </button>

                    <button className="admin-header-btn" title="Tin Nhắn">
                        <FaEnvelope />
                        <span className="admin-header-btn-badge">3</span>
                    </button>

                    <button className="admin-header-btn" title="Cài Đặt">
                        <FaCog />
                    </button>
                </div>

                {/* User Menu */}
                <div
                    className="admin-user-menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{ position: 'relative' }}
                >
                    <div className="admin-user-avatar">
                        {adminUser?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="admin-user-info">
                        <div className="admin-user-name">{adminUser?.name || 'Quản Trị Viên'}</div>
                        <div className="admin-user-role">{adminUser?.role || 'Quản Trị Cấp Cao'}</div>
                    </div>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: 'var(--admin-bg-card)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: 'var(--admin-radius-md)',
                                boxShadow: 'var(--admin-shadow-lg)',
                                minWidth: '200px',
                                zIndex: 1000
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid var(--admin-border-color)',
                                    cursor: 'pointer',
                                    transition: 'var(--admin-transition-fast)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onClick={() => navigate('/admin/profile')}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <FaUser />
                                <span>Hồ Sơ</span>
                            </div>
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid var(--admin-border-color)',
                                    cursor: 'pointer',
                                    transition: 'var(--admin-transition-fast)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onClick={() => navigate('/admin/settings')}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <FaCog />
                                <span>Cài Đặt</span>
                            </div>
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    transition: 'var(--admin-transition-fast)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--admin-accent-danger)'
                                }}
                                onClick={handleLogout}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <FaSignOutAlt />
                                <span>Đăng Xuất</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
