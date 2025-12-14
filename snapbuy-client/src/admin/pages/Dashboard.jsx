import React, { useState, useEffect, useMemo } from "react";
import {
  FaStore,
  FaUsers,
  FaChartLine,
  FaDatabase,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { notification } from "antd";
import Chart from "react-apexcharts";
import StatsCard from "../components/StatsCard";
import TenantService from "../../services/TenantService";
import "../styles/admin.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  const [statsChanges, setStatsChanges] = useState({
    totalStoresChange: 0,
    activeStoresChange: 0,
    totalUsersChange: 0,
    totalRevenueChange: 0,
  });

  const [recentStores, setRecentStores] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await TenantService.getAllTenants();

      if (response.result) {
        const tenants = response.result;

        // Calculate current month stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate previous month
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear =
          currentMonth === 0 ? currentYear - 1 : currentYear;

        // Filter tenants by month
        const currentMonthTenants = tenants.filter((t) => {
          const createdDate = new Date(t.createdAt);
          return (
            createdDate.getMonth() === currentMonth &&
            createdDate.getFullYear() === currentYear
          );
        });

        const lastMonthTenants = tenants.filter((t) => {
          const createdDate = new Date(t.createdAt);
          return (
            createdDate.getMonth() === lastMonth &&
            createdDate.getFullYear() === lastMonthYear
          );
        });

        // Calculate stats for current state
        const totalStores = tenants.length;
        const activeStores = tenants.filter((t) => t.isActive).length;

        // Calculate growth based on new tenants created each month
        const currentMonthNew = currentMonthTenants.length;
        const lastMonthNew = lastMonthTenants.length;

        // Calculate percentage change
        const calculateChange = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const totalStoresChange = calculateChange(
          currentMonthNew,
          lastMonthNew
        );
        const activeStoresChange = calculateChange(
          currentMonthTenants.filter((t) => t.isActive).length,
          lastMonthTenants.filter((t) => t.isActive).length
        );

        setStats({
          totalStores,
          activeStores,
          totalUsers: 0, // TODO: Get from user API
          totalRevenue: 0, // TODO: Get from revenue API
        });

        setStatsChanges({
          totalStoresChange,
          activeStoresChange,
          totalUsersChange: 0, // TODO: Calculate from user API
          totalRevenueChange: 0, // TODO: Calculate from revenue API
        });

        // Sort by created date and get recent stores
        const sortedTenants = [...tenants].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setAllTenants(tenants);
        setRecentStores(sortedTenants.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải dữ liệu dashboard",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Tenant creation trend for last 30 days
  const tenantTrend = useMemo(() => {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last30Days.push({ date: dateStr, newTenants: 0, activeTenants: 0 });
    }

    allTenants.forEach((tenant) => {
      const createdDate = new Date(tenant.createdAt);
      const dateStr = createdDate.toISOString().split("T")[0];
      const dayData = last30Days.find((d) => d.date === dateStr);
      if (dayData) {
        dayData.newTenants += 1;
      }
    });

    // Calculate cumulative active tenants for each day
    let cumulative = 0;
    last30Days.forEach((day) => {
      cumulative += day.newTenants;
      day.activeTenants = cumulative;
    });

    return {
      categories: last30Days.map((d) => {
        const [_y, m, day] = d.date.split("-");
        return `${day}/${m}`;
      }),
      newTenantsData: last30Days.map((d) => d.newTenants),
      activeTenantsData: last30Days.map((d) => d.activeTenants),
    };
  }, [allTenants]);

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cửa hàng này?")) {
      return;
    }

    try {
      await TenantService.deleteTenant(tenantId);
      notification.success({
        message: "Xóa thành công",
        description: "Cửa hàng đã được xóa",
        duration: 2,
      });
      fetchDashboardData(); // Reload data
    } catch (error) {
      notification.error({
        message: "Lỗi xóa cửa hàng",
        description: error.response?.data?.message || "Không thể xóa cửa hàng",
        duration: 3,
      });
    }
  };

  return (
    <div className="admin-page admin-fade-in">
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <StatsCard
          title="Tổng Số Cửa Hàng"
          value={stats.totalStores}
          change={`${
            statsChanges.totalStoresChange > 0 ? "+" : ""
          }${statsChanges.totalStoresChange.toFixed(1)}%`}
          changeType={
            statsChanges.totalStoresChange >= 0 ? "positive" : "negative"
          }
          icon={<FaStore />}
          iconColor="primary"
        />
        <StatsCard
          title="Cửa Hàng Hoạt Động"
          value={stats.activeStores}
          change={`${
            statsChanges.activeStoresChange > 0 ? "+" : ""
          }${statsChanges.activeStoresChange.toFixed(1)}%`}
          changeType={
            statsChanges.activeStoresChange >= 0 ? "positive" : "negative"
          }
          icon={<FaDatabase />}
          iconColor="success"
        />
        <StatsCard
          title="Tổng Người Dùng"
          value={stats.totalUsers.toLocaleString()}
          change={`${
            statsChanges.totalUsersChange > 0 ? "+" : ""
          }${statsChanges.totalUsersChange.toFixed(1)}%`}
          changeType={
            statsChanges.totalUsersChange >= 0 ? "positive" : "negative"
          }
          icon={<FaUsers />}
          iconColor="info"
        />
        <StatsCard
          title="Tổng Doanh Thu"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          change={`${
            statsChanges.totalRevenueChange > 0 ? "+" : ""
          }${statsChanges.totalRevenueChange.toFixed(1)}%`}
          changeType={
            statsChanges.totalRevenueChange >= 0 ? "positive" : "negative"
          }
          icon={<FaChartLine />}
          iconColor="warning"
        />
      </div>

      {/* Recent Stores Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Cửa Hàng Gần Đây</h2>
          <div className="admin-card-actions">
            <button className="admin-btn admin-btn-secondary">
              <FaPlus /> Thêm Cửa Hàng Mới
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Cửa Hàng</th>
                <th>Tên Miền</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : recentStores.length > 0 ? (
                recentStores.map((store, index) => (
                  <tr key={store.tenantId || index}>
                    <td>#{index + 1}</td>
                    <td>
                      <strong>{store.tenantName || store.name}</strong>
                    </td>
                    <td>
                      <code
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--admin-accent-primary)",
                        }}
                      >
                        {store.tenantCode}.snapbuy.com.vn
                      </code>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          store.isActive ? "success" : "danger"
                        }`}
                      >
                        {store.isActive ? "Hoạt Động" : "Ngừng Hoạt Động"}
                      </span>
                    </td>
                    <td>
                      {new Date(store.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    Chưa có cửa hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Growth Trend Chart */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <FaChartLine style={{ marginRight: "0.5rem" }} />
            Xu hướng tăng trưởng cửa hàng (30 ngày gần đây)
          </h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <Chart
            options={{
              chart: {
                type: "line",
                height: 350,
                toolbar: { show: false },
                background: "transparent",
              },
              colors: ["#0E9384", "#E04F16"],
              stroke: {
                curve: "smooth",
                width: 3,
              },
              xaxis: {
                categories: tenantTrend.categories,
                labels: {
                  style: {
                    colors: "#9CA3AF",
                    fontSize: "11px",
                  },
                },
                axisBorder: {
                  color: "#374151",
                },
                axisTicks: {
                  color: "#374151",
                },
              },
              yaxis: [
                {
                  title: {
                    text: "Cửa hàng mới",
                    style: { color: "#9CA3AF" },
                  },
                  labels: {
                    style: { colors: "#9CA3AF", fontSize: "12px" },
                  },
                },
                {
                  opposite: true,
                  title: {
                    text: "Tổng cửa hàng",
                    style: { color: "#9CA3AF" },
                  },
                  labels: {
                    style: { colors: "#9CA3AF", fontSize: "12px" },
                  },
                },
              ],
              grid: {
                borderColor: "#374151",
                strokeDashArray: 5,
              },
              dataLabels: { enabled: false },
              tooltip: {
                theme: "dark",
                shared: true,
                intersect: false,
              },
              legend: {
                position: "top",
                horizontalAlign: "right",
                labels: {
                  colors: "#9CA3AF",
                },
              },
            }}
            series={[
              {
                name: "Cửa hàng mới tạo",
                data: tenantTrend.newTenantsData,
                type: "column",
              },
              {
                name: "Tổng cửa hàng",
                data: tenantTrend.activeTenantsData,
                type: "line",
              },
            ]}
            type="line"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
