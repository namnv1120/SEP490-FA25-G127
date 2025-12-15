import { useState, useEffect } from "react";
import { getMyInfo } from "../services/AccountService";

const usePermission = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);

        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem("authToken");
        if (!token) {
          setUserRole(null);
          setUserInfo(null);
          setLoading(false);
          return;
        }

        // Lấy thông tin user
        const userData = await getMyInfo();
        const user = userData.result || userData;
        setUserInfo(user);

        // Lấy role đầu tiên của user
        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
          const roleName = user.roles[0].replace("ROLE_", "");
          setUserRole(roleName);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        // Nếu API lỗi (token hết hạn/không hợp lệ), xóa token
        localStorage.removeItem("authToken");
        setUserRole(null);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Kiểm tra user có role không
  const hasRole = (roleName) => {
    return userRole === roleName;
  };

  // Kiểm tra user có một trong các roles không
  const hasAnyRole = (roleNames) => {
    if (!roleNames || !Array.isArray(roleNames)) return false;
    return roleNames.includes(userRole);
  };

  return {
    userRole,
    userInfo,
    loading,
    hasRole,
    hasAnyRole,
  };
};

export default usePermission;
