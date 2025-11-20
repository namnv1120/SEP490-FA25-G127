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
        route: "/sales-overview",
        subRoutes: [],
      },
      {
        tittle: "Đóng/Mở ca",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/pos-shift",
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
