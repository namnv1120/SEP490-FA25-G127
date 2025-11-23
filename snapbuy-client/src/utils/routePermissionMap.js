// Map route paths với roles được phép truy cập
// Dựa trên @PreAuthorize trong các controller backend
// Format: ['Quản trị viên', 'Chủ cửa hàng'] hoặc null (ai cũng có thể truy cập)

export const routeRoleMap = {
  // Dashboard - Không có @PreAuthorize, ai cũng có thể xem
  '/dashboard': null,

  // Products - Một số endpoint có @PreAuthorize, nhưng list không có
  '/products': null,
  '/products/add': null,
  '/products/edit/:id': null,

  // Product Prices
  '/product-prices': null,
  '/product-prices/edit/:id': null,

  // Inventories - Không có @PreAuthorize
  '/inventories': null,

  // Categories
  '/categories': null,
  '/sub-categories': null,

  // Purchase Orders - hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')
  '/purchase-orders': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên kho'],
  '/purchase-orders/add': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên kho'],
  '/purchase-orders/edit/:id': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên kho'],

  // Order History - Không có @PreAuthorize
  '/order-history': null,

  // Transaction History - Không có @PreAuthorize
  '/transaction-history': null,

  // POS - hạn chế theo role
  '/pos': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên bán hàng'],
  '/pos-shift': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên bán hàng'],
  '/sales-dashboard': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên bán hàng'],

  // Accounts - hasRole('Quản trị viên')
  '/accounts': ['Quản trị viên'],

  // Roles - hasAnyRole('Quản trị viên','Chủ cửa hàng')
  '/roles-permissions': ['Quản trị viên', 'Chủ cửa hàng'],

  // Customers - hạn chế theo role
  '/customers': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên bán hàng'],

  // Suppliers - hạn chế theo role
  '/suppliers': ['Quản trị viên', 'Chủ cửa hàng', 'Nhân viên kho'],

  // Staff management - hasAnyRole('Quản trị viên','Chủ cửa hàng')
  '/staff-accounts': ['Quản trị viên', 'Chủ cửa hàng'],
  '/staff-shifts': ['Quản trị viên', 'Chủ cửa hàng'],

  // Reports - hasAnyRole('Quản trị viên','Chủ cửa hàng')
  '/revenue-report': ['Quản trị viên', 'Chủ cửa hàng'],
  '/product-report': ['Quản trị viên', 'Chủ cửa hàng'],
  '/customer-report': ['Quản trị viên', 'Chủ cửa hàng'],
  '/supplier-report': ['Quản trị viên', 'Chủ cửa hàng'],

  // Settings - Không có @PreAuthorize (ai cũng có thể xem profile của mình)
  '/settings/profile': null,
  '/settings/email': null,
  '/settings/password': null,
  // POS Settings - hasAnyRole('Quản trị viên', 'Chủ cửa hàng')
  '/settings/pos-system': ['Quản trị viên', 'Chủ cửa hàng'],
};

// Helper function để match route với pattern
export const matchRoute = (currentPath, routePattern) => {
  // Convert route pattern to regex
  const pattern = routePattern.replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(currentPath);
};

// Get allowed roles for a route
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

  // Default: no role required (allow access)
  return null;
};
