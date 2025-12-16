import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminRouter from "./admin/AdminRouter";
import { base_path } from "./environment";
import { saveTenantContext } from "./utils/tenantUtils";

/**
 * Router cho Admin Portal
 * Chỉ chứa admin routes
 */
const AdminAppRouter = () => {
  useEffect(() => {
    saveTenantContext();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = () => {
    const authToken = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin");
    return authToken && isAdmin === "true";
  };

  return (
    <BrowserRouter basename={base_path}>
      <Routes>
        {/* Redirect root to login or dashboard based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin routes */}
        <Route path="/*" element={<AdminRouter />} />

        {/* Catch all - redirect to login if not authenticated, dashboard if authenticated */}
        <Route
          path="*"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AdminAppRouter;
