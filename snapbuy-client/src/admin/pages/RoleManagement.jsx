import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaShieldAlt } from 'react-icons/fa';
import '../styles/admin.css';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // TODO: Fetch from API
        // Mock data
        setRoles([
            {
                id: 1,
                name: 'Quản Trị Cấp Cao',
                description: 'Toàn quyền truy cập hệ thống với tất cả quyền hạn',
                permissions: ['all'],
                userCount: 3,
                color: 'danger',
                createdAt: '2024-01-01'
            },
            {
                id: 2,
                name: 'Quản Lý Cửa Hàng',
                description: 'Quản lý cài đặt cửa hàng và người dùng',
                permissions: ['store.manage', 'users.view', 'products.manage', 'orders.manage'],
                userCount: 45,
                color: 'primary',
                createdAt: '2024-01-01'
            },
            {
                id: 3,
                name: 'Chủ Cửa Hàng',
                description: 'Toàn quyền truy cập cửa hàng sở hữu',
                permissions: ['store.full', 'users.manage', 'products.full', 'orders.full', 'reports.view'],
                userCount: 127,
                color: 'success',
                createdAt: '2024-01-01'
            },
            {
                id: 4,
                name: 'Nhân Viên Bán Hàng',
                description: 'Xử lý bán hàng và đơn hàng khách hàng',
                permissions: ['orders.create', 'orders.view', 'products.view', 'customers.manage'],
                userCount: 856,
                color: 'info',
                createdAt: '2024-01-15'
            },
            {
                id: 5,
                name: 'Quản Lý Kho',
                description: 'Quản lý tồn kho và hàng hóa',
                permissions: ['products.manage', 'inventory.full', 'suppliers.manage'],
                userCount: 234,
                color: 'warning',
                createdAt: '2024-02-01'
            },
            {
                id: 6,
                name: 'Kế Toán',
                description: 'Truy cập báo cáo tài chính và dữ liệu',
                permissions: ['reports.view', 'orders.view', 'revenue.view'],
                userCount: 89,
                color: 'secondary',
                createdAt: '2024-02-15'
            },
            {
                id: 7,
                name: 'Hỗ Trợ Khách Hàng',
                description: 'Xử lý yêu cầu và hỗ trợ khách hàng',
                permissions: ['customers.view', 'orders.view', 'support.manage'],
                userCount: 342,
                color: 'info',
                createdAt: '2024-03-01'
            }
        ]);
    }, []);

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa vai trò này?')) {
            // TODO: Call API to delete
            setRoles(roles.filter((r) => r.id !== id));
        }
    };

    return (
        <div className="admin-page admin-fade-in">
            {/* Page Header */}
            <div className="admin-flex-between admin-mb-3">
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-text-primary)', margin: 0 }}>
                        Quản Lý Vai Trò
                    </h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Quản lý vai trò và quyền hạn người dùng trên tất cả cửa hàng
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary">
                    <FaPlus /> Tạo Vai Trò Mới
                </button>
            </div>

            {/* Search */}
            <div className="admin-card admin-mb-3">
                <div style={{ position: 'relative' }}>
                    <FaSearch
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--admin-text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Tìm kiếm vai trò theo tên hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--admin-spacing-md)' }}>
                {filteredRoles.map((role) => (
                    <div key={role.id} className="admin-card" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: 'var(--admin-radius-md)',
                                        background: `rgba(${role.color === 'danger' ? '239, 68, 68' :
                                            role.color === 'primary' ? '99, 102, 241' :
                                                role.color === 'success' ? '16, 185, 129' :
                                                    role.color === 'info' ? '59, 130, 246' :
                                                        role.color === 'warning' ? '245, 158, 11' :
                                                            '156, 163, 175'
                                            }, 0.1)`,
                                        color: `var(--admin-accent-${role.color})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    <FaUserShield />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-text-primary)' }}>
                                        {role.name}
                                    </h3>
                                    <span className={`admin-badge ${role.color}`} style={{ marginTop: '0.25rem' }}>
                                        {role.userCount} người dùng
                                    </span>
                                </div>
                            </div>
                            <div className="admin-action-btns">
                                <button className="admin-btn-icon edit" title="Sửa Vai Trò">
                                    <FaEdit />
                                </button>
                                <button
                                    className="admin-btn-icon delete"
                                    title="Xóa Vai Trò"
                                    onClick={() => handleDelete(role.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {role.description}
                        </p>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Quyền Hạn
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {role.permissions.slice(0, 4).map((perm, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'var(--admin-bg-tertiary)',
                                            border: '1px solid var(--admin-border-color)',
                                            borderRadius: 'var(--admin-radius-sm)',
                                            fontSize: '0.75rem',
                                            color: 'var(--admin-text-secondary)'
                                        }}
                                    >
                                        {perm}
                                    </span>
                                ))}
                                {role.permissions.length > 4 && (
                                    <span
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: 'var(--admin-bg-tertiary)',
                                            border: '1px solid var(--admin-border-color)',
                                            borderRadius: 'var(--admin-radius-sm)',
                                            fontSize: '0.75rem',
                                            color: 'var(--admin-accent-primary)',
                                            fontWeight: '600'
                                        }}
                                    >
                                        +{role.permissions.length - 4} thêm
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border-color)', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                            Ngày tạo: {new Date(role.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <FaUserShield style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3, color: 'var(--admin-text-muted)' }} />
                    <p style={{ color: 'var(--admin-text-muted)' }}>Không tìm thấy vai trò</p>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
