import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import StoreManagement from "./pages/StoreManagement";
import RoleManagement from "./pages/RoleManagement";
import AccountManagement from "./pages/AccountManagement";
import SystemSettings from "./pages/SystemSettings";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  const isAdmin = localStorage.getItem("isAdmin");

  if (!authToken || isAdmin !== "true") {
    return <Navigate to="/login" replace />;
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="stores" element={<StoreManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="accounts" element={<AccountManagement />} />
        <Route path="settings" element={<SystemSettings />} />
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRouter;
