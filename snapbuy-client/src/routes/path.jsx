import { Route } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";

import Pos from "../feature-module/pos/pos";
const Suppliers = lazy(() => import("../feature-module/people/Supplier"));

const Dashboard = lazy(() => import("../feature-module/dashboard/Dashboard"));
const ProductList = lazy(() => import("../feature-module/inventory/ProductList"));
const ProductDetail = lazy(() => import("../feature-module/inventory/ProductDetail"));
const AddProduct = lazy(() => import("../feature-module/inventory/AddProduct"));
const EditProduct = lazy(() => import("../feature-module/inventory/EditProduct"));
const ProductPriceList = lazy(() => import("../feature-module/inventory/ProductPriceList"));
const AddProductPrice = lazy(() => import("../feature-module/inventory/AddProductPrice"));
const EditProductPrice = lazy(() => import("../feature-module/inventory/EditProductPrice"));
const InventoryList = lazy(() => import("../feature-module/inventory/InventoryList"));

const CategoryList = lazy(() => import("../feature-module/inventory/CategoryList"));
const SubCategories = lazy(() => import("../feature-module/inventory/SubCategoryList"));

const Accounts = lazy(() => import("../feature-module/usermanagement/account"));
const RolesPermissions = lazy(() =>
  import("../feature-module/usermanagement/rolespermissions")
);
const Permissions = lazy(() =>
  import("../feature-module/usermanagement/permissions")
);
const Profile = lazy(() => import("../feature-module/usermanagement/Profile"));
const Login = lazy(() =>
  import("../feature-module/pages/authentication/Login")
);
const Forgotpassword = lazy(() =>
  import("../feature-module/pages/authentication/ForgotPassword")
);
const PosSettings = lazy(
  () => import("../feature-module/settings/websitesettings/possettings")
);
const PosOrder = lazy(
  () => import("../feature-module/sales/pos-order/posOrder")
);

const Customers = lazy(() => import("../feature-module/people/Customer"));

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
    path: routes.customers,
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
    id: 8,
    path: routes.products,
    name: "products",
    element: <ProductList />,
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
    id: 9,
    path: routes.productdetails,
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
    path: routes.editproduct,
    name: "edit-product",
    element: <EditProduct />,
    route: Route,
  },
  {
    id: 12,
    path: routes.categories,
    name: "categories",
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
  {
    id: 14,
    path: routes.inventories,
    name: "inventories",
    element: <InventoryList />,
    route: Route,
  },
  {
    id: 15,
    path: routes.productprices,
    name: "product-prices",
    element: <ProductPriceList />,
    route: Route,
  },
  {
    id: 16,
    path: routes.addproductprice,
    name: "add-product-price",
    element: <AddProductPrice />,
    route: Route,
  },
  {
    id: 17,
    path: routes.editproductprice,
    name: "edit-product-price",
    element: <EditProductPrice />,
    route: Route,
  },

  {
    id: 76,
    path: routes.possettings,
    name: "possettings",
    element: <PosSettings />,
    route: Route,
  },
  {
    id: 106,
    path: routes.permissions,
    name: "permissions",
    element: <Permissions />,
    route: Route,
  },
  {
    id: 121,
    path: routes.posorder,
    name: "pos-orders",
    element: <PosOrder />,
    route: Route,
  },
];

export const posPage = [
  {
    id: 25,
    path: routes.pos,
    name: "pos",
    element: <Pos />,
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
    id: 3,
    path: routes.forgotpassword,
    name: "forgotpassword",
    element: <Forgotpassword />,
    route: Route,
  },
];
