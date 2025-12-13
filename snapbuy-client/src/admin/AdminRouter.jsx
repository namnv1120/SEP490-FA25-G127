import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import StoreManagement from './pages/StoreManagement';
import RoleManagement from './pages/RoleManagement';
import AccountManagement from './pages/AccountManagement';
import SystemSettings from './pages/SystemSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

const AdminRouter = () => {
    return (
        <Routes>
            {/* Public Route */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="stores" element={<StoreManagement />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="accounts" element={<AccountManagement />} />
                <Route path="settings" element={<SystemSettings />} />

                {/* Placeholder routes for sidebar items */}
                <Route
                    path="analytics"
                    element={
                        <div className="admin-page admin-fade-in">
                            <h1>Analytics</h1>
                            <p>Analytics page will be implemented here</p>
                        </div>
                    }
                />
                <Route
                    path="database"
                    element={
                        <div className="admin-page admin-fade-in">
                            <h1>Database Management</h1>
                            <p>Database management page will be implemented here</p>
                        </div>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <div className="admin-page admin-fade-in">
                            <h1>Notifications</h1>
                            <p>Notifications page will be implemented here</p>
                        </div>
                    }
                />
                <Route
                    path="logs"
                    element={
                        <div className="admin-page admin-fade-in">
                            <h1>System Logs</h1>
                            <p>System logs page will be implemented here</p>
                        </div>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <div className="admin-page admin-fade-in">
                            <h1>Admin Profile</h1>
                            <p>Profile page will be implemented here</p>
                        </div>
                    }
                />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    );
};

export default AdminRouter;
