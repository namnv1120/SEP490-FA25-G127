import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaUsers, FaUserCheck, FaBan, FaClock } from 'react-icons/fa';
import '../styles/admin.css';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        // TODO: Fetch from API
        // Mock data
        setAccounts([
            {
                id: 1,
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@techstore.com',
                phone: '+84 901 234 567',
                role: 'Chủ Cửa Hàng',
                store: 'Tech Store VN',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 14:30',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Trần Thị B',
                email: 'tranthib@fashion.com',
                phone: '+84 902 345 678',
                role: 'Chủ Cửa Hàng',
                store: 'Fashion Hub',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 10:15',
                createdAt: '2024-02-20'
            },
            {
                id: 3,
                name: 'Lê Văn C',
                email: 'levanc@books.com',
                phone: '+84 903 456 789',
                role: 'Quản Lý Cửa Hàng',
                store: 'Book Corner',
                status: 'Chờ Duyệt',
                lastLogin: 'Chưa đăng nhập',
                createdAt: '2024-11-05'
            },
            {
                id: 4,
                name: 'Phạm Thị D',
                email: 'phamthid@homedecor.com',
                phone: '+84 904 567 890',
                role: 'Chủ Cửa Hàng',
                store: 'Home Decor',
                status: 'Hoạt Động',
                lastLogin: '2024-12-10 16:45',
                createdAt: '2024-03-10'
            },
            {
                id: 5,
                name: 'Hoàng Văn E',
                email: 'hoangvane@sports.com',
                phone: '+84 905 678 901',
                role: 'Quản Lý Cửa Hàng',
                store: 'Sports Gear',
                status: 'Tạm Ngưng',
                lastLogin: '2024-11-28 09:20',
                createdAt: '2024-10-01'
            },
            {
                id: 6,
                name: 'Nguyễn Thị F',
                email: 'nguyenthif@beauty.com',
                phone: '+84 906 789 012',
                role: 'Chủ Cửa Hàng',
                store: 'Beauty Shop',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 08:00',
                createdAt: '2024-04-12'
            },
            {
                id: 7,
                name: 'Trần Văn G',
                email: 'tranvang@electronics.com',
                phone: '+84 907 890 123',
                role: 'Chủ Cửa Hàng',
                store: 'Electronics Pro',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 15:20',
                createdAt: '2024-01-20'
            },
            {
                id: 8,
                name: 'Lê Thị H',
                email: 'lethih@pets.com',
                phone: '+84 908 901 234',
                role: 'Nhân Viên Bán Hàng',
                store: 'Pet Paradise',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 12:30',
                createdAt: '2024-06-15'
            },
            {
                id: 9,
                name: 'Quản Trị Viên',
                email: 'admin@snapbuy.com',
                phone: '+84 900 000 000',
                role: 'Quản Trị Cấp Cao',
                store: 'Hệ Thống',
                status: 'Hoạt Động',
                lastLogin: '2024-12-11 16:00',
                createdAt: '2024-01-01'
            }
        ]);
    }, []);

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.store.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || account.role === filterRole;
        const matchesStatus = filterStatus === 'all' || account.status.toLowerCase().includes(filterStatus.toLowerCase());

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
            // TODO: Call API to delete
            setAccounts(accounts.filter((a) => a.id !== id));
        }
    };

    const uniqueRoles = [...new Set(accounts.map((a) => a.role))];

    return (
        <div className="admin-page admin-fade-in">
            {/* Page Header */}
            <div className="admin-flex-between admin-mb-3">
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-text-primary)', margin: 0 }}>
                        Quản Lý Tài Khoản
                    </h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Quản lý tài khoản người dùng trên tất cả cửa hàng
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary">
                    <FaPlus /> Thêm Tài Khoản Mới
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
                            placeholder="Tìm kiếm theo tên, email hoặc cửa hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FaFilter style={{ color: 'var(--admin-text-muted)' }} />
                        <select
                            className="admin-form-input"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <option value="all">Tất Cả Vai Trò</option>
                            {uniqueRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        <select
                            className="admin-form-input"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <option value="all">Tất Cả Trạng Thái</option>
                            <option value="hoạt động">Hoạt Động</option>
                            <option value="chờ duyệt">Chờ Duyệt</option>
                            <option value="tạm ngưng">Tạm Ngưng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid admin-mb-3">
                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Tổng Tài Khoản</span>
                        <div className="admin-stats-icon primary">
                            <FaUsers />
                        </div>
                    </div>
                    <div className="admin-stats-value">{accounts.length}</div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Hoạt Động</span>
                        <div className="admin-stats-icon success">
                            <FaUserCheck />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        {accounts.filter((a) => a.status === 'Hoạt Động').length}
                    </div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Chờ Duyệt</span>
                        <div className="admin-stats-icon warning">
                            <FaClock />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        {accounts.filter((a) => a.status === 'Chờ Duyệt').length}
                    </div>
                </div>

                <div className="admin-stats-card">
                    <div className="admin-stats-header">
                        <span className="admin-stats-title">Tạm Ngưng</span>
                        <div className="admin-stats-icon danger">
                            <FaBan />
                        </div>
                    </div>
                    <div className="admin-stats-value">
                        {accounts.filter((a) => a.status === 'Tạm Ngưng').length}
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">
                        Tất Cả Tài Khoản ({filteredAccounts.length})
                    </h2>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Thông Tin Người Dùng</th>
                                <th>Liên Hệ</th>
                                <th>Vai Trò</th>
                                <th>Cửa Hàng</th>
                                <th>Trạng Thái</th>
                                <th>Đăng Nhập Lần Cuối</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map((account) => (
                                <tr key={account.id}>
                                    <td>#{account.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'var(--admin-gradient-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {account.name.charAt(0)}
                                            </div>
                                            <div>
                                                <strong style={{ display: 'block' }}>{account.name}</strong>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                                    {account.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                                            {account.phone}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`admin-badge ${account.role === 'Quản Trị Cấp Cao'
                                                    ? 'danger'
                                                    : account.role === 'Chủ Cửa Hàng'
                                                        ? 'success'
                                                        : account.role === 'Quản Lý Cửa Hàng'
                                                            ? 'primary'
                                                            : 'info'
                                                }`}
                                        >
                                            {account.role}
                                        </span>
                                    </td>
                                    <td>{account.store}</td>
                                    <td>
                                        <span
                                            className={`admin-badge ${account.status === 'Hoạt Động'
                                                    ? 'success'
                                                    : account.status === 'Chờ Duyệt'
                                                        ? 'warning'
                                                        : 'danger'
                                                }`}
                                        >
                                            {account.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                            {account.lastLogin}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-action-btns">
                                            <button className="admin-btn-icon view" title="Xem Chi Tiết">
                                                <FaEye />
                                            </button>
                                            <button className="admin-btn-icon edit" title="Sửa Tài Khoản">
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="admin-btn-icon delete"
                                                title="Xóa Tài Khoản"
                                                onClick={() => handleDelete(account.id)}
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

                {filteredAccounts.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                        <FaUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Không tìm thấy tài khoản</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountManagement;
