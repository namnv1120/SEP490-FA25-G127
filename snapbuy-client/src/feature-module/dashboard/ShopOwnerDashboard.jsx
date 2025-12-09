import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { Doughnut } from "react-chartjs-2";
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
import { getAllOrders } from "../../services/OrderService";
import { getAllProducts } from "../../services/ProductService";
import { getAllCustomers } from "../../services/CustomerService";
import { getAllInventories } from "../../services/InventoryService";
import { getMyInfo } from "../../services/AccountService";
import PageLoader from "../../components/loading/PageLoader.jsx";
import CommonFooter from "../../components/footer/CommonFooter";
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

const ShopOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ fullName: "" });
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    products: [],
    customers: [],
    inventories: [],
    accounts: [],
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [orders, products, customers, inventories, userInfoData] =
          await Promise.all([
            getAllOrders().catch(() => []),
            getAllProducts().catch(() => []),
            getAllCustomers().catch(() => []),
            getAllInventories().catch(() => []),
            getMyInfo().catch(() => ({ fullName: "" })),
          ]);

        setDashboardData({
          orders: Array.isArray(orders) ? orders : [],
          products: Array.isArray(products) ? products : [],
          customers: Array.isArray(customers) ? customers : [],
          inventories: Array.isArray(inventories) ? inventories : [],
          accounts: [], // Not using accounts API as it's failing
        });

        const userData = userInfoData.result || userInfoData;
        setUserInfo({ fullName: userData.fullName || "" });
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
    const paidOrders = dashboardData.orders.filter(
      (o) =>
        (o.paymentStatus || "").toString().toLowerCase() === "đã thanh toán"
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const lowStockItems = dashboardData.inventories.filter(
      (inv) => Number(inv.stockQuantity || 0) < 10
    ).length;

    return {
      totalRevenue,
      totalOrders: paidOrders.length,
      totalProducts: dashboardData.products.length,
      totalCustomers: dashboardData.customers.length,
      lowStockItems,
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
      last30Days.push({ date: dateStr, revenue: 0 });
    }

    dashboardData.orders.forEach((order) => {
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
        }
      }
    });

    return {
      categories: last30Days.map((d) => {
        const [y, m, day] = d.date.split("-");
        return `${day}/${m}`;
      }),
      data: last30Days.map((d) => d.revenue),
    };
  }, [dashboardData.orders]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const methods = { CASH: 0, MOMO: 0 };

    dashboardData.orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const method = (
        order.payment?.paymentMethod ||
        order.paymentMethod ||
        "CASH"
      )
        .toString()
        .toUpperCase();

      if (method.includes("MOMO")) methods.MOMO++;
      else methods.CASH++;
    });

    return {
      labels: ["Tiền mặt", "MoMo"],
      data: [methods.CASH, methods.MOMO],
      backgroundColor: ["#0E9384", "#E04F16"],
    };
  }, [dashboardData.orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = {};

    dashboardData.orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      // Ensure order has items
      const items = order.items || order.orderDetails || [];

      items.forEach((item) => {
        // Try different property paths for product ID and name
        const productId = item.productId || item.product?.productId || item.id;

        const productName =
          item.product?.productName ||
          item.productName ||
          item.name ||
          "Sản phẩm không xác định";

        if (!productId) return;

        if (!productSales[productId]) {
          productSales[productId] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productSales[productId].quantity += Number(item.quantity || 0);
        productSales[productId].revenue += Number(
          item.totalPrice || item.price * item.quantity || 0
        );
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [dashboardData.orders]);

  // Staff performance (only sales staff) - Extract from orders since accounts API may fail
  const staffPerformance = useMemo(() => {
    const staffSales = {};

    dashboardData.orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const account = order.account;
      if (!account) return;

      const accountId = account.accountId || order.accountId;
      if (!accountId) return;

      // Check if this account is a sales staff from order.account.roles
      const roles = account.roles || [];
      const isSalesStaff = roles.some((role) => {
        const roleStr =
          typeof role === "string" ? role : role?.name || role?.roleName || "";
        const roleLower = roleStr.toLowerCase();

        return (
          roleLower.includes("sale") ||
          roleLower.includes("nhân viên bán hàng") ||
          roleLower.includes("nhan vien ban hang") ||
          roleLower.includes("employee") ||
          roleStr === "ROLE_EMPLOYEE"
        );
      });

      if (!isSalesStaff) return;

      if (!staffSales[accountId]) {
        staffSales[accountId] = {
          name: account.fullName || `NV ${accountId}`,
          revenue: 0,
        };
      }

      staffSales[accountId].revenue += Number(order.totalAmount || 0);
    });

    const sorted = Object.values(staffSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      categories: sorted.map((s) => s.name),
      data: sorted.map((s) => s.revenue),
    };
  }, [dashboardData.orders]);

  // Recent orders
  const recentOrders = useMemo(() => {
    return [...dashboardData.orders]
      .sort((a, b) => {
        const dateA = new Date(
          a.orderDate || a.createdDate || a.createdAt || 0
        );
        const dateB = new Date(
          b.orderDate || b.createdDate || b.createdAt || 0
        );
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [dashboardData.orders]);

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
    return new Date(date).toLocaleString("vi-VN");
  };

  // Chart configurations
  const revenueChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#0E9384"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: revenueTrend.categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(val),
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
  };

  const staffChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#E04F16"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
      },
    },
    xaxis: {
      categories: staffPerformance.categories,
      labels: {
        formatter: (val) => formatCurrency(val),
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
  };

  const paymentChartData = {
    labels: paymentMethodData.labels,
    datasets: [
      {
        data: paymentMethodData.data,
        backgroundColor: paymentMethodData.backgroundColor,
        borderWidth: 5,
        borderRadius: 10,
        hoverBorderWidth: 0,
        cutout: "60%",
      },
    ],
  };

  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        enabled: true,
        mode: "point",
        intersect: true,
        callbacks: {
          label: function (context) {
            return context.label + ": " + context.parsed + " đơn";
          },
        },
      },
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
                Tổng quan và thống kê hoạt động kinh doanh của cửa hàng
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
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng đơn hàng</h6>
                    <h3 className="text-white mb-0">{stats.totalOrders}</h3>
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
                        className="ti ti-shopping-cart fs-2"
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
                    <h6 className="text-white mb-2">Tổng sản phẩm</h6>
                    <h3 className="text-white mb-0">{stats.totalProducts}</h3>
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
                        className="ti ti-package fs-2"
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
                    <h6 className="text-white mb-2">Khách hàng</h6>
                    <h3 className="text-white mb-0">{stats.totalCustomers}</h3>
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
                        className="ti ti-users fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {/* {stats.lowStockItems > 0 && (
          <div className="alert alert-warning alert-dismissible fade show mb-4">
            <div>
              <i className="ti ti-alert-triangle me-2" />
              <span className="fw-semibold">Cảnh báo tồn kho:</span> Có{" "}
              <span className="fw-bold">{stats.lowStockItems}</span> sản phẩm
              sắp hết hàng (dưới 10 sản phẩm).{" "}
              <Link
                to="/inventories"
                className="text-decoration-underline fw-semibold"
              >
                Xem chi tiết
              </Link>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            />
          </div>
        )} */}

        {/* Charts Row 1 */}
        <div className="row">
          {/* Revenue Trend */}
          <div className="col-xl-8 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-primary fs-16 me-2">
                    <i className="ti ti-chart-line" />
                  </span>
                  <h5 className="card-title mb-0">
                    Xu hướng doanh thu (30 ngày gần đây)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={revenueChartOptions}
                  series={[{ name: "Doanh thu", data: revenueTrend.data }]}
                  type="line"
                  height={350}
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="col-xl-4 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-teal fs-16 me-2">
                    <i className="ti ti-credit-card" />
                  </span>
                  <h5 className="card-title mb-0">Phương thức thanh toán</h5>
                </div>
              </div>
              <div className="card-body">
                <div style={{ height: "300px" }}>
                  <Doughnut
                    data={paymentChartData}
                    options={paymentChartOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row">
          {/* Staff Performance */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-secondary fs-16 me-2">
                    <i className="ti ti-users-group" />
                  </span>
                  <h5 className="card-title mb-0">
                    Hiệu suất nhân viên (Top 5)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={staffChartOptions}
                  series={[{ name: "Doanh thu", data: staffPerformance.data }]}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-orange fs-16 me-2">
                    <i className="ti ti-trophy" />
                  </span>
                  <h5 className="card-title mb-0">Sản phẩm bán chạy (Top 5)</h5>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Số lượng</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                          <tr key={index}>
                            <td>{product.name}</td>
                            <td className="text-end">{product.quantity}</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
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
        </div>

        {/* Recent Orders */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-info fs-16 me-2">
                      <i className="ti ti-file-text" />
                    </span>
                    <h5 className="card-title mb-0">Đơn hàng gần đây</h5>
                  </div>
                  <Link
                    to="/order-history"
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
                        <th>Mã đơn</th>
                        <th>Ngày</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <tr key={order.orderId}>
                            <td>
                              <span className="fw-semibold">
                                #{order.orderNumber}
                              </span>
                            </td>
                            <td>
                              {formatDate(
                                order.orderDate ||
                                order.createdDate ||
                                order.createdAt
                              )}
                            </td>
                            <td>{order.customer?.fullName || "Khách lẻ"}</td>
                            <td className="fw-semibold">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td>
                              <span
                                className={`badge ${(order.paymentStatus || "")
                                    .toString()
                                    .toLowerCase() === "đã thanh toán"
                                    ? "badge-success"
                                    : (order.paymentStatus || "")
                                      .toString()
                                      .toLowerCase() === "thất bại"
                                      ? "badge-danger"
                                      : "badge-info"
                                  }`}
                              >
                                {order.paymentStatus || "Chưa thanh toán"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            Chưa có đơn hàng nào
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
      </div>
      <CommonFooter />
    </div>
  );
};

export default ShopOwnerDashboard;
