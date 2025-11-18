import { Route } from "react-router-dom";
import { lazy } from "react";
import { allRoutes } from "./AllRoutes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";
import ProtectedRoute from "../components/common/ProtectedRoute";

const Pos = lazy(() => import("../feature-module/pos/Pos"));
const Login = lazy(() => import("../feature-module/pages/authentication/Login"));
const Forgotpassword = lazy(() => import("../feature-module/pages/authentication/ForgotPassword"));
const VerifyOtp = lazy(() => import("../feature-module/pages/authentication/VerifyOtp"));
const Resetpassword = lazy(() => import("../feature-module/pages/authentication/ResetPassword"));
const Suppliers = lazy(() => import("../feature-module/people/SupplierList"));
const Dashboard = lazy(() => import("../feature-module/dashboard/Dashboard"));
const ProductList = lazy(() =>
  import("../feature-module/inventories/ProductList")
);
const AddProduct = lazy(() => import("../feature-module/inventories/AddProduct"));
const EditProduct = lazy(() => import("../feature-module/inventories/EditProduct"));
const ProductPriceList = lazy(() => import("../feature-module/inventories/ProductPriceList"));
const EditProductPrice = lazy(() => import("../feature-module/inventories/EditProductPrice"));
const InventoryList = lazy(() => import("../feature-module/inventories/InventoryList"));
const CategoryList = lazy(() => import("../feature-module/inventories/CategoryList"));
const SubCategories = lazy(() => import("../feature-module/inventories/SubCategoryList"));

const AccountList = lazy(() => import("../feature-module/accounts/AccountList"));
const RoleList = lazy(() =>
  import("../feature-module/accounts/RoleList")
);
const Profile = lazy(() => import("../feature-module/settings/Profile"));
const EmailSettings = lazy(() => import("../feature-module/settings/EmailSettings"));
const PasswordSettings = lazy(() => import("../feature-module/settings/PasswordSettings"));

const Customers = lazy(() => import("../feature-module/people/CustomerList"));
const PurchaseOrder = lazy(() =>
  import("../feature-module/sales/PurchaseOrder")
);
const AddPurchaseOrder = lazy(() =>
  import("../feature-module/sales/AddPurchaseOrder")
);
const EditPurchaseOrder = lazy(() =>
  import("../feature-module/sales/EditPurchaseOrder")
);
const RevenueReport = lazy(() =>
  import("../feature-module/reports/RevenueReport")
);
const ProductReport = lazy(() =>
  import("../feature-module/reports/ProductReport")
);
const CustomerReport = lazy(() =>
  import("../feature-module/reports/CustomerReport")
);
const SupplierReport = lazy(() =>
  import("../feature-module/reports/SupplierReport")
);

const TransactionHistory = lazy(() =>
  import("../feature-module/sales/TransactionHistory")
);

const OrderHistory = lazy(() =>
  import("../feature-module/sales/OrderHistory")
);
const PosSystemSettings = lazy(() =>
  import("../feature-module/pos/PosSystemSettings")
);


const routes = allRoutes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard,
    name: "dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 2,
    path: routes.customers,
    name: "customers",
    element: <ProtectedRoute><Customers /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 3,
    path: routes.profile,
    name: "profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 3.1,
    path: routes.emailsettings,
    name: "email-settings",
    element: <ProtectedRoute><EmailSettings /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 3.2,
    path: routes.passwordsettings,
    name: "password-settings",
    element: <ProtectedRoute><PasswordSettings /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 3.3,
    path: routes.possystemsettings,
    name: "pos-system-settings",
    element: <ProtectedRoute><PosSystemSettings /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 4,
    path: routes.accounts,
    name: "accounts",
    element: <ProtectedRoute><AccountList /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 5,
    path: routes.rolespermission,
    name: "rolespermission",
    element: <ProtectedRoute><RoleList /></ProtectedRoute>,
    route: Route,
  },

  {
    id: 6,
    path: routes.formhorizontal,
    name: "formhorizontal",
    element: <ProtectedRoute><FormHorizontal /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 7,
    path: routes.products,
    name: "products",
    element: <ProtectedRoute><ProductList /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 8,
    path: routes.suppliers,
    name: "suppliers",
    element: <ProtectedRoute><Suppliers /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 9,
    path: routes.addproduct,
    name: "add-product",
    element: <ProtectedRoute><AddProduct /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 10,
    path: routes.editproduct,
    name: "edit-product",
    element: <ProtectedRoute><EditProduct /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 11,
    path: routes.categories,
    name: "categories",
    element: <ProtectedRoute><CategoryList /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 12,
    path: routes.subcategories,
    name: "sub-categories",
    element: <ProtectedRoute><SubCategories /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 13,
    path: routes.inventories,
    name: "inventories",
    element: <ProtectedRoute><InventoryList /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 14,
    path: routes.productprices,
    name: "product-prices",
    element: <ProtectedRoute><ProductPriceList /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 15,
    path: routes.editproductprice,
    name: "edit-product-price",
    element: <ProtectedRoute><EditProductPrice /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 16,
    path: routes.purchaseorders,
    name: "purchaseorders",
    element: <ProtectedRoute><PurchaseOrder /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 17,
    path: routes.addpurchaseorder,
    name: "add-purchaseorder",
    element: <ProtectedRoute><AddPurchaseOrder /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 18,
    path: routes.editpurchaseorder,
    name: "edit-purchaseorder",
    element: <ProtectedRoute><EditPurchaseOrder /></ProtectedRoute>,
    route: Route,
  },
  // {
  //   id: 20,
  //   path: routes.possettings,
  //   name: "possettings",
  //   element: <PosSettings />,
  //   route: Route,
  // },
  {
    id: 20,
    path: routes.revenuereport,
    name: "revenue-report",
    element: <ProtectedRoute><RevenueReport /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 21,
    path: routes.productreport,
    name: "product-report",
    element: <ProtectedRoute><ProductReport /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 22,
    path: routes.customerreport,
    name: "customer-report",
    element: <ProtectedRoute><CustomerReport /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 23,
    path: routes.supplierreport,
    name: "supplier-report",
    element: <ProtectedRoute><SupplierReport /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 25,
    path: routes.transactionhistory,
    name: "transaction-history",
    element: <ProtectedRoute><TransactionHistory /></ProtectedRoute>,
    route: Route,
  },
  {
    id: 26,
    path: routes.orderhistory,
    name: "order-history",
    element: <ProtectedRoute><OrderHistory /></ProtectedRoute>,
    route: Route,
  }
];

export const posPage = [
  {
    id: 1,
    path: routes.pos,
    name: "pos",
    element: <ProtectedRoute><Pos /></ProtectedRoute>,
    route: Route,
  },
];

export const unAuthRoutes = [
  {
    id: 1,
    path: routes.login,
    name: "login",
    element: <Login />,
    route: Route,
  },
  {
    id: 2,
    path: routes.forgotpassword,
    name: "forgotpassword",
    element: <Forgotpassword />,
    route: Route,
  },
  {
    id: 3,
    path: routes.verifyotp,
    name: "verifyotp",
    element: <VerifyOtp />,
    route: Route,
  },
  {
    id: 4,
    path: routes.resetpassword,
    name: "resetpassword",
    element: <Resetpassword />,
    route: Route,
  },
];
