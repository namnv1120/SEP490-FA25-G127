import { useLocation } from 'react-router-dom';
import usePermission from '../../hooks/usePermission';
import { getAllowedRolesForRoute } from '../../utils/routePermissionMap';
import UnauthorizedAccess from './UnauthorizedAccess';
import PageLoader from '../loading/PageLoader.jsx';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { hasAnyRole, loading } = usePermission();

  if (loading) {
    return <PageLoader />;
  }

  const allowedRoles = getAllowedRolesForRoute(location.pathname);

  if (allowedRoles === null) {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return <UnauthorizedAccess />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
