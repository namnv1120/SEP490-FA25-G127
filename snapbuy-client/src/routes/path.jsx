import { Route } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";

const Suppliers = lazy(() => import("../feature-module/people/Supplier"));
const Dashboard = lazy(() => import("../feature-module/dashboard/Dashboard"));
const ProductList = lazy(() =>
  import("../feature-module/inventory/ProductList")
);
const Accounts = lazy(() => import("../feature-module/usermanagement/account"));
const RolesPermissions = lazy(() =>
  import("../feature-module/usermanagement/Rolespermissions")
);
const Profile = lazy(() => import("../feature-module/usermanagement/Profile"));
const Login = lazy(() =>
  import("../feature-module/pages/authentication/Login")
);
const Forgotpassword = lazy(() =>
  import("../feature-module/pages/authentication/ForgotPassword")
);
const Customers = lazy(() => import("../feature-module/people/Customer"));

// 🆕 Thêm Inventory
const Inventory = lazy(() => import("../feature-module/inventory/Inventory"));

const routes = all_routes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard,
    name: "dashboard",
    element: <Dashboard />,
    route: Route,
  },
  {
    id: 2,
    path: "/customers",
    name: "customers",
    element: <Customers />,
    route: Route,
  },
  {
    id: 106,
    path: routes.profile,
    name: "profile",
    element: <Profile />,
    route: Route,
  },
  {
    id: 104,
    path: routes.accounts,
    name: "accounts",
    element: <Accounts />,
    route: Route,
  },
  {
    id: 105,
    path: routes.rolespermission,
    name: "rolespermission",
    element: <RolesPermissions />,
    route: Route,
  },
  {
    id: 230,
    path: routes.formhorizontal,
    name: "formhorizontal",
    element: <FormHorizontal />,
    route: Route,
  },
  {
    id: 231,
    path: routes.suppliers,
    name: "suppliers",
    element: <Suppliers />,
    route: Route,
  },
  {
    id: 232,
    path: "/product-list",
    name: "product-list",
    element: <ProductList />,
    route: Route,
  },

  // 🆕 Thêm route Inventory chính
  {
    id: 300,
    path: routes.inventory, // đảm bảo trong all_routes có key inventory
    name: "inventory",
    element: <Inventory />,
    route: Route,
  },
];

export const posPages = [
  // giữ nguyên nếu cần POS sau này
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
    id: 3,
    path: routes.forgotpassword,
    name: "forgotpassword",
    element: <Forgotpassword />,
    route: Route,
  },
];
