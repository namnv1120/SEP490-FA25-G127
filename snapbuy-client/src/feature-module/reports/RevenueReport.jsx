import { useState } from "react";
import { message, DatePicker, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Chart from "react-apexcharts";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import {
  getDailyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getCustomRevenue,
} from "../../services/RevenueService";
import CommonFooter from "../../components/footer/CommonFooter";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

const RevenueReport = () => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [detailedData, setDetailedData] = useState([]);
  const [periodType, setPeriodType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      let data = null;
      let detailed = [];

      switch (periodType) {
        case "daily":
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const day = String(selectedDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          data = await getDailyRevenue(dateStr);
          break;
        case "monthly":
          data = await getMonthlyRevenue(selectedYear, selectedMonth);

          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const dailyPromises = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const dayStr = String(date.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${dayStr}`;
            dailyPromises.push(
              getDailyRevenue(dateStr).catch(() => ({
                totalRevenue: 0,
                orderCount: 0,
                startDate: date.toISOString(),
              }))
            );
          }
          const dailyResults = await Promise.all(dailyPromises);
          detailed = dailyResults.map((result, index) => ({
            date: new Date(selectedYear, selectedMonth - 1, index + 1),
            revenue: result.totalRevenue || 0,
            orderCount: result.orderCount || 0,
            label: `${index + 1}`,
          }));
          break;
        case "yearly":
          data = await getYearlyRevenue(selectedYear);

          const monthlyPromises = [];
          for (let month = 1; month <= 12; month++) {
            monthlyPromises.push(
              getMonthlyRevenue(selectedYear, month).catch(() => ({
                totalRevenue: 0,
                orderCount: 0,
              }))
            );
          }
          const monthlyResults = await Promise.all(monthlyPromises);
          const monthNames = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ];
          detailed = monthlyResults.map((result, index) => ({
            month: index + 1,
            revenue: result.totalRevenue || 0,
            orderCount: result.orderCount || 0,
            label: monthNames[index],
          }));
          break;
        case "custom":
          if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.warning("Vui lòng chọn khoảng thời gian");
            setLoading(false);
            return;
          }
          const startStr = dateRange[0].format("YYYY-MM-DD");
          const endStr = dateRange[1].format("YYYY-MM-DD");
          data = await getCustomRevenue(startStr, endStr);

          const startDate = dateRange[0].toDate();
          const endDate = dateRange[1].toDate();
          const customDailyPromises = [];
          const currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;
            customDailyPromises.push(
              getDailyRevenue(dateStr).catch(() => ({
                totalRevenue: 0,
                orderCount: 0,
                startDate: currentDate.toISOString(),
              }))
            );
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const customDailyResults = await Promise.all(customDailyPromises);
          detailed = customDailyResults.map((result, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);
            return {
              date: date,
              revenue: result.totalRevenue || 0,
              orderCount: result.orderCount || 0,
              label: date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              }),
            };
          });
          break;
        default:
          break;
      }

      setRevenueData(data);
      setDetailedData(detailed);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu doanh thu:", error);
      message.error(
        error.response?.data?.message ||
        "Lỗi khi tải dữ liệu doanh thu. Vui lòng thử lại."
      );
      setRevenueData(null);
      setDetailedData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case "daily":
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();
        return `Ngày ${day}/${month}/${year}`;
      case "monthly":
        return `Tháng ${selectedMonth}/${selectedYear}`;
      case "yearly":
        return `Năm ${selectedYear}`;
      case "custom":
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
          return "Chưa chọn khoảng thời gian";
        }
        return `Từ ${dateRange[0].format("DD/MM/YYYY")} đến ${dateRange[1].format("DD/MM/YYYY")}`;
      default:

        return "";
    }
  };

  const getChartData = () => {
    if (!revenueData) return null;

    if (detailedData.length > 0) {
      const categories = detailedData.map((item) => item.label);
      const revenueData = detailedData.map((item) => item.revenue);
      const orderCountData = detailedData.map((item) => item.orderCount);

      return {
        series: [
          {
            name: "Doanh thu",
            type: "column",
            data: revenueData,
          },
          {
            name: "Số đơn hàng",
            type: "line",
            data: orderCountData,
          },
        ],
        options: {
          chart: {
            type: "line",
            height: 350,
            toolbar: {
              show: true,
              tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
              },
            },
          },
          stroke: {
            width: [0, 4],
            curve: "smooth",
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "60%",
              borderRadius: 8,
            },
          },
          dataLabels: {
            enabled: true,
            enabledOnSeries: [0],
            formatter: (val) => {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(val);
            },
            offsetY: -20,
            style: {
              fontSize: "11px",
              colors: ["#304758"],
            },
          },
          labels: {
            formatter: (val, opts) => {
              if (opts.seriesIndex === 1) {
                return val;
              }
              return "";
            },
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                colors: "#6B7280",
                fontSize: "12px",
              },
              rotate: periodType === "monthly" || periodType === "custom" ? -45 : 0,
              rotateAlways: periodType === "monthly" || periodType === "custom",
            },
          },
          yaxis: [
            {
              labels: {
                formatter: (val) => {
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(val);
                },
                style: {
                  colors: "#6B7280",
                  fontSize: "13px",
                },
              },
            },
            {
              opposite: true,
              labels: {
                formatter: (val) => {
                  return Math.round(val).toString();
                },
                style: {
                  colors: "#6B7280",
                  fontSize: "13px",
                },
              },
            },
          ],
          colors: ["#0E9384", "#FE9F43"],
          grid: {
            borderColor: "#E5E7EB",
            strokeDashArray: 5,
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: (val, { seriesIndex }) => {
                if (seriesIndex === 0) {
                  return new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(val);
                } else {
                  return `${val} đơn`;
                }
              },
            },
          },
          title: {
            text:
              periodType === "monthly"
                ? "Biểu đồ doanh thu và số đơn hàng theo ngày trong tháng"
                : periodType === "yearly"
                  ? "Biểu đồ doanh thu và số đơn hàng theo tháng trong năm"
                  : "Biểu đồ doanh thu và số đơn hàng theo ngày",
            align: "center",
            style: {
              fontSize: "16px",
              fontWeight: 600,
              color: "#1F2937",
            },
          },
          subtitle: {
            text: getPeriodLabel(),
            align: "center",
            style: {
              fontSize: "12px",
              color: "#6B7280",
            },
          },
          legend: {
            show: true,
            position: "top",
            horizontalAlign: "center",
          },
        },
      };
    }

    const averageRevenuePerOrder =
      revenueData.orderCount > 0
        ? revenueData.totalRevenue / revenueData.orderCount
        : 0;

    return {
      series: [
        {
          name: "Doanh thu",
          data: [
            revenueData.totalRevenue || 0,
            averageRevenuePerOrder,
          ],
        },
      ],
      options: {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%",
            borderRadius: 8,
            dataLabels: {
              position: "top",
            },
            distributed: true,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(val);
          },
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#304758"],
          },
        },
        xaxis: {
          categories: ["Tổng doanh thu", "Trung bình mỗi đơn"],
          labels: {
            style: {
              colors: "#6B7280",
              fontSize: "13px",
            },
          },
        },
        yaxis: {
          labels: {
            formatter: (val) => {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(val);
            },
            style: {
              colors: "#6B7280",
              fontSize: "13px",
            },
          },
        },
        colors: ["#0E9384", "#FE9F43"],
        grid: {
          borderColor: "#E5E7EB",
          strokeDashArray: 5,
        },
        tooltip: {
          y: {
            formatter: (val) => {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(val);
            },
          },
        },
        title: {
          text: "Biểu đồ doanh thu và giá trị trung bình mỗi đơn",
          align: "center",
          style: {
            fontSize: "16px",
            fontWeight: 600,
            color: "#1F2937",
          },
        },
        subtitle: {
          text: getPeriodLabel(),
          align: "center",
          style: {
            fontSize: "12px",
            color: "#6B7280",
          },
        },
        legend: {
          show: false,
        },
      },
    };
  };

  return (
    <ConfigProvider locale={viVN}>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Báo cáo doanh thu</h4>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Chọn loại báo cáo</label>
                    <select
                      className="form-select"
                      value={periodType}
                      onChange={(e) => {
                        setPeriodType(e.target.value);
                        setRevenueData(null);
                        setDetailedData([]);
                      }}
                    >
                      <option value="daily">Theo ngày</option>
                      <option value="monthly">Theo tháng</option>
                      <option value="yearly">Theo năm</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                {periodType === "daily" && (
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Chọn ngày</label>
                      <CommonDatePicker
                        value={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          setRevenueData(null);
                          setDetailedData([]);
                        }}
                        dateFormat="dd/mm/yyyy"
                      />
                    </div>
                  </div>
                )}

                {periodType === "monthly" && (
                  <>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>Chọn tháng</label>
                        <select
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(parseInt(e.target.value));
                            setRevenueData(null);
                            setDetailedData([]);
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <option key={month} value={month}>
                                Tháng {month}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>Chọn năm</label>
                        <select
                          className="form-select"
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(parseInt(e.target.value));
                            setRevenueData(null);
                            setDetailedData([]);
                          }}
                        >
                          {Array.from(
                            { length: 10 },
                            (_, i) => new Date().getFullYear() - 5 + i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {periodType === "yearly" && (
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Chọn năm</label>
                      <select
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(parseInt(e.target.value));
                          setRevenueData(null);
                        }}
                      >
                        {Array.from(
                          { length: 10 },
                          (_, i) => new Date().getFullYear() - 5 + i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {periodType === "custom" && (
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Chọn khoảng thời gian</label>
                      <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                          setDateRange(dates);
                          setRevenueData(null);
                          setDetailedData([]);
                        }}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        placeholder={["Từ ngày", "Đến ngày"]}
                      />
                    </div>
                  </div>
                )}

                <div className="col-lg-12 mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={fetchRevenueData}
                    disabled={loading}
                  >
                    {loading ? "Đang tải..." : "Tải dữ liệu"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            </div>
          )}

          {!loading && revenueData && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">
                      Báo cáo doanh thu - {getPeriodLabel()}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-4 col-md-6">
                        <div className="card bg-primary text-white">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white mb-2">
                                  Tổng doanh thu
                                </h6>
                                <h3 className="text-white mb-0">
                                  {formatCurrency(revenueData.totalRevenue)}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-primary rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-currency-dollar fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6">
                        <div className="card bg-success text-white">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white mb-2">
                                  Số lượng đơn hàng
                                </h6>
                                <h3 className="text-white mb-0">
                                  {revenueData.orderCount || 0}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-success rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-shopping-cart fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6">
                        <div className="card bg-info text-white">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white mb-2">
                                  Trung bình mỗi đơn
                                </h6>
                                <h3 className="text-white mb-0">
                                  {revenueData.orderCount > 0
                                    ? formatCurrency(
                                      revenueData.totalRevenue /
                                      revenueData.orderCount
                                    )
                                    : "0 đ"}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-info rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-chart-line fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {getChartData() && (
                      <div className="row mt-4">
                        <div className="col-lg-12">
                          <div className="card">
                            <div className="card-body">
                              <Chart
                                options={getChartData().options}
                                series={getChartData().series}
                                type={detailedData.length > 0 ? "line" : "bar"}
                                height={350}
                              />
                              <div className="mt-3">
                                {detailedData.length > 0 ? (
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: "#0E9384",
                                            borderRadius: "4px",
                                          }}
                                        ></div>
                                        <span className="text-muted">
                                          <strong>Doanh thu:</strong>{" "}
                                          {periodType === "monthly"
                                            ? "Doanh thu từng ngày trong tháng (cột)"
                                            : periodType === "yearly"
                                              ? "Doanh thu từng tháng trong năm (cột)"
                                              : "Doanh thu từng ngày trong khoảng thời gian (cột)"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: "#FE9F43",
                                            borderRadius: "4px",
                                          }}
                                        ></div>
                                        <span className="text-muted">
                                          <strong>Số đơn hàng:</strong>{" "}
                                          {periodType === "monthly"
                                            ? "Số đơn hàng từng ngày trong tháng (đường)"
                                            : periodType === "yearly"
                                              ? "Số đơn hàng từng tháng trong năm (đường)"
                                              : "Số đơn hàng từng ngày trong khoảng thời gian (đường)"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: "#0E9384",
                                            borderRadius: "4px",
                                          }}
                                        ></div>
                                        <span className="text-muted">
                                          <strong>Tổng doanh thu:</strong> Tổng
                                          số tiền thu được từ tất cả các đơn hàng
                                          trong khoảng thời gian đã chọn
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="me-2"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            backgroundColor: "#FE9F43",
                                            borderRadius: "4px",
                                          }}
                                        ></div>
                                        <span className="text-muted">
                                          <strong>Trung bình mỗi đơn:</strong> Giá
                                          trị trung bình của mỗi đơn hàng (Tổng
                                          doanh thu / Số lượng đơn hàng)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row mt-4">
                      <div className="col-lg-12">
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Thông tin</th>
                                <th>Giá trị</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <strong>Kỳ báo cáo</strong>
                                </td>
                                <td>{revenueData.period || "N/A"}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Ngày bắt đầu</strong>
                                </td>
                                <td>
                                  {revenueData.startDate
                                    ? formatDate(revenueData.startDate)
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Ngày kết thúc</strong>
                                </td>
                                <td>
                                  {revenueData.endDate
                                    ? formatDate(revenueData.endDate)
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Tổng doanh thu</strong>
                                </td>
                                <td>
                                  <strong className="text-primary">
                                    {formatCurrency(revenueData.totalRevenue)}
                                  </strong>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Số lượng đơn hàng</strong>
                                </td>
                                <td>
                                  <strong className="text-success">
                                    {revenueData.orderCount || 0} đơn
                                  </strong>
                                </td>
                              </tr>
                              {revenueData.orderCount > 0 && (
                                <tr>
                                  <td>
                                    <strong>Doanh thu trung bình/đơn</strong>
                                  </td>
                                  <td>
                                    <strong className="text-info">
                                      {formatCurrency(
                                        revenueData.totalRevenue /
                                        revenueData.orderCount
                                      )}
                                    </strong>
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
            </div>
          )}

          {!loading && !revenueData && (
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted">
                  Không có dữ liệu doanh thu cho khoảng thời gian đã chọn.
                </p>
              </div>
            </div>
          )}
        </div>
        <CommonFooter />
      </div>
    </ConfigProvider>
  );
};

export default RevenueReport;

