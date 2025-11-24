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
import { getAllOrders } from "../../services/OrderService";
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

const SalesOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ fullName: "" });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersData, userInfoData] = await Promise.all([
          getAllOrders().catch(() => []),
          getMyInfo().catch(() => ({ fullName: "" })),
        ]);

        setOrders(Array.isArray(ordersData) ? ordersData : []);

        const userData = userInfoData.result || userInfoData;
        setUserInfo({ fullName: userData.fullName || "" });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Calculate time-based revenue
  const timeBasedStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidOrders = orders.filter(
      (o) =>
        (o.paymentStatus || "").toString().toLowerCase() === "đã thanh toán"
    );

    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    let todayOrders = 0;

    paidOrders.forEach((order) => {
      const orderDate = new Date(
        order.orderDate || order.createdDate || order.createdAt
      );
      const amount = Number(order.totalAmount || 0);

      if (orderDate >= todayStart) {
        todayRevenue += amount;
        todayOrders++;
      }
      if (orderDate >= weekStart) {
        weekRevenue += amount;
      }
      if (orderDate >= monthStart) {
        monthRevenue += amount;
      }
    });
    const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

    return {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      avgOrderValue,
      todayOrders,
    };
  }, [orders]);

  // Daily sales for last 7 days
  const last7DaysSales = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({ date: dateStr, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const orderDate = new Date(
        order.orderDate || order.createdDate || order.createdAt
      );
      const dateStr = orderDate.toISOString().split("T")[0];
      const dayData = days.find((d) => d.date === dateStr);

      if (dayData) {
        dayData.revenue += Number(order.totalAmount || 0);
        dayData.orders++;
      }
    });

    return {
      categories: days.map((d) => {
        const [_y, m, day] = d.date.split("-");
        return `${day}/${m}`;
      }),
      revenue: days.map((d) => d.revenue),
      orderCount: days.map((d) => d.orders),
    };
  }, [orders]);

  // Hourly sales pattern for today
  const hourlySales = useMemo(() => {
    const hourlyData = Array(24).fill(0);
    const today = new Date().toISOString().split("T")[0];

    orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const orderDate = new Date(
        order.orderDate || order.createdDate || order.createdAt
      );
      const orderDateStr = orderDate.toISOString().split("T")[0];

      if (orderDateStr === today) {
        const hour = orderDate.getHours();
        hourlyData[hour] += Number(order.totalAmount || 0);
      }
    });

    return {
      categories: Array.from({ length: 24 }, (_, i) => `${i}h`),
      data: hourlyData,
    };
  }, [orders]);

  // Current month vs previous month
  const monthComparison = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let currentMonthRevenue = 0;
    let prevMonthRevenue = 0;

    orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const orderDate = new Date(
        order.orderDate || order.createdDate || order.createdAt
      );
      const amount = Number(order.totalAmount || 0);

      if (orderDate >= currentMonthStart) {
        currentMonthRevenue += amount;
      } else if (orderDate >= prevMonthStart && orderDate <= prevMonthEnd) {
        prevMonthRevenue += amount;
      }
    });

    const percentChange =
      prevMonthRevenue > 0
        ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        : 0;

    return {
      current: currentMonthRevenue,
      previous: prevMonthRevenue,
      percentChange,
    };
  }, [orders]);

  // Chart configurations
  const dailySalesChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#0E9384", "#E04F16"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: last7DaysSales.categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: [
      {
        title: { text: "Doanh thu" },
        labels: {
          formatter: (val) => formatCurrency(val),
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
      {
        opposite: true,
        title: { text: "Số đơn hàng" },
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
    legend: {
      position: "top",
    },
  };

  const hourlyChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#E04F16"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "70%",
      },
    },
    xaxis: {
      categories: hourlySales.categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "11px" },
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
  };

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryMap = {};
    const categoryDetails = {};

    orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      // Thử nhiều cách lấy orderDetails
      const orderDetails = order.orderDetails || order.OrderDetails || order.items || [];

      orderDetails.forEach((detail) => {
        // Thử nhiều cách lấy thông tin category
        let categoryName = "Khác";

        if (detail.product?.category?.name) {
          categoryName = detail.product.category.name;
        } else if (detail.category?.name) {
          categoryName = detail.category.name;
        } else if (detail.categoryName) {
          categoryName = detail.categoryName;
        } else if (detail.productCategory) {
          categoryName = detail.productCategory;
        }

        // Thử nhiều cách lấy giá
        const amount = Number(
          detail.totalPrice ||
          detail.total ||
          detail.amount ||
          (detail.price || 0) * (detail.quantity || 1) ||
          0
        );

        const quantity = Number(detail.quantity || 0);

        if (amount > 0) {
          if (!categoryDetails[categoryName]) {
            categoryDetails[categoryName] = {
              revenue: 0,
              quantity: 0,
              orders: new Set(),
            };
          }
          categoryDetails[categoryName].revenue += amount;
          categoryDetails[categoryName].quantity += quantity;
          categoryDetails[categoryName].orders.add(order.id || order.orderId);
          categoryMap[categoryName] = (categoryMap[categoryName] || 0) + amount;
        }
      });
    });

    // Chuyển đổi sang mảng và sắp xếp
    const sortedCategories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a);

    const totalRevenue = sortedCategories.reduce((sum, [, value]) => sum + value, 0);

    const categoriesWithDetails = sortedCategories.map(([name, revenue]) => ({
      name,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      quantity: categoryDetails[name]?.quantity || 0,
      orderCount: categoryDetails[name]?.orders.size || 0,
    }));

    return {
      labels: sortedCategories.map(([name]) => name),
      data: sortedCategories.map(([, value]) => value),
      details: categoriesWithDetails,
      total: totalRevenue,
    };
  }, [orders]);

  // Hiển thị top 10 trong biểu đồ để dễ đọc
  const topCategoriesChart = useMemo(() => {
    const top10 = salesByCategory.details.slice(0, 10);
    return {
      labels: top10.map((cat) => cat.name),
      data: top10.map((cat) => cat.revenue),
    };
  }, [salesByCategory]);

  const categoryChartOptions = {
    chart: {
      type: "bar",
      height: 400,
      toolbar: { show: false },
    },
    colors: ["#0E9384"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: "70%",
        dataLabels: {
          position: "right",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCurrency(val),
      style: {
        fontSize: "11px",
        colors: ["#fff"],
      },
      offsetX: -5,
    },
    xaxis: {
      categories: topCategoriesChart.labels,
      labels: {
        formatter: (val) => formatCurrency(val),
        style: {
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
  };

  const comparisonChartOptions = {
    chart: {
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    colors: ["#0E9384"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
      },
    },
    xaxis: {
      categories: ["Tháng trước", "Tháng này"],
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(val),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCurrency(val),
    },
    grid: {
      show: false,
    },
  };

  // Top customers
  const topCustomers = useMemo(() => {
    const customerMap = {};

    orders.forEach((order) => {
      if (
        (order.paymentStatus || "").toString().toLowerCase() !== "đã thanh toán"
      )
        return;

      const customerId = order.customerId || order.customer?.id;
      const customerName =
        order.customerName || order.customer?.fullName || "Khách hàng";
      const amount = Number(order.totalAmount || 0);
      const orderDate = new Date(
        order.orderDate || order.createdDate || order.createdAt
      );

      // Bỏ qua khách lẻ (khách hàng có tên chứa "khách lẻ", "khach le", hoặc tài khoản mặc định)
      if (
        customerName.toLowerCase().includes("khách lẻ") ||
        customerName.toLowerCase().includes("khach le") ||
        customerName.toLowerCase() === "khách hàng"
      ) {
        return;
      }

      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          name: customerName,
          totalSpent: 0,
          orderCount: 0,
          lastPurchase: orderDate,
        };
      }

      customerMap[customerId].totalSpent += amount;
      customerMap[customerId].orderCount++;

      if (orderDate > customerMap[customerId].lastPurchase) {
        customerMap[customerId].lastPurchase = orderDate;
      }
    });

    return Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [orders]);

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
                Phân tích chi tiết doanh số và xu hướng bán hàng
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
                    <h6 className="text-white mb-2">Doanh thu hôm nay</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(timeBasedStats.todayRevenue)}
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
                        className="ti ti-calendar-event fs-2"
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
                    <h6 className="text-white mb-2">Doanh thu tuần này</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(timeBasedStats.weekRevenue)}
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
                      {formatCurrency(timeBasedStats.monthRevenue)}
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
                        className="ti ti-calendar-stats fs-2"
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
                    <h6 className="text-white mb-2">Giá trị đơn trung bình</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(timeBasedStats.avgOrderValue)}
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
                        className="ti ti-receipt fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Month Comparison Alert */}
        <div
          className={`alert ${monthComparison.percentChange >= 0
            ? "alert-success"
            : "alert-warning"
            } alert-dismissible fade show mb-4`}
        >
          <div>
            <i
              className={`ti ${monthComparison.percentChange >= 0
                ? "ti-trending-up"
                : "ti-trending-down"
                } me-2`}
            />
            <span className="fw-semibold">So sánh tháng:</span> Doanh thu tháng
            này{" "}
            <span className="fw-bold">
              {monthComparison.percentChange >= 0 ? "tăng" : "giảm"}{" "}
              {Math.abs(monthComparison.percentChange).toFixed(1)}%
            </span>{" "}
            so với tháng trước ({formatCurrency(monthComparison.previous)} →{" "}
            {formatCurrency(monthComparison.current)})
          </div>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="row">
          {/* Daily Sales Trend */}
          <div className="col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-primary fs-16 me-2">
                    <i className="ti ti-chart-area-line" />
                  </span>
                  <h5 className="card-title mb-0">
                    Xu hướng bán hàng (7 ngày gần đây)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={dailySalesChartOptions}
                  series={[
                    { name: "Doanh thu", data: last7DaysSales.revenue },
                    { name: "Số đơn hàng", data: last7DaysSales.orderCount },
                  ]}
                  type="line"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Category - New Design */}
        <div className="row">
          <div className="col-xl-7 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-teal fs-16 me-2">
                      <i className="ti ti-category" />
                    </span>
                    <h5 className="card-title mb-0">
                      Doanh thu theo danh mục (Top 10)
                    </h5>
                  </div>
                  <span className="badge badge-soft-primary fs-13">
                    {salesByCategory.details.length} danh mục
                  </span>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={categoryChartOptions}
                  series={[{ name: "Doanh thu", data: topCategoriesChart.data }]}
                  type="bar"
                  height={400}
                />
              </div>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="col-xl-5 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-success fs-16 me-2">
                    <i className="ti ti-list-details" />
                  </span>
                  <h5 className="card-title mb-0">Thống kê chi tiết</h5>
                </div>
              </div>
              <div className="card-body">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-hover table-sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>#</th>
                        <th>Danh mục</th>
                        <th className="text-end">Doanh thu</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByCategory.details.length > 0 ? (
                        salesByCategory.details.map((category, index) => (
                          <tr key={index}>
                            <td>
                              <span
                                className={`badge ${index < 3
                                  ? "badge-soft-success"
                                  : "badge-soft-secondary"
                                  }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{category.name}</div>
                                <small className="text-muted">
                                  {category.quantity} sản phẩm •{" "}
                                  {category.orderCount} đơn
                                </small>
                              </div>
                            </td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(category.revenue)}
                            </td>
                            <td className="text-end">
                              <span className="badge badge-soft-primary">
                                {category.percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">
                            Chưa có dữ liệu danh mục
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

        {/* Charts Row 2 */}
        <div className="row">
          {/* Hourly Sales Pattern */}
          <div className="col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-secondary fs-16 me-2">
                    <i className="ti ti-clock-hour-4" />
                  </span>
                  <h5 className="card-title mb-0">
                    Phân bố doanh thu theo giờ (Hôm nay)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={hourlyChartOptions}
                  series={[{ name: "Doanh thu", data: hourlySales.data }]}
                  type="bar"
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="row">
          {/* Month Comparison */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-warning fs-16 me-2">
                    <i className="ti ti-arrows-diff" />
                  </span>
                  <h5 className="card-title mb-0">So sánh theo tháng</h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={comparisonChartOptions}
                  series={[
                    {
                      name: "Doanh thu",
                      data: [monthComparison.previous, monthComparison.current],
                    },
                  ]}
                  type="bar"
                  height={200}
                />
                <div className="text-center mt-3">
                  <span
                    className={`badge ${monthComparison.percentChange >= 0
                      ? "badge-success"
                      : "badge-danger"
                      } fs-14`}
                  >
                    <i
                      className={`ti ${monthComparison.percentChange >= 0
                        ? "ti-arrow-up"
                        : "ti-arrow-down"
                        }`}
                    />{" "}
                    {Math.abs(monthComparison.percentChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="col-xl-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-info fs-16 me-2">
                      <i className="ti ti-star" />
                    </span>
                    <h5 className="card-title mb-0">Khách hàng VIP (Top 5)</h5>
                  </div>
                  <Link
                    to="/customers"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th className="text-end">Đơn hàng</th>
                        <th className="text-end">Tổng chi</th>
                        <th className="text-end">Lần cuối</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.length > 0 ? (
                        topCustomers.map((customer, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="badge badge-soft-primary me-2">
                                  {index + 1}
                                </span>
                                {customer.name}
                              </div>
                            </td>
                            <td className="text-end">{customer.orderCount}</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(customer.totalSpent)}
                            </td>
                            <td className="text-end text-muted">
                              {formatDate(customer.lastPurchase)}
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
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default SalesOwnerDashboard;
