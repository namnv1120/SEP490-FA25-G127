export const routeRoleMap = {
  "/admin-dashboard": ["Quản trị viên"],
  "/shopowner-dashboard": ["Quản trị viên", "Chủ cửa hàng"],
  "/warehouses-dashboard": ["Quản trị viên", "Chủ cửa hàng"],
  "/sales-dashboard": ["Quản trị viên", "Chủ cửa hàng"],
  "/warehouse-dashboard": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên kho"],
  "/sale-dashboard": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên bán hàng"],

  "/products": null,
  "/products/add": null,
  "/products/edit/:id": null,

  "/product-prices": null,
  "/product-prices/edit/:id": null,

  "/inventories": null,

  "/categories": null,
  "/sub-categories": null,

  "/purchase-orders": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên kho"],
  "/purchase-orders/add": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên kho"],
  "/purchase-orders/edit/:id": [
    "Quản trị viên",
    "Chủ cửa hàng",
    "Nhân viên kho",
  ],

  "/order-history": null,

  "/transaction-history": null,

  "/pos": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên bán hàng"],
  "/pos-shift": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên bán hàng"],

  "/accounts": ["Quản trị viên"],

  "/roles-permissions": ["Quản trị viên", "Chủ cửa hàng"],

  "/customers": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên bán hàng"],

  "/suppliers": ["Quản trị viên", "Chủ cửa hàng", "Nhân viên kho"],

  "/staff-accounts": ["Quản trị viên", "Chủ cửa hàng"],
  "/staff-shifts": ["Quản trị viên", "Chủ cửa hàng"],

  "/revenue-report": ["Quản trị viên", "Chủ cửa hàng"],
  "/product-report": ["Quản trị viên", "Chủ cửa hàng"],
  "/customer-report": ["Quản trị viên", "Chủ cửa hàng"],
  "/supplier-report": ["Quản trị viên", "Chủ cửa hàng"],

  "/settings/profile": null,
  "/settings/email": null,
  "/settings/password": null,
  "/settings/pos-system": ["Quản trị viên", "Chủ cửa hàng"],
};

export const matchRoute = (currentPath, routePattern) => {
  // Convert route pattern to regex
  const pattern = routePattern.replace(/:[^/]+/g, "[^/]+");
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(currentPath);
};

export const getAllowedRolesForRoute = (routePath) => {
  // Try exact match first
  if (routeRoleMap[routePath] !== undefined) {
    return routeRoleMap[routePath];
  }

  // Try pattern matching
  for (const [pattern, roles] of Object.entries(routeRoleMap)) {
    if (matchRoute(routePath, pattern)) {
      return roles;
    }
  }

  return null;
};
