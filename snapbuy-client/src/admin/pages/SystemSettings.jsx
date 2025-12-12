import React, { useState } from 'react';
import { FaSave, FaUndo, FaGlobe, FaShieldAlt, FaBell, FaDatabase } from 'react-icons/fa';
import '../styles/admin.css';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'SnapBuy Admin',
        siteUrl: 'https://admin.snapbuy.vn',
        supportEmail: 'support@snapbuy.com',
        maxStores: 1000,
        sessionTimeout: 30,
        minPasswordLength: 8,
        require2FA: false,
        maintenanceMode: false,
        systemNotifications: true,
        allowNewStores: true,
        autoBackup: true,
        backupFrequency: 'daily'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        // TODO: Call API to save settings
        alert('Cài đặt đã được lưu thành công!');
    };

    const handleReset = () => {
        if (window.confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?')) {
            // TODO: Reset to default
            alert('Đã đặt lại về cài đặt mặc định!');
        }
    };

    return (
        <div className="admin-page admin-fade-in">
            {/* Page Header */}
            <div className="admin-flex-between admin-mb-3">
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-text-primary)', margin: 0 }}>
                        Cài Đặt Hệ Thống
                    </h1>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Cấu hình cài đặt hệ thống toàn cục và tùy chọn
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    <FaSave /> Lưu Thay Đổi
                </button>
            </div>

            {/* General Settings */}
            <div className="admin-card admin-mb-3">
                <div className="admin-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaGlobe style={{ color: 'var(--admin-accent-primary)', fontSize: '1.25rem' }} />
                        <h2 className="admin-card-title">Cài Đặt Chung</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Tên Trang</label>
                        <input
                            type="text"
                            name="siteName"
                            className="admin-form-input"
                            value={settings.siteName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Địa Chỉ Trang</label>
                        <input
                            type="url"
                            name="siteUrl"
                            className="admin-form-input"
                            value={settings.siteUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Email Hỗ Trợ</label>
                        <input
                            type="email"
                            name="supportEmail"
                            className="admin-form-input"
                            value={settings.supportEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Số Cửa Hàng Tối Đa</label>
                        <input
                            type="number"
                            name="maxStores"
                            className="admin-form-input"
                            value={settings.maxStores}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="admin-card admin-mb-3">
                <div className="admin-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaShieldAlt style={{ color: 'var(--admin-accent-danger)', fontSize: '1.25rem' }} />
                        <h2 className="admin-card-title">Cài Đặt Bảo Mật</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Thời Gian Hết Phiên (phút)</label>
                        <input
                            type="number"
                            name="sessionTimeout"
                            className="admin-form-input"
                            value={settings.sessionTimeout}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Độ Dài Mật Khẩu Tối Thiểu</label>
                        <input
                            type="number"
                            name="minPasswordLength"
                            className="admin-form-input"
                            value={settings.minPasswordLength}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="require2FA"
                                checked={settings.require2FA}
                                onChange={handleChange}
                            />
                            <span className="admin-form-label" style={{ margin: 0 }}>
                                Yêu Cầu Xác Thực Hai Yếu Tố
                            </span>
                        </label>
                    </div>

                    <div className="admin-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                            />
                            <span className="admin-form-label" style={{ margin: 0 }}>
                                Bật Chế Độ Bảo Trì
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="admin-card admin-mb-3">
                <div className="admin-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaBell style={{ color: 'var(--admin-accent-warning)', fontSize: '1.25rem' }} />
                        <h2 className="admin-card-title">Cài Đặt Thông Báo</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="admin-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="systemNotifications"
                                checked={settings.systemNotifications}
                                onChange={handleChange}
                            />
                            <span className="admin-form-label" style={{ margin: 0 }}>
                                Bật Thông Báo Hệ Thống
                            </span>
                        </label>
                    </div>

                    <div className="admin-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="allowNewStores"
                                checked={settings.allowNewStores}
                                onChange={handleChange}
                            />
                            <span className="admin-form-label" style={{ margin: 0 }}>
                                Cho Phép Đăng Ký Cửa Hàng Mới
                            </span>
                        </label>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                        Thông báo email sẽ được gửi đến: <strong style={{ color: 'var(--admin-text-primary)' }}>{settings.supportEmail}</strong>
                    </div>
                </div>
            </div>

            {/* Database & Backup */}
            <div className="admin-card admin-mb-3">
                <div className="admin-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaDatabase style={{ color: 'var(--admin-accent-success)', fontSize: '1.25rem' }} />
                        <h2 className="admin-card-title">Cơ Sở Dữ Liệu & Sao Lưu</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="admin-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="autoBackup"
                                checked={settings.autoBackup}
                                onChange={handleChange}
                            />
                            <span className="admin-form-label" style={{ margin: 0 }}>
                                Bật Tự Động Sao Lưu
                            </span>
                        </label>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Tần Suất Sao Lưu</label>
                        <select
                            name="backupFrequency"
                            className="admin-form-input"
                            value={settings.backupFrequency}
                            onChange={handleChange}
                            disabled={!settings.autoBackup}
                        >
                            <option value="hourly">Mỗi Giờ</option>
                            <option value="daily">Hàng Ngày</option>
                            <option value="weekly">Hàng Tuần</option>
                            <option value="monthly">Hàng Tháng</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ flex: 1 }}>
                            <FaDatabase /> Sao Lưu Ngay
                        </button>
                        <button className="admin-btn admin-btn-secondary" style={{ flex: 1 }}>
                            <FaUndo /> Khôi Phục
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="admin-btn admin-btn-secondary" onClick={handleReset}>
                    <FaUndo /> Đặt Lại Mặc Định
                </button>
                <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    <FaSave /> Lưu Tất Cả Thay Đổi
                </button>
            </div>
        </div>
    );
};

export default SystemSettings;
