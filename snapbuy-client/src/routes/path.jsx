import { Route } from "react-router-dom";
import { lazy } from "react";
import { allRoutes } from "./AllRoutes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";

const Pos = lazy(() => import("../feature-module/pos/Pos"));
const Login = lazy(() => import("../feature-module/pages/authentication/Login"));
const Forgotpassword = lazy(() => import("../feature-module/pages/authentication/ForgotPassword"));
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
const OrderList = lazy(() => import("../feature-module/sales/OrderList"));
const CategoryList = lazy(() => import("../feature-module/inventories/CategoryList"));
const SubCategories = lazy(() => import("../feature-module/inventories/SubCategoryList"));

const AccountList = lazy(() => import("../feature-module/accounts/AccountList"));
const RoleList = lazy(() =>
  import("../feature-module/accounts/RoleList")
);
const Profile = lazy(() => import("../feature-module/settings/Profile"));

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

const TransactionHistory = lazy(() =>
  import("../feature-module/sales/TransactionHistory")
);

const OrderHistory = lazy(() =>
  import("../feature-module/sales/OrderHistory")
);


const routes = allRoutes;

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
    element: <AccountList />,
    route: Route,
  },
  {
    id: 5,
    path: routes.rolespermission,
    name: "rolespermission",
    element: <RoleList />,
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
    path: routes.products,
    name: "products",
    element: <ProductList />,
    route: Route,
  },
  {
    id: 8,
    path: routes.suppliers,
    name: "suppliers",
    element: <Suppliers />,
    route: Route,
  },
  {
    id: 9,
    path: routes.addproduct,
    name: "add-product",
    element: <AddProduct />,
    route: Route,
  },
  {
    id: 10,
    path: routes.editproduct,
    name: "edit-product",
    element: <EditProduct />,
    route: Route,
  },
  {
    id: 11,
    path: routes.categories,
    name: "categories",
    element: <CategoryList />,
    route: Route,
  },
  {
    id: 12,
    path: routes.subcategories,
    name: "sub-categories",
    element: <SubCategories />,
    route: Route,
  },
  {
    id: 13,
    path: routes.inventories,
    name: "inventories",
    element: <InventoryList />,
    route: Route,
  },
  {
    id: 14,
    path: routes.productprices,
    name: "product-prices",
    element: <ProductPriceList />,
    route: Route,
  },
  {
    id: 15,
    path: routes.editproductprice,
    name: "edit-product-price",
    element: <EditProductPrice />,
    route: Route,
  },
  {
    id: 16,
    path: routes.purchaseorders,
    name: "purchaseorders",
    element: <PurchaseOrder />,
    route: Route,
  },
  {
    id: 17,
    path: routes.addpurchaseorder,
    name: "add-purchaseorder",
    element: <AddPurchaseOrder />,
    route: Route,
  },
  {
    id: 18,
    path: routes.editpurchaseorder,
    name: "edit-purchaseorder",
    element: <EditPurchaseOrder />,
    route: Route,
  },
  {
    id: 19,
    path: routes.orders,
    name: "orders",
    element: <OrderList />,
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
    id: 21,
    path: routes.permissions,
    name: "permissions",
    element: <Permissions />,
    route: Route,
  },
  {
    id: 22,
    path: routes.transactionhistory,
    name: "transaction-history",
    element: <TransactionHistory />,
    route: Route,
  },
  {
    id: 23,
    path: routes.orderhistory,
    name: "order-history",
    element: <OrderHistory />,
    route: Route,
  }
];

export const posPage = [
  {
    id: 1,
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
    id: 2,
    path: routes.forgotpassword,
    name: "forgotpassword",
    element: <Forgotpassword />,
    route: Route,
  },
];
