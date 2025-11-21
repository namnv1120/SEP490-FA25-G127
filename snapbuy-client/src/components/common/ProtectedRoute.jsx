import React from 'react';
import { useLocation } from 'react-router-dom';
import usePermission from '../../hooks/usePermission';
import { getAllowedRolesForRoute } from '../../utils/routePermissionMap';
import UnauthorizedAccess from './UnauthorizedAccess';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { hasAnyRole, loading, userRole } = usePermission();

  // Nếu đang loading, hiển thị loading hoặc children tạm thời
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Lấy roles được phép cho route hiện tại
  const allowedRoles = getAllowedRolesForRoute(location.pathname);

  // Nếu không có yêu cầu role (null), cho phép truy cập
  if (allowedRoles === null) {
    return <>{children}</>;
  }

  // Nếu có yêu cầu roles, kiểm tra user có một trong các roles đó không
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return <UnauthorizedAccess />;
    }
  }

  // Có quyền, render children
  return <>{children}</>;
};

export default ProtectedRoute;

