import { Route } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";


const Suppliers = lazy(() => import("../feature-module/people/Supplier"));

const Dashboard = lazy(() => import("../feature-module/dashboard/Dashboard"));
const ProductList = lazy(() => import("../feature-module/inventory/ProductList"));
const ProductDetail = lazy(() => import("../feature-module/inventory/ProductDetail"));
const AddProduct = lazy(() => import("../feature-module/inventory/AddProduct"));
const EditProduct = lazy(() => import("../feature-module/inventory/EditProduct"));

const CategoryList = lazy(() => import("../feature-module/inventory/CategoryList"));
const SubCategories = lazy(() => import("../feature-module/inventory/SubCategoryList"));


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
    id: 3,
    path: routes.profile,
    name: "profile",
    element: <Profile />,
    route: Route,
  },
  {
    id: 4,
    path: routes.accounts,
    name: "accounts",
    element: <Accounts />,
    route: Route,
  },
  {
    id: 5,
    path: routes.rolespermission,
    name: "rolespermission",
    element: <RolesPermissions />,
    route: Route,
  },
  {
    id: 6,
    path: routes.formhorizontal,
    name: "formhorizontal",
    element: <FormHorizontal />,
    route: Route,
  },
  {
    id: 7,
    path: routes.suppliers,
    name: "suppliers",
    element: <Suppliers />,
    route: Route,
  },
  {
    id: 8,
    path: routes.productlist,
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
  {
    id: 9,
    path: `${routes.productdetails}/:id`,
    name: "product-details",
    element: <ProductDetail />,
    route: Route,
  },
  {
    id: 10,
    path: routes.addproduct,
    name: "add-product",
    element: <AddProduct />,
    route: Route,
  },
  {
    id: 11,
    path: `${routes.editproduct}/:id`,
    name: "edit-product",
    element: <EditProduct />,
    route: Route,
  },
  {
    id: 12,
    path: routes.categorylist,
    name: "category-list",
    element: <CategoryList />,
    route: Route,
  },
  {
    id: 13,
    path: routes.subcategories,
    name: "sub-categories",
    element: <SubCategories />,
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
