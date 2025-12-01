export const SidebarDataSales = [
  {
    tittle: "Tổng quan",
    hasSubRoute: true,
    icon: "layout-grid",
    showSubRoute: false,
    subRoutes: [
      {
        tittle: "Thống kê nhân viên",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/sale-dashboard",
        subRoutes: [],
      },
      {
        tittle: "Quản lý ca làm việc",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/pos-shift",
        subRoutes: [],
      },
      {
        tittle: "Lịch sử ca làm việc",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/shift-history",
        subRoutes: [],
      },
    ],
  },
  {
    tittle: "Giao dịch",
    hasSubRoute: true,
    icon: "layout-grid",
    showSubRoute: false,
    activeRoute: "sales",
    subRoutes: [
      {
        tittle: "Lịch sử đơn hàng",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/order-history",
        subRoutes: [],
      },
    ],
  },
  {
    tittle: "Đối tác",
    hasSubRoute: true,
    icon: "users",
    showSubRoute: false,
    activeRoute: "partners",
    subRoutes: [
      {
        tittle: "Khách hàng",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/customers",
        subRoutes: [],
      },
    ],
  },
];
