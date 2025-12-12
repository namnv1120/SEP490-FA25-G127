import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaStore, FaGlobe, FaUsers, FaCalendar } from 'react-icons/fa';
import '../styles/admin.css';

const StoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        // TODO: Fetch from API
        // Mock data
        setStores([
            {
                id: 1,
                name: 'Tech Store VN',
                domain: 'techstore.snapbuy.vn',
                owner: 'Nguyễn Văn A',
                email: 'owner@techstore.com',
                phone: '+84 901 234 567',
                status: 'Hoạt Động',
                users: 45,
                products: 1250,
                revenue: 125000,
                createdAt: '2024-01-15',
                plan: 'Premium'
            },
            {
                id: 2,
                name: 'Fashion Hub',
                domain: 'fashion.snapbuy.vn',
                owner: 'Trần Thị B',
                email: 'owner@fashion.com',
                phone: '+84 902 345 678',
                status: 'Hoạt Động',
                users: 32,
                products: 890,
                revenue: 98000,
                createdAt: '2024-02-20',
                plan: 'Business'
            },
            {
                id: 3,
                name: 'Book Corner',
                domain: 'books.snapbuy.vn',
                owner: 'Lê Văn C',
                email: 'owner@books.com',
                phone: '+84 903 456 789',
                status: 'Chờ Duyệt',
                users: 12,
                products: 450,
                revenue: 35000,
                createdAt: '2024-11-05',
                plan: 'Starter'
            },
            {
                id: 4,
                name: 'Home Decor',
                domain: 'homedecor.snapbuy.vn',
                owner: 'Phạm Thị D',
                email: 'owner@homedecor.com',
                phone: '+84 904 567 890',
                status: 'Hoạt Động',
                users: 28,
                products: 670,
                revenue: 78000,
                createdAt: '2024-03-10',
                plan: 'Business'
            },
            {
                id: 5,
                name: 'Sports Gear',
                domain: 'sports.snapbuy.vn',
                owner: 'Hoàng Văn E',
                email: 'owner@sports.com',
                phone: '+84 905 678 901',
                status: 'Ngừng Hoạt Động',
                users: 8,
                products: 230,
                revenue: 15000,
                createdAt: '2024-10-01',
                plan: 'Starter'
            },
            {
                id: 6,
                name: 'Beauty Shop',
                domain: 'beauty.snapbuy.vn',
                owner: 'Nguyễn Thị F',
                email: 'owner@beauty.com',
                phone: '+84 906 789 012',
                status: 'Hoạt Động',
                users: 38,
                products: 980,
                revenue: 110000,
                createdAt: '2024-04-12',
                plan: 'Premium'
            },
            {
                id: 7,
                name: 'Electronics Pro',
                domain: 'electronics.snapbuy.vn',
                owner: 'Trần Văn G',
                email: 'owner@electronics.com',
                phone: '+84 907 890 123',
                status: 'Hoạt Động',
                users: 52,
                products: 1450,
                revenue: 185000,
                createdAt: '2024-01-20',
                plan: 'Enterprise'
            },
            {
                id: 8,
                name: 'Pet Paradise',
                domain: 'pets.snapbuy.vn',
                owner: 'Lê Thị H',
                email: 'owner@pets.com',
                phone: '+84 908 901 234',
                status: 'Hoạt Động',
                users: 22,
                products: 540,
                revenue: 52000,
                createdAt: '2024-06-15',
                plan: 'Business'
            }
        ]);
    }, []);

    const filteredStores = stores.filter((store) => {
        const matchesSearch =
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.owner.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' || store.status.toLowerCase().includes(filterStatus.toLowerCase());

        return matchesSearch && matchesFilter;
    });

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa cửa hàng này?')) {
            // TODO: Call API to delete
            setStores(stores.filter((s) => s.id !== id));
        }
    };

    return (
        <div className="admin-page admin-fade-in">
            {/* Page Header */}
            <div className="admin-flex-between admin-mb-3">
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-text-primary)', margin: 0 }}>
                        Quản Lý Cửa Hàng
                    </h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Quản lý tất cả cửa hàng trong hệ thống đa cửa hàng
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> Thêm Cửa Hàng Mới
                </button>
            </div>

            {/* Filters */}
            <div className="admin-card admin-mb-3">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
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
                            placeholder="Tìm kiếm theo tên, tên miền hoặc chủ sở hữu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FaFilter style={{ color: 'var(--admin-text-muted)' }} />
                        <select
                            className="admin-form-input"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <option value="all">Tất Cả Trạng Thái</option>
                            <option value="hoạt động">Hoạt Động</option>
                            <option value="chờ duyệt">Chờ Duyệt</option>
                            <option value="ngừng">Ngừng Hoạt Động</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="admin-stats-grid admin-mb-3">
                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Tổng Số Cửa Hàng</span>
                        <div className="admin-stats-icon primary">
                            <FaStore />
                        </div>
                    </div>
                    <div className="admin-stats-value">{stores.length}</div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Cửa Hàng Hoạt Động</span>
                        <div className="admin-stats-icon success">
                            <FaGlobe />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        {stores.filter((s) => s.status === 'Hoạt Động').length}
                    </div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Tổng Người Dùng</span>
                        <div className="admin-stats-icon info">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        {stores.reduce((sum, s) => sum + s.users, 0)}
                    </div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Tổng Doanh Thu</span>
                        <div className="admin-stats-icon warning">
                            <FaCalendar />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        ${(stores.reduce((sum, s) => sum + s.revenue, 0) / 1000).toFixed(0)}K
                    </div>
                </div>
            </div>

            {/* Stores Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">
                        Tất Cả Cửa Hàng ({filteredStores.length})
                    </h2>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Thông Tin Cửa Hàng</th>
                                <th>Chủ Sở Hữu</th>
                                <th>Liên Hệ</th>
                                <th>Gói Dịch Vụ</th>
                                <th>Trạng Thái</th>
                                <th>Người Dùng</th>
                                <th>Sản Phẩm</th>
                                <th>Doanh Thu</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStores.map((store) => (
                                <tr key={store.id}>
                                    <td>#{store.id}</td>
                                    <td>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                                                {store.name}
                                            </strong>
                                            <code style={{ fontSize: '0.75rem', color: 'var(--admin-accent-primary)' }}>
                                                {store.domain}
                                            </code>
                                        </div>
                                    </td>
                                    <td>{store.owner}</td>
                                    <td>
                                        <div style={{ fontSize: '0.75rem' }}>
                                            <div>{store.email}</div>
                                            <div style={{ color: 'var(--admin-text-muted)' }}>{store.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`admin-badge ${store.plan === 'Enterprise'
                                                    ? 'info'
                                                    : store.plan === 'Premium'
                                                        ? 'success'
                                                        : 'secondary'
                                                }`}
                                        >
                                            {store.plan}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`admin-badge ${store.status === 'Hoạt Động'
                                                    ? 'success'
                                                    : store.status === 'Chờ Duyệt'
                                                        ? 'warning'
                                                        : 'danger'
                                                }`}
                                        >
                                            {store.status}
                                        </span>
                                    </td>
                                    <td>{store.users}</td>
                                    <td>{store.products.toLocaleString()}</td>
                                    <td>${(store.revenue / 1000).toFixed(1)}K</td>
                                    <td>
                                        <div className="admin-action-btns">
                                            <button className="admin-btn-icon view" title="Xem Chi Tiết">
                                                <FaEye />
                                            </button>
                                            <button className="admin-btn-icon edit" title="Sửa Cửa Hàng">
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="admin-btn-icon delete"
                                                title="Xóa Cửa Hàng"
                                                onClick={() => handleDelete(store.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStores.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                        <FaStore style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Không tìm thấy cửa hàng</p>
                    </div>
                )}
            </div>

            {/* Add Store Modal Placeholder */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="admin-card"
                        style={{ maxWidth: '600px', width: '90%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Thêm Cửa Hàng Mới</h2>
                        </div>
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                            <p>Form sẽ được triển khai tại đây</p>
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setShowAddModal(false)}
                                style={{ marginTop: '1rem' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreManagement;
