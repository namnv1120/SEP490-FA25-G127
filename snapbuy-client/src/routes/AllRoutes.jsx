export const allRoutes = {
  dashboard: "/dashboard",

  products: "/products",
  addproduct: "/products/add",
  editproduct: "/products/edit/:id",
  inventories: "/inventories",
  categories: "/categories",
  subcategories: "/sub-categories",
  productprices: "/product-prices",
  editproductprice: "/product-prices/edit/:id",


  // Orders
  orders: "/orders",
  pos: "/pos",
  possettings: "/pos-settings",

  // Purchase
  purchaseorders: "/purchase-orders",
  addpurchaseorder: "/purchase-orders/add",
  editpurchaseorder: "/purchase-orders/edit/:id",

  // Customers & Suppliers
  customers: "/customers",
  suppliers: "/suppliers",

  // Reports
  revenuereport: "/revenue-report",
  productreport: "/product-report",
  customerreport: "/customer-report",
  supplierreport: "/supplier-report",

  // Expenses & Income
  expenselist: "/expense-list",
  expensecategory: "/expense-category",
  incomelist: "/income-list",
  incomecategory: "/income-category",

  // Stock
  storelist: "/store-list",
  managestock: "/manage-stock",
  stockadjustment: "/stock-adjustment",
  stocktransfer: "/stock-transfer",
  stockhistory: "/stock-history",
  soldstock: "/sold-stock",
  bestseller: "/bestseller",

  // Settings
  profile: "/settings/profile",
  appearance: "/appearance",
  languagesettings: "/language-settings",
  emailsettings: "/email-settings",
  smssettings: "/sms-settings",
  otpsettings: "/otp-settings",
  paymentgateway: "/payment-gateway",
  banksettingslist: "/bank-settings-list",
  currencysettings: "/currency-settings",
  storagesettings: "/storage-settings",
  notification: "/notification",
  systemsettings: "/system-settings",
  companysettings: "/company-settings",
  localizationsettings: "/localization-settings",
  prefixes: "/prefixes",
  preference: "/preference",
  securitysettings: "/security-settings",

  // Authentication
  login: "/login",
  forgotpassword: "/forgot-password",
  resetpassword: "/reset-password",
  emailverification: "/email-verification",
  twostepverification: "/two-step-verification",
  lockscreen: "/lock-screen",

  // Others
  chat: "/chat",
  email: "/email",
  todo: "/todo",
  activities: "/activities",
  accounts: "/accounts",
  rolespermission: "/roles-permissions",
  permissions: "/permissions",
  companies: "/companies",
  subscription: "/subscription",
  packagelist: "/packages",
  domain: "/domain",
  purchasetransaction: "/purchase-transaction",
};
