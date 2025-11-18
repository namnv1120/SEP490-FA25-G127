import { allRoutes } from "./AllRoutes";

// Chỉ giữ cấu hình route, không import component để tránh cảnh báo Fast Refresh


const routes = allRoutes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard,
    name: "dashboard",
    componentKey: "Dashboard",
    protected: true,
  },
  {
    id: 2,
    path: routes.customers,
    name: "customers",
    componentKey: "Customers",
    protected: true,
  },
  {
    id: 3,
    path: routes.profile,
    name: "profile",
    componentKey: "Profile",
    protected: true,
  },
  {
    id: 3.1,
    path: routes.emailsettings,
    name: "email-settings",
    componentKey: "EmailSettings",
    protected: true,
  },
  {
    id: 3.2,
    path: routes.passwordsettings,
    name: "password-settings",
    componentKey: "PasswordSettings",
    protected: true,
  },
  {
    id: 3.3,
    path: routes.possystemsettings,
    name: "pos-system-settings",
    componentKey: "PosSystemSettings",
    protected: true,
  },
  {
    id: 4,
    path: routes.accounts,
    name: "accounts",
    componentKey: "AccountList",
    protected: true,
  },
  {
    id: 5,
    path: routes.rolespermission,
    name: "rolespermission",
    componentKey: "RoleList",
    protected: true,
  },

  {
    id: 6,
    path: routes.formhorizontal,
    name: "formhorizontal",
    componentKey: "FormHorizontal",
    protected: true,
  },
  {
    id: 7,
    path: routes.products,
    name: "products",
    componentKey: "ProductList",
    protected: true,
  },
  {
    id: 8,
    path: routes.suppliers,
    name: "suppliers",
    componentKey: "Suppliers",
    protected: true,
  },
  {
    id: 9,
    path: routes.addproduct,
    name: "add-product",
    componentKey: "AddProduct",
    protected: true,
  },
  {
    id: 10,
    path: routes.editproduct,
    name: "edit-product",
    componentKey: "EditProduct",
    protected: true,
  },
  {
    id: 11,
    path: routes.categories,
    name: "categories",
    componentKey: "CategoryList",
    protected: true,
  },
  {
    id: 12,
    path: routes.subcategories,
    name: "sub-categories",
    componentKey: "SubCategoryList",
    protected: true,
  },
  {
    id: 13,
    path: routes.inventories,
    name: "inventories",
    componentKey: "InventoryList",
    protected: true,
  },
  {
    id: 14,
    path: routes.productprices,
    name: "product-prices",
    componentKey: "ProductPriceList",
    protected: true,
  },
  {
    id: 15,
    path: routes.editproductprice,
    name: "edit-product-price",
    componentKey: "EditProductPrice",
    protected: true,
  },
  {
    id: 16,
    path: routes.purchaseorders,
    name: "purchaseorders",
    componentKey: "PurchaseOrder",
    protected: true,
  },
  {
    id: 17,
    path: routes.addpurchaseorder,
    name: "add-purchaseorder",
    componentKey: "AddPurchaseOrder",
    protected: true,
  },
  {
    id: 18,
    path: routes.editpurchaseorder,
    name: "edit-purchaseorder",
    componentKey: "EditPurchaseOrder",
    protected: true,
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
    componentKey: "RevenueReport",
    protected: true,
  },
  {
    id: 21,
    path: routes.productreport,
    name: "product-report",
    componentKey: "ProductReport",
    protected: true,
  },
  {
    id: 22,
    path: routes.customerreport,
    name: "customer-report",
    componentKey: "CustomerReport",
    protected: true,
  },
  {
    id: 23,
    path: routes.supplierreport,
    name: "supplier-report",
    componentKey: "SupplierReport",
    protected: true,
  },
  {
    id: 25,
    path: routes.transactionhistory,
    name: "transaction-history",
    componentKey: "TransactionHistory",
    protected: true,
  },
  {
    id: 26,
    path: routes.orderhistory,
    name: "order-history",
    componentKey: "OrderHistory",
    protected: true,
  }
];

export const posPage = [
  {
    id: 1,
    path: routes.pos,
    name: "pos",
    componentKey: "Pos",
    protected: true,
  },
];

export const unAuthRoutes = [
  {
    id: 1,
    path: routes.login,
    name: "login",
    componentKey: "Login",
    protected: false,
  },
  {
    id: 2,
    path: routes.forgotpassword,
    name: "forgotpassword",
    componentKey: "ForgotPassword",
    protected: false,
  },
  {
    id: 3,
    path: routes.verifyotp,
    name: "verifyotp",
    componentKey: "VerifyOtp",
    protected: false,
  },
  {
    id: 4,
    path: routes.resetpassword,
    name: "resetpassword",
    componentKey: "ResetPassword",
    protected: false,
  },
];
