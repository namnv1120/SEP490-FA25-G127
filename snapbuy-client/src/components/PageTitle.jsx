import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { matchPath } from "react-router";
import { authRoutes, posPage, unAuthRoutes } from "../routes/path";

// Map tên route sang tên tiếng Việt hiển thị
const routeNameMap = {
  dashboard: "Trang chủ",
  login: "Đăng nhập",
  customers: "Khách hàng",
  suppliers: "Nhà cung cấp",
  products: "Sản phẩm",
  "add-product": "Thêm sản phẩm",
  "edit-product": "Chỉnh sửa sản phẩm",
  categories: "Danh mục",
  "sub-categories": "Danh mục con",
  inventories: "Tồn kho",
  "product-prices": "Giá sản phẩm",
  "edit-product-price": "Chỉnh sửa giá",
  purchaseorders: "Đơn đặt hàng",
  "add-purchaseorder": "Tạo đơn đặt hàng",
  "edit-purchaseorder": "Chỉnh sửa đơn đặt hàng",
  profile: "Hồ sơ",
  accounts: "Tài khoản",
  rolespermission: "Phân quyền",
  permissions: "Quyền",
  possettings: "Cài đặt POS",
  "pos-orders": "Đơn hàng POS",
  pos: "POS",
  forgotpassword: "Quên mật khẩu",
  verifyotp: "Nhập OTP",
  resetpassword: "Đặt lại mật khẩu",
  "transaction-history": "Lịch sử giao dịch",
  "order-history": "Lịch sử đơn hàng",
  "revenue-report": "Báo cáo doanh thu",
  "product-report": "Báo cáo sản phẩm",
  "customer-report": "Báo cáo khách hàng",
  "supplier-report": "Báo cáo nhà cung cấp",
};

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Tìm route match với path hiện tại
    const allRoutes = [...authRoutes, ...posPage, ...unAuthRoutes];
    const currentRoute = allRoutes.find((route) => {
      if (!route.path) return false;
      return matchPath({ path: route.path, end: true }, location.pathname);
    });

    let pageName = "Trang chủ"; // Default

    if (currentRoute) {
      // Lấy tên từ route name
      const routeName = currentRoute.name || "";
      pageName = routeNameMap[routeName] || formatRouteName(routeName);
    } else {
      // Nếu không tìm thấy route, format từ path
      const pathName = location.pathname.split("/").pop() || "dashboard";
      pageName = formatRouteName(pathName);
    }

    document.title = `SnapBuy - ${pageName}`;
  }, [location.pathname]);

  return null; // Component này không render gì
};

// Format route name sang tiếng Việt đẹp hơn
const formatRouteName = (name) => {
  if (!name) return "Trang chủ";

  // Thay thế dấu gạch ngang và format
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default PageTitle;

