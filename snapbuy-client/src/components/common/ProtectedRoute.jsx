import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePermission from "../../hooks/usePermission";
import { getAllowedRolesForRoute } from "../../utils/routePermissionMap";
import PageLoader from "../loading/PageLoader.jsx";
import UnauthorizedModal from "./UnauthorizedModal";

const PREVIOUS_LOCATION_KEY = "previous_authorized_location";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAnyRole, loading, userRole } = usePermission();
  const [showModal, setShowModal] = useState(false);
  const previousLocationRef = useRef(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (location.pathname !== "/404") {
      hasCheckedRef.current = false;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (loading) return;

    // Kiểm tra token - nếu không có token thì redirect về login
    const token = localStorage.getItem("authToken");
    if (!token || !userRole) {
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
      return;
    }

    const allowedRoles = getAllowedRolesForRoute(location.pathname);

    if (allowedRoles === null) {
      if (location.pathname !== "/login" && location.pathname !== "/404") {
        previousLocationRef.current = location.pathname;
        sessionStorage.setItem(PREVIOUS_LOCATION_KEY, location.pathname);
      }
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasAnyRole(allowedRoles)) {
        if (!hasCheckedRef.current) {
          hasCheckedRef.current = true;

          const wasBlockedByGuard =
            sessionStorage.getItem("navigation_blocked_by_guard") === "true";

          if (wasBlockedByGuard) {
            sessionStorage.removeItem("navigation_blocked_by_guard");
            const previousPath =
              previousLocationRef.current ||
              sessionStorage.getItem(PREVIOUS_LOCATION_KEY) ||
              "/shopowner-dashboard";
            if (location.pathname !== previousPath) {
              navigate(previousPath, { replace: true });
            }
            setShowModal(true);
          } else {
            navigate("/404", { replace: true });
          }
        }
        return;
      } else {
        if (location.pathname !== "/login" && location.pathname !== "/404") {
          previousLocationRef.current = location.pathname;
          sessionStorage.setItem(PREVIOUS_LOCATION_KEY, location.pathname);
        }
      }
    }
  }, [location.pathname, loading, hasAnyRole, navigate, userRole]);

  if (loading) {
    return <PageLoader />;
  }

  // Kiểm tra authentication trước khi render
  const token = localStorage.getItem("authToken");
  if (!token || !userRole) {
    return null; // Đang redirect về login
  }

  const allowedRoles = getAllowedRolesForRoute(location.pathname);

  if (allowedRoles === null) {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      const wasBlockedByGuard =
        sessionStorage.getItem("navigation_blocked_by_guard") === "true";

      if (wasBlockedByGuard || showModal) {
        return (
          <>
            {children}
            <UnauthorizedModal
              open={showModal}
              onClose={() => {
                setShowModal(false);
                hasCheckedRef.current = false;
                // Navigate về trang trước đó khi đóng modal
                const previousPath =
                  previousLocationRef.current ||
                  sessionStorage.getItem(PREVIOUS_LOCATION_KEY) ||
                  "/shopowner-dashboard";
                if (location.pathname !== previousPath) {
                  navigate(previousPath, { replace: true });
                }
              }}
            />
          </>
        );
      }

      // Đang redirect về 404, không render gì
      return null;
    }
  }

  return (
    <>
      {children}
      <UnauthorizedModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          hasCheckedRef.current = false;
          // Navigate về trang trước đó khi đóng modal
          const previousPath =
            previousLocationRef.current ||
            sessionStorage.getItem(PREVIOUS_LOCATION_KEY) ||
            "/shopowner-dashboard";
          if (location.pathname !== previousPath) {
            navigate(previousPath, { replace: true });
          }
        }}
      />
    </>
  );
};

export default ProtectedRoute;
