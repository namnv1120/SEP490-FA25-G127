import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllAccounts, getMyInfo } from "../../services/AccountService";
import { getAllOrders } from "../../services/OrderService";
import PageLoader from "../../components/loading/PageLoader.jsx";
import CommonFooter from "../../components/footer/CommonFooter";
import { allRoutes } from "../../routes/AllRoutes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const route = allRoutes;
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ fullName: "" });
  const [dashboardData, setDashboardData] = useState({
    shopOwners: [],
    allOrders: [],
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [accounts, orders, userInfoData] = await Promise.all([
          getAllAccounts().catch(() => []),
          getAllOrders().catch(() => []),
          getMyInfo().catch(() => ({ fullName: "" })),
        ]);

        // Filter shop owners (Chủ cửa hàng)
        const shopOwners = Array.isArray(accounts)
          ? accounts.filter((account) => {
            const roles = account.roles || [];
            return roles.some((role) => {
              const roleStr =
                typeof role === "string" ? role : role?.name || role?.roleName || "";
              return (
                roleStr.toLowerCase().includes("chủ cửa hàng") ||
                roleStr.toLowerCase().includes("chu cua hang") ||
                roleStr.toLowerCase().includes("owner") ||
                roleStr === "ROLE_OWNER"
              );
            });
          })
          : [];

        setDashboardData({
          shopOwners: shopOwners,
          allOrders: Array.isArray(orders) ? orders : [],
        });

        const userData = userInfoData.result || userInfoData;
        setUserInfo({ fullName: userData.fullName || "Admin" });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalShopOwners = dashboardData.shopOwners.length;

    // Count active shop owners (those who have created at least one order)
    const activeShopOwners = dashboardData.shopOwners.filter((owner) => {
      const ownerId = owner.accountId || owner.id;
      return dashboardData.allOrders.some(
        (order) =>
          (order.account?.accountId || order.accountId) === ownerId ||
          (order.createdBy === ownerId)
      );
    }).length;

    // Total revenue from all shop owners
    const paidOrders = dashboardData.allOrders.filter(
      (o) =>
        (o.paymentStatus || "").toString().toLowerCase() === "đã thanh toán"
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    // Calculate this month's revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = paidOrders
      .filter((order) => {
        const orderDate = new Date(
          order.orderDate || order.createdDate || order.createdAt
        );
        return orderDate >= firstDayOfMonth;
      })
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    // Total orders
    const totalOrders = dashboardData.allOrders.length;

    return {
      totalShopOwners,
      activeShopOwners,
      totalRevenue,
      thisMonthRevenue,
      totalOrders,
    };
  }, [dashboardData]);

  // Revenue trend for last 30 days
  const revenueTrend = useMemo(() => {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last30Days.push({ date: dateStr, revenue: 0, orders: 0 });
    }

    dashboardData.allOrders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() === "đã thanh toán"
      ) {
        const orderDate = new Date(
          order.orderDate || order.createdDate || order.createdAt
        );
        const dateStr = orderDate.toISOString().split("T")[0];
        const dayData = last30Days.find((d) => d.date === dateStr);
        if (dayData) {
          dayData.revenue += Number(order.totalAmount || 0);
          dayData.orders += 1;
        }
      }
    });

    return {
      categories: last30Days.map((d) => {
        const [_y, m, day] = d.date.split("-");
        return `${day}/${m}`;
      }),
      revenueData: last30Days.map((d) => d.revenue),
      ordersData: last30Days.map((d) => d.orders),
    };
  }, [dashboardData.allOrders]);

  // Top shop owners by revenue
  const topShopOwners = useMemo(() => {
    const ownerRevenue = {};

    dashboardData.allOrders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const ownerId = order.account?.accountId || order.accountId || order.createdBy;
      if (!ownerId) return;

      const owner = dashboardData.shopOwners.find(
        (o) => (o.accountId || o.id) === ownerId
      );
      if (!owner) return;

      if (!ownerRevenue[ownerId]) {
        ownerRevenue[ownerId] = {
          name: owner.fullName || `Shop ${ownerId}`,
          email: owner.email || "",
          phone: owner.phoneNumber || owner.phone || "",
          revenue: 0,
          orderCount: 0,
        };
      }

      ownerRevenue[ownerId].revenue += Number(order.totalAmount || 0);
      ownerRevenue[ownerId].orderCount += 1;
    });

    return Object.values(ownerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [dashboardData]);

  // Recent shop owners
  const recentShopOwners = useMemo(() => {
    return [...dashboardData.shopOwners]
      .sort((a, b) => {
        const dateA = new Date(a.createdDate || a.createdAt || 0);
        const dateB = new Date(b.createdDate || b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [dashboardData.shopOwners]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Chart configurations
  const revenueChartOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#0E9384", "#E04F16"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: revenueTrend.categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: [
      {
        title: {
          text: "Doanh thu (VND)",
        },
        labels: {
          formatter: (val) => formatCurrency(val),
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
      {
        opposite: true,
        title: {
          text: "Số đơn hàng",
        },
        labels: {
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
    ],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      y: [
        {
          formatter: (val) => formatCurrency(val),
        },
        {
          formatter: (val) => `${val} đơn`,
        },
      ],
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  return loading ? (
    <PageLoader />
  ) : (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header">
          <div className="add-item d-flex justify-content-between align-items-center">
            <div className="page-title">
              <h1 className="mb-1">Chào mừng, {userInfo.fullName}</h1>
              <p className="fw-medium text-muted">
                Quản lý hệ thống và theo dõi các cửa hàng
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng cửa hàng</h6>
                    <h3 className="text-white mb-0">
                      {stats.totalShopOwners}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-primary rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-building-store fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Cửa hàng hoạt động</h6>
                    <h3 className="text-white mb-0">
                      {stats.activeShopOwners}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-success rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-chart-line fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Doanh thu tháng này</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(stats.thisMonthRevenue)}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-warning rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-currency-dollar fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng doanh thu</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(stats.totalRevenue)}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-info rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-wallet fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="row">
          <div className="col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-primary fs-16 me-2">
                    <i className="ti ti-chart-line" />
                  </span>
                  <h5 className="card-title mb-0">
                    Xu hướng doanh thu và đơn hàng (30 ngày gần đây)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={revenueChartOptions}
                  series={[
                    { name: "Doanh thu", data: revenueTrend.revenueData },
                    {
                      name: "Số đơn hàng",
                      data: revenueTrend.ordersData,
                      type: "line",
                    },
                  ]}
                  type="area"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Shop Owners and Recent Shop Owners */}
        <div className="row">
          {/* Top Shop Owners */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-secondary fs-16 me-2">
                      <i className="ti ti-trophy" />
                    </span>
                    <h5 className="card-title mb-0">
                      Top cửa hàng theo doanh thu
                    </h5>
                  </div>
                  <Link
                    to={route.accounts}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cửa hàng</th>
                        <th className="text-center">Đơn hàng</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topShopOwners.length > 0 ? (
                        topShopOwners.map((owner, index) => (
                          <tr key={index}>
                            <td>
                              <span
                                className={`badge ${index === 0
                                    ? "bg-success"
                                    : index === 1
                                      ? "badge-soft-success"
                                      : index === 2
                                        ? "badge-soft-warning"
                                        : "badge-soft-secondary"
                                  }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{owner.name}</div>
                                <small className="text-muted">
                                  {owner.email}
                                </small>
                              </div>
                            </td>
                            <td className="text-center fw-semibold">
                              {owner.orderCount}
                            </td>
                            <td className="text-end fw-semibold text-success">
                              {formatCurrency(owner.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Shop Owners */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-info fs-16 me-2">
                      <i className="ti ti-users" />
                    </span>
                    <h5 className="card-title mb-0">Cửa hàng mới đăng ký</h5>
                  </div>
                  <Link
                    to={route.accounts}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Cửa hàng</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Ngày đăng ký</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentShopOwners.length > 0 ? (
                        recentShopOwners.map((owner, index) => (
                          <tr key={owner.accountId || owner.id || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="avatar avatar-sm bg-primary text-white me-2">
                                  {(owner.fullName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                                <span className="fw-medium">
                                  {owner.fullName || "Không tên"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <small>{owner.email || "Không có"}</small>
                            </td>
                            <td>
                              {owner.phoneNumber || owner.phone || "Không có"}
                            </td>
                            <td>
                              {formatDate(owner.createdDate || owner.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Chưa có cửa hàng nào đăng ký
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-primary fs-16 me-2">
                    <i className="ti ti-chart-bar" />
                  </span>
                  <h5 className="card-title mb-0">Thống kê hệ thống</h5>
                </div>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border p-3 rounded">
                      <h3 className="text-primary mb-2">
                        {stats.totalShopOwners}
                      </h3>
                      <p className="mb-0">Tổng số cửa hàng</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border p-3 rounded">
                      <h3 className="text-success mb-2">
                        {stats.activeShopOwners}
                      </h3>
                      <p className="mb-0">Cửa hàng hoạt động</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border p-3 rounded">
                      <h3 className="text-warning mb-2">{stats.totalOrders}</h3>
                      <p className="mb-0">Tổng số đơn hàng</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border p-3 rounded">
                      <h3 className="text-info mb-2">
                        {formatCurrency(stats.totalRevenue)}
                      </h3>
                      <p className="mb-0">Tổng doanh thu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default AdminDashboard;

