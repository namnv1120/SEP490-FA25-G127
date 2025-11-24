export const allRoutes = {
  admindashboard: "/admin-dashboard",
  shopownerdashboard: "/shopowner-dashboard",
  salesdashboard: "/sales-dashboard",
  warehousesdashboard: "/warehouses-dashboard", // Cho Chủ cửa hàng
  warehousedashboard: "/warehouse-dashboard", // Cho Nhân viên kho

  products: "/products",
  addproduct: "/products/add",
  editproduct: "/products/edit/:id",
  inventories: "/inventories",
  categories: "/categories",
  subcategories: "/sub-categories",
  productprices: "/product-prices",
  editproductprice: "/product-prices/edit/:id",

  orderhistory: "/order-history",
  pos: "/pos",
  posshift: "/pos-shift",
  transactionhistory: "/transaction-history",
  saledashboard: "/sale-dashboard",
  promotions: "/promotions",

  purchaseorders: "/purchase-orders",
  addpurchaseorder: "/purchase-orders/add",
  editpurchaseorder: "/purchase-orders/edit/:id",

  accounts: "/accounts",
  rolespermission: "/roles-permissions",
  customers: "/customers",
  suppliers: "/suppliers",

  revenuereport: "/revenue-report",
  productreport: "/product-report",
  customerreport: "/customer-report",
  supplierreport: "/supplier-report",

  ownerstaffaccounts: "/staff-accounts",
  staffshiftreport: "/staff-shifts",

  profile: "/settings/profile",
  emailsettings: "/settings/email",
  passwordsettings: "/settings/password",
  possystemsettings: "/settings/pos-system",

  login: "/login",
  forgotpassword: "/forgot-password",
  verifyotp: "/verify-otp",
  resetpassword: "/reset-password",
};
