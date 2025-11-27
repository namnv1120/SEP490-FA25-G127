import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import usePermission from "../../hooks/usePermission";
import { getAllowedRolesForRoute } from "../../utils/routePermissionMap";
import UnauthorizedModal from "./UnauthorizedModal";


const NavigationGuard = ({ children }) => {
  const location = useLocation();
  const { hasAnyRole, loading } = usePermission();
  const [showModal, setShowModal] = useState(false);

  // Intercept click events trên các Link từ React Router
  useEffect(() => {
    if (loading) return;

    const handleClick = (e) => {
      // Tìm Link component từ React Router
      const link = e.target.closest("a[href]");
      if (!link) return;

      // Kiểm tra nếu link có data từ React Router (thường có attribute đặc biệt)
      const href = link.getAttribute("href");
      if (!href) return;

      // Bỏ qua các link đặc biệt
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Kiểm tra nếu là external link
      if (href.startsWith("http://") || href.startsWith("https://")) {
        return;
      }

      // Lấy path từ href (loại bỏ base path nếu có)
      let targetPath = href;
      if (targetPath.startsWith("/")) {
        // Đã là absolute path
      } else {
        // Relative path - cần resolve
        const currentPath = location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf("/"));
        targetPath = basePath + "/" + targetPath;
      }

      // Normalize path (loại bỏ query string và hash)
      targetPath = targetPath.split("?")[0].split("#")[0];

      // Kiểm tra quyền cho target path
      const allowedRoles = getAllowedRolesForRoute(targetPath);
      if (allowedRoles && allowedRoles.length > 0) {
        if (!hasAnyRole(allowedRoles)) {
          // Chặn navigation
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // Đánh dấu là đã chặn từ click link
          sessionStorage.setItem("navigation_blocked_by_guard", "true");

          setShowModal(true);
          return false;
        }
      }
    };

    // Sử dụng capture phase để chặn trước khi React Router xử lý
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [location.pathname, loading, hasAnyRole]);

  const handleCloseModal = () => {
    setShowModal(false);
    // Xóa flag để tránh conflict khi truy cập trực tiếp URL sau đó
    sessionStorage.removeItem("navigation_blocked_by_guard");
  };

  return (
    <>
      {children}
      <UnauthorizedModal open={showModal} onClose={handleCloseModal} />
    </>
  );
};

export default NavigationGuard;
