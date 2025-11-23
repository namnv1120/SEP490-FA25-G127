import { useEffect, useState, useCallback } from "react";
import { message, Spin } from "antd";
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
import { getMyInfo } from "../../services/AccountService";
import {
  getAllOrders,
  getMyTodayOrderCount,
} from "../../services/OrderService";
import { getCurrentShift } from "../../services/ShiftService";

const SalesDashboard = () => {
  const [user, setUser] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [shift, setShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [myTodayCount, setMyTodayCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [orders7Days, setOrders7Days] = useState({
    series: [],
    categories: [],
  });
  const [ordersByHourToday, setOrdersByHourToday] = useState(Array(24).fill(0));

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

  const fetchOrdersToday = useCallback(
    async (accountIdLocal = null) => {
      try {
        setLoadingOrders(true);
        const today = new Date();
        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        const res = await getAllOrders({
          from: formatDate(start),
          to: formatDate(end),
        });
        const data = res.result || res || [];
        const myId = accountIdLocal || user?.id || null;
        const filtered = data.filter((o) => {
          const uid = o.accountId || (o.account && o.account.accountId) || null;
          const paid =
            (o.paymentStatus || "").toString().toLowerCase() ===
            "đã thanh toán";
          return uid && myId && String(uid) === String(myId) && paid;
        });

        setMyTodayCount(filtered.length);
        const revenue = filtered.reduce(
          (sum, o) => sum + Number(o.totalAmount || 0),
          0
        );
        setTodayRevenue(revenue);
        const byHour = Array(24).fill(0);
        filtered.forEach((o) => {
          const dt = new Date(
            o.orderDate || o.createdDate || o.createdAt || Date.now()
          );
          const h = dt.getHours();
          byHour[h] += 1;
        });
        setOrdersByHourToday(byHour);
        const pm = { CASH: 0, MOMO: 0, OTHER: 0 };
        filtered.forEach((o) => {
          const method = (
            o.payment?.paymentMethod ||
            o.paymentMethod ||
            "OTHER"
          )
            .toString()
            .toUpperCase();
          if (method.includes("MOMO")) pm.MOMO += 1;
          else if (method.includes("CASH") || method.includes("TIỀN MẶT"))
            pm.CASH += 1;
          else pm.OTHER += 1;
        });
      } catch {
        void 0;
      } finally {
        setLoadingOrders(false);
      }
    },
    [user?.id]
  );

  const fetchOrdersLast7Days = useCallback(
    async (accountIdLocal = null) => {
      try {
        const today = new Date();
        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 6
        );
        const end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        const res = await getAllOrders({
          from: formatDate(start),
          to: formatDate(end),
        });
        const data = res.result || res || [];
        const myId = accountIdLocal || user?.id || null;
        const filtered = data.filter((o) => {
          const uid = o.accountId || (o.account && o.account.accountId) || null;
          return uid && myId && String(uid) === String(myId);
        });
        const counts = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - (6 - i)
          );
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
          counts[key] = 0;
        }
        filtered.forEach((o) => {
          const dt = new Date(
            o.orderDate || o.createdDate || o.createdAt || Date.now()
          );
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(dt.getDate()).padStart(2, "0")}`;
          if (counts[key] !== undefined) counts[key] += 1;
        });
        const series = Object.values(counts);
        const categories = Object.keys(counts).map((k) => {
          const [, mm, dd] = k.split("-");
          return `${dd}/${mm}`;
        });
        setOrders7Days({ series, categories });
      } catch {
        void 0;
      }
    },
    [user?.id]
  );

  useEffect(() => {
    const init = async () => {
      let accountIdLocal = null;
      try {
        const info = await getMyInfo();
        const u = info.result || info;
        accountIdLocal = u?.id || null;
        setUser(u);
      } catch {
        message.error("Không lấy được thông tin nhân viên");
      }
      try {
        setShiftLoading(true);
        const s = await getCurrentShift();
        setShift(s);
      } finally {
        setShiftLoading(false);
      }
      try {
        const count = await getMyTodayOrderCount("Đã thanh toán");
        setMyTodayCount(Number(count || 0));
      } catch {
        void 0;
      }
      await fetchOrdersToday(accountIdLocal);
      await fetchOrdersLast7Days(accountIdLocal);
    };
    init();
  }, [fetchOrdersToday, fetchOrdersLast7Days]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex justify-content-between align-items-center">
            <div className="page-title">
              <div className="mb-3">
                <h1 className="mb-1">
                  Chào mừng, {user?.fullName || "Nhân viên"}
                </h1>
                <p className="fw-medium">
                  Bạn đã bán{" "}
                  <span className="text-primary fw-bold">{myTodayCount}</span>{" "}
                  đơn hàng hôm nay
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6 col-lg-6">
            {!user ? (
              <div className="text-center py-4">
                <Spin size="large" />
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">
                            Tổng doanh thu hôm nay
                          </h6>
                          <h3 className="text-white mb-0">
                            {loadingOrders ? (
                              <Spin />
                            ) : (
                              formatCurrency(todayRevenue)
                            )}
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
                <div className="col-md-6">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">
                            Số lượng đơn hôm nay
                          </h6>
                          <h3 className="text-white mb-0">
                            {loadingOrders ? <Spin /> : myTodayCount}
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
                              className="ti ti-shopping-cart fs-2"
                              style={{ fontSize: "2rem", lineHeight: "1" }}
                            ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-xl-6 col-lg-6">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-inline-flex align-items-center">
                  <span className="title-icon bg-soft-teal fs-16 me-2">
                    <i className="ti ti-clock" />
                  </span>
                  <h5 className="card-title mb-0">Trạng thái ca</h5>
                </div>
              </div>
              <div className="card-body">
                {shiftLoading ? (
                  <div className="text-center py-4">
                    <Spin size="large" />
                  </div>
                ) : shift && shift.status === "Mở" ? (
                  <div className="row g-3">
                    <div className="col-12">
                      <span className="badge badge-success">Đang mở</span>
                    </div>
                    <div className="col-12">
                      Bắt đầu:{" "}
                      {shift.openedAt
                        ? new Date(shift.openedAt).toLocaleString("vi-VN")
                        : ""}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="badge badge-secondary">Đang đóng</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-xl-6 col-lg-6">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div className="d-inline-flex align-items-center">
                  <span className="title-icon bg-soft-teal fs-16 me-2">
                    <i className="ti ti-chart-bar" />
                  </span>
                  <h5 className="card-title mb-0">Đơn theo giờ (hôm nay)</h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={{
                    chart: {
                      type: "line",
                      height: 240,
                      toolbar: { show: false },
                    },
                    xaxis: {
                      categories: Array.from(
                        { length: 24 },
                        (_, i) => `${i}:00`
                      ),
                    },
                    stroke: { curve: "smooth" },
                    grid: { borderColor: "#E5E7EB", strokeDashArray: 5 },
                    colors: ["#0E9384"],
                    dataLabels: { enabled: false },
                  }}
                  series={[{ name: "Đơn hàng", data: ordersByHourToday }]}
                  type="line"
                  height={240}
                />
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div className="d-inline-flex align-items-center">
                  <span className="title-icon bg-soft-teal fs-16 me-2">
                    <i className="ti ti-calendar-stats" />
                  </span>
                  <h5 className="card-title mb-0">Đơn 7 ngày gần đây</h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={{
                    chart: {
                      type: "bar",
                      height: 240,
                      toolbar: { show: false },
                    },
                    xaxis: { categories: orders7Days.categories || [] },
                    grid: { borderColor: "#E5E7EB", strokeDashArray: 5 },
                    colors: ["#E04F16"],
                    dataLabels: { enabled: false },
                    plotOptions: { bar: { borderRadius: 6 } },
                  }}
                  series={[
                    { name: "Đơn hàng", data: orders7Days.series || [] },
                  ]}
                  type="bar"
                  height={240}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
