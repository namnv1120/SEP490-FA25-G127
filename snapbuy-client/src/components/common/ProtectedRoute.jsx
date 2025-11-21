import React from 'react';
import { useLocation } from 'react-router-dom';
import usePermission from '../../hooks/usePermission';
import { getAllowedRolesForRoute } from '../../utils/routePermissionMap';
import UnauthorizedAccess from './UnauthorizedAccess';
import PageLoader from '../loading/PageLoader.jsx';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { hasAnyRole, loading } = usePermission();

  // Nếu đang loading, hiển thị loading hoặc children tạm thời
  if (loading) {
    return <PageLoader />;
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
