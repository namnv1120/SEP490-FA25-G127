import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ThemeCustomizer from "./ThemeCustomizer";

const AdminLayout = ({ title }) => {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
