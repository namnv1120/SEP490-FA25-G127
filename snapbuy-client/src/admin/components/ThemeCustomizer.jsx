import React, { useState, useEffect } from 'react';
import { FaPalette, FaTimes, FaUndo } from 'react-icons/fa';

const ThemeCustomizer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState({
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        dangerColor: '#ef4444',
        infoColor: '#3b82f6',
        bgPrimary: '#0f1419',
        bgSecondary: '#1a1f2e',
        bgCard: '#1e2433',
        textPrimary: '#e5e7eb',
        textSecondary: '#9ca3af',
        textMuted: '#6b7280'
    });

    // Load saved theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('adminTheme');
        if (savedTheme) {
            const parsedTheme = JSON.parse(savedTheme);
            setTheme(parsedTheme);
            applyTheme(parsedTheme);
        }
    }, []);

    const applyTheme = (themeColors) => {
        const root = document.documentElement;

        // Apply main colors
        root.style.setProperty('--admin-accent-primary', themeColors.primaryColor);
        root.style.setProperty('--admin-accent-secondary', themeColors.secondaryColor);
        root.style.setProperty('--admin-accent-success', themeColors.successColor);
        root.style.setProperty('--admin-accent-warning', themeColors.warningColor);
        root.style.setProperty('--admin-accent-danger', themeColors.dangerColor);
        root.style.setProperty('--admin-accent-info', themeColors.infoColor);
        root.style.setProperty('--admin-bg-primary', themeColors.bgPrimary);
        root.style.setProperty('--admin-bg-secondary', themeColors.bgSecondary);
        root.style.setProperty('--admin-bg-card', themeColors.bgCard);
        root.style.setProperty('--admin-text-primary', themeColors.textPrimary);
        root.style.setProperty('--admin-text-secondary', themeColors.textSecondary);
        root.style.setProperty('--admin-text-muted', themeColors.textMuted);

        // Calculate tertiary background and borders based on theme
        const isDark = themeColors.bgPrimary.toLowerCase() === '#0f1419' ||
            themeColors.bgPrimary.toLowerCase() === '#1a1f2e';
        const isLight = themeColors.bgPrimary.toLowerCase() === '#f9fafb' ||
            themeColors.bgPrimary.toLowerCase() === '#ffffff';

        if (isDark) {
            // Dark theme
            root.style.setProperty('--admin-bg-tertiary', '#252b3b');
            root.style.setProperty('--admin-bg-hover', '#2a3142');
            root.style.setProperty('--admin-border-color', '#2d3548');
            root.style.setProperty('--admin-border-light', '#3f4861');
        } else if (isLight) {
            // Light theme
            root.style.setProperty('--admin-bg-tertiary', '#f3f4f6');
            root.style.setProperty('--admin-bg-hover', '#e5e7eb');
            root.style.setProperty('--admin-border-color', '#d1d5db');
            root.style.setProperty('--admin-border-light', '#9ca3af');
        } else {
            // Gray theme
            root.style.setProperty('--admin-bg-tertiary', '#d1d5db');
            root.style.setProperty('--admin-bg-hover', '#f9fafb');
            root.style.setProperty('--admin-border-color', '#9ca3af');
            root.style.setProperty('--admin-border-light', '#6b7280');
        }
    };

    const handleColorChange = (key, value) => {
        const newTheme = { ...theme, [key]: value };
        setTheme(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('adminTheme', JSON.stringify(newTheme));
    };

    const resetToDefault = () => {
        const defaultTheme = {
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            successColor: '#10b981',
            warningColor: '#f59e0b',
            dangerColor: '#ef4444',
            infoColor: '#3b82f6',
            bgPrimary: '#0f1419',
            bgSecondary: '#1a1f2e',
            bgCard: '#1e2433',
            textPrimary: '#e5e7eb',
            textSecondary: '#9ca3af',
            textMuted: '#6b7280'
        };
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
        localStorage.setItem('adminTheme', JSON.stringify(defaultTheme));
    };

    const presetThemes = [
        {
            name: 'Tối',
            description: 'Giao diện tối mặc định',
            colors: {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                successColor: '#10b981',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444',
                infoColor: '#3b82f6',
                bgPrimary: '#0f1419',
                bgSecondary: '#1a1f2e',
                bgCard: '#1e2433',
                textPrimary: '#e5e7eb',
                textSecondary: '#9ca3af',
                textMuted: '#6b7280'
            }
        },
        {
            name: 'Sáng',
            description: 'Giao diện sáng dễ nhìn',
            colors: {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                successColor: '#10b981',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444',
                infoColor: '#3b82f6',
                bgPrimary: '#f9fafb',
                bgSecondary: '#ffffff',
                bgCard: '#ffffff',
                textPrimary: '#111827',
                textSecondary: '#4b5563',
                textMuted: '#6b7280'
            }
        },
        {
            name: 'Xám',
            description: 'Giao diện xám trung tính',
            colors: {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                successColor: '#10b981',
                warningColor: '#f59e0b',
                dangerColor: '#ef4444',
                infoColor: '#3b82f6',
                bgPrimary: '#e5e7eb',
                bgSecondary: '#f3f4f6',
                bgCard: '#ffffff',
                textPrimary: '#111827',
                textSecondary: '#374151',
                textMuted: '#6b7280'
            }
        }
    ];

    const applyPreset = (preset) => {
        setTheme(preset.colors);
        applyTheme(preset.colors);
        localStorage.setItem('adminTheme', JSON.stringify(preset.colors));
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    right: '2rem',
                    bottom: '2rem',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--admin-gradient-primary)',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--admin-shadow-xl)',
                    zIndex: 9998,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--admin-transition-base)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) rotate(45deg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}
                title="Tùy Chỉnh Giao Diện"
            >
                <FaPalette />
            </button>

            {/* Customizer Panel */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '400px',
                        background: 'var(--admin-bg-card)',
                        borderLeft: '1px solid var(--admin-border-color)',
                        boxShadow: 'var(--admin-shadow-xl)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideIn 0.3s ease',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: 'var(--admin-spacing-md)',
                            borderBottom: '1px solid var(--admin-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--admin-bg-secondary)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FaPalette style={{ color: 'var(--admin-accent-primary)', fontSize: '1.5rem' }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-text-primary)' }}>
                                    Tùy Chỉnh Giao Diện
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                    Tùy chỉnh màu sắc quản trị của bạn
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--admin-text-secondary)',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                transition: 'var(--admin-transition-fast)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--admin-text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--admin-text-secondary)';
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--admin-spacing-md)' }}>
                        {/* Preset Themes */}
                        <div style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-secondary)', marginBottom: 'var(--admin-spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Giao Diện Có Sẵn
                            </h4>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {presetThemes.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => applyPreset(preset)}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--admin-bg-tertiary)',
                                            border: '1px solid var(--admin-border-color)',
                                            borderRadius: 'var(--admin-radius-md)',
                                            color: 'var(--admin-text-primary)',
                                            cursor: 'pointer',
                                            transition: 'var(--admin-transition-fast)',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--admin-bg-hover)';
                                            e.currentTarget.style.borderColor = 'var(--admin-border-light)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--admin-bg-tertiary)';
                                            e.currentTarget.style.borderColor = 'var(--admin-border-color)';
                                        }}
                                    >
                                        <div style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>{preset.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.5rem' }}>{preset.description}</div>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.bgPrimary, border: '1px solid var(--admin-border-color)' }}></div>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.bgSecondary, border: '1px solid var(--admin-border-color)' }}></div>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.primaryColor }}></div>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.successColor }}></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accent Colors */}
                        <div style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-secondary)', marginBottom: 'var(--admin-spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Màu Nhấn
                            </h4>

                            <ColorPicker label="Chính" value={theme.primaryColor} onChange={(v) => handleColorChange('primaryColor', v)} />
                            <ColorPicker label="Phụ" value={theme.secondaryColor} onChange={(v) => handleColorChange('secondaryColor', v)} />
                            <ColorPicker label="Thành Công" value={theme.successColor} onChange={(v) => handleColorChange('successColor', v)} />
                            <ColorPicker label="Cảnh Báo" value={theme.warningColor} onChange={(v) => handleColorChange('warningColor', v)} />
                            <ColorPicker label="Nguy Hiểm" value={theme.dangerColor} onChange={(v) => handleColorChange('dangerColor', v)} />
                            <ColorPicker label="Thông Tin" value={theme.infoColor} onChange={(v) => handleColorChange('infoColor', v)} />
                        </div>

                        {/* Background Colors */}
                        <div style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-secondary)', marginBottom: 'var(--admin-spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Màu Nền
                            </h4>

                            <ColorPicker label="Nền Chính" value={theme.bgPrimary} onChange={(v) => handleColorChange('bgPrimary', v)} />
                            <ColorPicker label="Nền Phụ" value={theme.bgSecondary} onChange={(v) => handleColorChange('bgSecondary', v)} />
                            <ColorPicker label="Nền Thẻ" value={theme.bgCard} onChange={(v) => handleColorChange('bgCard', v)} />
                        </div>

                        {/* Text Colors */}
                        <div style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--admin-text-secondary)', marginBottom: 'var(--admin-spacing-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Màu Chữ
                            </h4>

                            <ColorPicker label="Chữ Chính" value={theme.textPrimary} onChange={(v) => handleColorChange('textPrimary', v)} />
                            <ColorPicker label="Chữ Phụ" value={theme.textSecondary} onChange={(v) => handleColorChange('textSecondary', v)} />
                            <ColorPicker label="Chữ Mờ" value={theme.textMuted} onChange={(v) => handleColorChange('textMuted', v)} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            padding: 'var(--admin-spacing-md)',
                            borderTop: '1px solid var(--admin-border-color)',
                            background: 'var(--admin-bg-secondary)',
                        }}
                    >
                        <button
                            onClick={resetToDefault}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--admin-bg-tertiary)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: 'var(--admin-radius-md)',
                                color: 'var(--admin-text-primary)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'var(--admin-transition-fast)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--admin-accent-danger)';
                                e.currentTarget.style.borderColor = 'var(--admin-accent-danger)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--admin-bg-tertiary)';
                                e.currentTarget.style.borderColor = 'var(--admin-border-color)';
                            }}
                        >
                            <FaUndo /> Khôi Phục Mặc Định
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const ColorPicker = ({ label, value, onChange }) => {
    return (
        <div style={{ marginBottom: 'var(--admin-spacing-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>{value}</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '48px',
                        height: '36px',
                        border: '1px solid var(--admin-border-color)',
                        borderRadius: 'var(--admin-radius-sm)',
                        cursor: 'pointer',
                        background: 'transparent',
                    }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'var(--admin-bg-tertiary)',
                        border: '1px solid var(--admin-border-color)',
                        borderRadius: 'var(--admin-radius-sm)',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                    }}
                />
            </div>
        </div>
    );
};

export default ThemeCustomizer;
