export const routeRoleMap = {
  "/shopowner-dashboard": ["Chủ cửa hàng"],
  "/warehouses-dashboard": ["Chủ cửa hàng"],
  "/sales-dashboard": ["Chủ cửa hàng"],
  "/warehouse-dashboard": ["Chủ cửa hàng", "Nhân viên kho"],
  "/sale-dashboard": ["Chủ cửa hàng", "Nhân viên bán hàng"],

  "/products": null,
  "/products/add": null,
  "/products/edit/:id": null,

  "/product-prices": null,
  "/product-prices/edit/:id": null,

  "/inventories": null,

  "/categories": null,
  "/sub-categories": null,

  "/purchase-orders": ["Chủ cửa hàng", "Nhân viên kho"],
  "/purchase-orders/add": ["Chủ cửa hàng", "Nhân viên kho"],
  "/purchase-orders/edit/:id": [
    "Chủ cửa hàng",
    "Nhân viên kho",
  ],

  "/order-history": ["Chủ cửa hàng", "Nhân viên bán hàng"],

  "/transaction-history": null,

  "/pos": ["Chủ cửa hàng", "Nhân viên bán hàng"],
  "/pos-shift": ["Chủ cửa hàng", "Nhân viên bán hàng"],
  "/shift-history": ["Chủ cửa hàng", "Nhân viên bán hàng"],

  "/accounts": ["Chủ cửa hàng"],

  "/roles-permissions": ["Chủ cửa hàng"],

  "/customers": ["Chủ cửa hàng", "Nhân viên bán hàng"],

  "/suppliers": ["Chủ cửa hàng", "Nhân viên kho"],

  "/staff-accounts": ["Chủ cửa hàng"],
  "/staff-shifts": ["Chủ cửa hàng"],

  "/revenue-report": ["Chủ cửa hàng"],
  "/product-report": ["Chủ cửa hàng"],
  "/customer-report": ["Chủ cửa hàng"],
  "/supplier-report": ["Quản trị viên", "Chủ cửa hàng"],

  "/settings/profile": null,
  "/settings/email": null,
  "/settings/password": null,
  "/settings/pos-system": ["Quản trị viên", "Chủ cửa hàng"],

  "/404": null,
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
