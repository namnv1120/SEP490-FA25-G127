import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ThemeCustomizer from './ThemeCustomizer';

const AdminLayout = ({ title }) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <AdminHeader title={title} />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
            <ThemeCustomizer />
        </div>
    );
};

export default AdminLayout;
