import { memo, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import FeatureModule from "./feature-module/feature-module";
import { authRoutes, posPage, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Khai báo component ở đây để path.jsx chỉ là cấu hình dữ liệu
const Pos = lazy(() => import("./feature-module/pos/Pos"));
const Login = lazy(() => import("./feature-module/pages/authentication/Login"));
const ForgotPassword = lazy(() =>
  import("./feature-module/pages/authentication/ForgotPassword")
);
const VerifyOtp = lazy(() =>
  import("./feature-module/pages/authentication/VerifyOtp")
);
const ResetPassword = lazy(() =>
  import("./feature-module/pages/authentication/ResetPassword")
);
const Suppliers = lazy(() => import("./feature-module/people/SupplierList"));
const Dashboard = lazy(() => import("./feature-module/dashboard/Dashboard"));
const ProductList = lazy(() =>
  import("./feature-module/inventories/ProductList")
);
const AddProduct = lazy(() =>
  import("./feature-module/inventories/AddProduct")
);
const EditProduct = lazy(() =>
  import("./feature-module/inventories/EditProduct")
);
const ProductPriceList = lazy(() =>
  import("./feature-module/inventories/ProductPriceList")
);
const EditProductPrice = lazy(() =>
  import("./feature-module/inventories/EditProductPrice")
);
const PosShift = lazy(() => import("./feature-module/pos/PosShift"));
const SalesDashboard = lazy(() =>
  import("./feature-module/dashboard/SalesDashboard")
);
const InventoryList = lazy(() =>
  import("./feature-module/inventories/InventoryList")
);
const CategoryList = lazy(() =>
  import("./feature-module/inventories/CategoryList")
);
const SubCategoryList = lazy(() =>
  import("./feature-module/inventories/SubCategoryList")
);
const AccountList = lazy(() => import("./feature-module/accounts/AccountList"));
const RoleList = lazy(() => import("./feature-module/accounts/RoleList"));
const Profile = lazy(() => import("./feature-module/settings/Profile"));
const EmailSettings = lazy(() =>
  import("./feature-module/settings/EmailSettings")
);
const PasswordSettings = lazy(() =>
  import("./feature-module/settings/PasswordSettings")
);
const Customers = lazy(() => import("./feature-module/people/CustomerList"));
const PurchaseOrder = lazy(() =>
  import("./feature-module/sales/PurchaseOrder")
);
const AddPurchaseOrder = lazy(() =>
  import("./feature-module/sales/AddPurchaseOrder")
);
const EditPurchaseOrder = lazy(() =>
  import("./feature-module/sales/EditPurchaseOrder")
);
const RevenueReport = lazy(() =>
  import("./feature-module/reports/RevenueReport")
);
const ProductReport = lazy(() =>
  import("./feature-module/reports/ProductReport")
);
const CustomerReport = lazy(() =>
  import("./feature-module/reports/CustomerReport")
);
const SupplierReport = lazy(() =>
  import("./feature-module/reports/SupplierReport")
);
const TransactionHistory = lazy(() =>
  import("./feature-module/sales/TransactionHistory")
);
const OrderHistory = lazy(() => import("./feature-module/sales/OrderHistory"));
const PosSystemSettings = lazy(() =>
  import("./feature-module/pos/PosSystemSettings")
);
const FormHorizontal = lazy(() =>
  import(
    "./feature-module/uiinterface/forms/formelements/layouts/form-horizontal"
  )
);
const OwnerStaffAccountList = lazy(() =>
  import("./feature-module/owner/StaffAccountList")
);
const StaffShiftManagement = lazy(() =>
  import("./feature-module/owner/StaffShiftManagement")
);
const StaffShiftReport = lazy(() =>
  import("./feature-module/owner/StaffShiftReport")
);
const PromotionList = lazy(() =>
  import("./feature-module/promotions/PromotionList.jsx")
);

const componentsMap = {
  Pos,
  PosShift,
  Login,
  ForgotPassword,
  VerifyOtp,
  ResetPassword,
  Suppliers,
  Dashboard,
  ProductList,
  AddProduct,
  EditProduct,
  ProductPriceList,
  EditProductPrice,
  InventoryList,
  CategoryList,
  SubCategoryList,
  AccountList,
  RoleList,
  Profile,
  EmailSettings,
  PasswordSettings,
  Customers,
  PurchaseOrder,
  AddPurchaseOrder,
  EditPurchaseOrder,
  RevenueReport,
  ProductReport,
  CustomerReport,
  SupplierReport,
  TransactionHistory,
  OrderHistory,
  PosSystemSettings,
  FormHorizontal,
  SalesDashboard,
  OwnerStaffAccountList,
  StaffShiftManagement,
  StaffShiftReport,
  PromotionList,
};

const AppRouter = () => {
  const RouterContent = memo(() => {
    const renderRoutes = (routeList) =>
      routeList?.map((item) => {
        const Comp = componentsMap[item?.componentKey];
        const el = item?.protected ? (
          <ProtectedRoute>
            <Comp />
          </ProtectedRoute>
        ) : (
          <Comp />
        );
        return (
          <Route key={`route-${item?.id}`} path={item?.path} element={el} />
        );
      });

    return (
      <>
        <Routes>
          <Route path="/" element={<FeatureModule />}>
            <Route index element={<Navigate to="/login" replace />} />
            {renderRoutes(unAuthRoutes)}
            {renderRoutes(authRoutes)}
            {renderRoutes(posPage)}
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  });

  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;
