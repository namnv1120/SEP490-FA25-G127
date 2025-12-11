import React, { useState, useEffect } from 'react';
import { FaStore, FaUsers, FaChartLine, FaDatabase, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import StatsCard from '../components/StatsCard';
import '../styles/admin.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStores: 0,
        activeStores: 0,
        totalUsers: 0,
        totalRevenue: 0
    });

    const [recentStores, setRecentStores] = useState([]);

    useEffect(() => {
        // TODO: Fetch from API
        // Mock data
        setStats({
            totalStores: 127,
            activeStores: 115,
            totalUsers: 3542,
            totalRevenue: 1250000
        });

        setRecentStores([
            { id: 1, name: 'Tech Store VN', domain: 'techstore.snapbuy.vn', status: 'Hoạt Động', users: 45, createdAt: '2024-12-01' },
            { id: 2, name: 'Fashion Hub', domain: 'fashion.snapbuy.vn', status: 'Hoạt Động', users: 32, createdAt: '2024-12-03' },
            { id: 3, name: 'Book Corner', domain: 'books.snapbuy.vn', status: 'Chờ Duyệt', users: 12, createdAt: '2024-12-05' },
            { id: 4, name: 'Home Decor', domain: 'homedecor.snapbuy.vn', status: 'Hoạt Động', users: 28, createdAt: '2024-12-07' },
            { id: 5, name: 'Sports Gear', domain: 'sports.snapbuy.vn', status: 'Ngừng Hoạt Động', users: 8, createdAt: '2024-12-08' }
        ]);
    }, []);

    return (
        <div className="admin-page admin-fade-in">
            {/* Stats Grid */}
            <div className="admin-stats-grid">
                <StatsCard
                    title="Tổng Số Cửa Hàng"
                    value={stats.totalStores}
                    change="+12.5%"
                    changeType="positive"
                    icon={<FaStore />}
                    iconColor="primary"
                    period="so với tháng trước"
                />
                <StatsCard
                    title="Cửa Hàng Hoạt Động"
                    value={stats.activeStores}
                    change="+8.2%"
                    changeType="positive"
                    icon={<FaDatabase />}
                    iconColor="success"
                    period="so với tháng trước"
                />
                <StatsCard
                    title="Tổng Người Dùng"
                    value={stats.totalUsers.toLocaleString()}
                    change="+15.3%"
                    changeType="positive"
                    icon={<FaUsers />}
                    iconColor="info"
                    period="so với tháng trước"
                />
                <StatsCard
                    title="Tổng Doanh Thu"
                    value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
                    change="+23.1%"
                    changeType="positive"
                    icon={<FaChartLine />}
                    iconColor="warning"
                    period="so với tháng trước"
                />
            </div>

            {/* Recent Stores Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Cửa Hàng Gần Đây</h2>
                    <div className="admin-card-actions">
                        <button className="admin-btn admin-btn-secondary">
                            <FaPlus /> Thêm Cửa Hàng Mới
                        </button>
                    </div>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Cửa Hàng</th>
                                <th>Tên Miền</th>
                                <th>Trạng Thái</th>
                                <th>Người Dùng</th>
                                <th>Ngày Tạo</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentStores.map((store) => (
                                <tr key={store.id}>
                                    <td>#{store.id}</td>
                                    <td>
                                        <strong>{store.name}</strong>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--admin-accent-primary)' }}>
                                            {store.domain}
                                        </code>
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
                                    <td>{new Date(store.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="admin-action-btns">
                                            <button className="admin-btn-icon view" title="Xem">
                                                <FaEye />
                                            </button>
                                            <button className="admin-btn-icon edit" title="Sửa">
                                                <FaEdit />
                                            </button>
                                            <button className="admin-btn-icon delete" title="Xóa">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Chart Placeholder */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Tổng Quan Hoạt Động Cửa Hàng</h2>
                </div>
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                    <FaChartLine style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                    <p>Biểu đồ sẽ được tích hợp tại đây</p>
                    <p style={{ fontSize: '0.875rem' }}>
                        (Sử dụng Chart.js hoặc Recharts để hiển thị)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
