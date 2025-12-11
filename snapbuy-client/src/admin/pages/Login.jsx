import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import AdminLoading from '../components/AdminLoading';
import '../styles/admin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Integrate with backend API
        // Simulate API call
        setTimeout(() => {
            console.log('Admin Login:', formData);
            // Store admin token (mock)
            localStorage.setItem('adminToken', 'mock-admin-token');
            localStorage.setItem('adminUser', JSON.stringify({
                name: 'Quản Trị Viên',
                email: formData.email,
                role: 'Quản Trị Cấp Cao'
            }));

            // Navigate after a short delay to show loading
            navigate('/admin/dashboard');
        }, 1500);
    };

    return (
        <>
            {loading && <AdminLoading message="Đang đăng nhập..." />}

            <div className="admin-login-container">
                <div className="admin-login-box admin-fade-in">
                    <div className="admin-login-header">
                        <div className="admin-login-logo" style={{ background: 'transparent', boxShadow: 'none', width: '280px', height: 'auto', margin: '0 auto' }}>
                            <img
                                src="/src/assets/img/logo.png"
                                alt="SnapBuy"
                                style={{
                                    width: '100%',
                                    height: 'auto'
                                }}
                            />
                        </div>
                        <h1 className="admin-login-title">Cổng Quản Trị</h1>
                        <p className="admin-login-subtitle">
                            Hệ Thống Quản Lý Đa Cửa Hàng
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                <FaEnvelope style={{ marginRight: '0.5rem' }} />
                                Địa Chỉ Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="admin-form-input"
                                placeholder="admin@snapbuy.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                <FaLock style={{ marginRight: '0.5rem' }} />
                                Mật Khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="admin-form-input"
                                placeholder="Nhập mật khẩu của bạn"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                name="remember"
                                id="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="remember" className="admin-form-label" style={{ margin: 0, cursor: 'pointer' }}>
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    Đăng Nhập Quản Trị
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a
                            href="#"
                            style={{
                                color: 'var(--admin-accent-primary)',
                                fontSize: '0.875rem',
                                textDecoration: 'none'
                            }}
                        >
                            Quên mật khẩu?
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
