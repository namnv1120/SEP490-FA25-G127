import { useState, useEffect, useCallback } from "react";
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
  getProductRevenue,
} from "../../services/RevenueService";
import { getAccountsByRoleName } from "../../services/AccountService";
import ExcelJS from "exceljs";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

const RevenueReport = () => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [detailedData, setDetailedData] = useState([]);
  const [productRevenueData, setProductRevenueData] = useState([]);
  const [periodType, setPeriodType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [salesAccounts, setSalesAccounts] = useState([]);
  const [savedStartDateTime, setSavedStartDateTime] = useState(null);
  const [savedEndDateTime, setSavedEndDateTime] = useState(null);

  useEffect(() => {
    const loadSalesAccounts = async () => {
      try {
        const accounts = await getAccountsByRoleName("Nhân viên bán hàng");
        setSalesAccounts(accounts || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên bán hàng:", error);
      }
    };
    loadSalesAccounts();
  }, []);

  const fetchProductRevenueData = useCallback(
    async (startDateTime, endDateTime, accountId) => {
      try {
        const fromDateStr = startDateTime.toISOString();
        const toDateStr = endDateTime.toISOString();
        const productRevenue = await getProductRevenue(
          fromDateStr,
          toDateStr,
          accountId
        );
        setProductRevenueData(productRevenue || []);
      } catch (productError) {
        console.error("Lỗi khi tải dữ liệu doanh thu sản phẩm:", productError);
        console.error(
          "Error details:",
          productError.response?.data || productError.message
        );
        message.error(
          productError.response?.data?.message ||
          "Lỗi khi tải dữ liệu doanh thu sản phẩm. Vui lòng thử lại."
        );
        setProductRevenueData([]);
      }
    },
    []
  );

  // Auto fetch product revenue when account filter changes (if data already loaded)
  useEffect(() => {
    if (savedStartDateTime && savedEndDateTime && revenueData) {
      fetchProductRevenueData(
        savedStartDateTime,
        savedEndDateTime,
        selectedAccountId
      );
    }
  }, [
    selectedAccountId,
    fetchProductRevenueData,
    savedEndDateTime,
    savedStartDateTime,
    revenueData,
  ]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      let data = null;
      let detailed = [];

      let startDateTime = null;
      let endDateTime = null;

      switch (periodType) {
        case "daily": {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const day = String(selectedDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          data = await getDailyRevenue(dateStr);
          startDateTime = new Date(selectedDate);
          startDateTime.setHours(0, 0, 0, 0);
          endDateTime = new Date(selectedDate);
          endDateTime.setHours(23, 59, 59, 999);
          break;
        }
        case "monthly": {
          data = await getMonthlyRevenue(selectedYear, selectedMonth);
          startDateTime = new Date(selectedYear, selectedMonth - 1, 1);
          startDateTime.setHours(0, 0, 0, 0);
          const daysInMonth = new Date(
            selectedYear,
            selectedMonth,
            0
          ).getDate();
          endDateTime = new Date(selectedYear, selectedMonth - 1, daysInMonth);
          endDateTime.setHours(23, 59, 59, 999);
          const dailyPromises = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const dStr = String(date.getDate()).padStart(2, "0");
            const ds = `${y}-${m}-${dStr}`;
            dailyPromises.push(
              getDailyRevenue(ds).catch(() => ({
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
        }
        case "yearly": {
          data = await getYearlyRevenue(selectedYear);
          startDateTime = new Date(selectedYear, 0, 1);
          startDateTime.setHours(0, 0, 0, 0);
          endDateTime = new Date(selectedYear, 11, 31);
          endDateTime.setHours(23, 59, 59, 999);
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
        }
        case "custom": {
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
          startDateTime = new Date(startDate);
          startDateTime.setHours(0, 0, 0, 0);
          endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          const customDailyPromises = [];
          const currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, "0");
            const d = String(currentDate.getDate()).padStart(2, "0");
            const ds = `${y}-${m}-${d}`;
            customDailyPromises.push(
              getDailyRevenue(ds).catch(() => ({
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
        }
        default: {
          break;
        }
      }

      setRevenueData(data);
      setDetailedData(detailed);
      setCurrentPage(1);

      // Save date range for later use when filter changes
      if (startDateTime && endDateTime) {
        setSavedStartDateTime(startDateTime);
        setSavedEndDateTime(endDateTime);
      }

      // Fetch product revenue data
      if (startDateTime && endDateTime) {
        await fetchProductRevenueData(
          startDateTime,
          endDateTime,
          selectedAccountId
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu doanh thu:", error);
      message.error(
        error.response?.data?.message ||
        "Lỗi khi tải dữ liệu doanh thu. Vui lòng thử lại."
      );
      setRevenueData(null);
      setDetailedData([]);
      setProductRevenueData([]);
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

  const handleExportExcel = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!productRevenueData || productRevenueData.length === 0) {
      message.warning("Không có dữ liệu sản phẩm để xuất Excel!");
      return;
    }

    try {
      // Tạo workbook mới
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách sản phẩm");

      // Định nghĩa headers
      const headers = [
        "STT",
        "Tên sản phẩm",
        "Giá bán (VNĐ)",
        "Số lượng",
        "Tổng tiền (VNĐ)",
      ];

      // Thêm header row
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 20;

      // Thêm dữ liệu
      productRevenueData.forEach((item, index) => {
        const sellingPrice =
          item.totalSold > 0 ? item.totalRevenue / item.totalSold : 0;

        const row = worksheet.addRow([
          index + 1,
          item.productName || "",
          new Intl.NumberFormat("vi-VN").format(sellingPrice),
          item.totalSold || 0,
          new Intl.NumberFormat("vi-VN").format(item.totalRevenue || 0),
        ]);

        // Căn giữa cho các cột số
        row.getCell(1).alignment = { horizontal: "center", vertical: "middle" }; // STT
        row.getCell(3).alignment = { horizontal: "center", vertical: "middle" }; // Giá bán
        row.getCell(4).alignment = { horizontal: "center", vertical: "middle" }; // Số lượng
        row.getCell(5).alignment = { horizontal: "center", vertical: "middle" }; // Tổng tiền
      });

      // Tính tổng tiền
      const totalRevenue = productRevenueData.reduce(
        (sum, item) => sum + (item.totalRevenue || 0),
        0
      );

      // Thêm dòng tổng tiền
      const accountName = selectedAccountId
        ? salesAccounts.find((acc) => acc.id === selectedAccountId)?.fullName ||
        ""
        : "Tất cả nhân viên";

      const totalRow = worksheet.addRow([
        "",
        `Tổng tiền của ${accountName}:`,
        "",
        "",
        new Intl.NumberFormat("vi-VN").format(totalRevenue),
      ]);

      // Format dòng tổng
      totalRow.font = { bold: true };
      totalRow.getCell(2).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      totalRow.getCell(5).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // Set column widths
      worksheet.columns = [
        { width: 10 }, // STT
        { width: 40 }, // Tên sản phẩm
        { width: 20 }, // Giá bán
        { width: 15 }, // Số lượng
        { width: 20 }, // Tổng tiền
      ];

      // Tạo file và download
      const periodLabel = getPeriodLabel();
      const safeAccountName = accountName.replace(/[^a-zA-Z0-9_]/g, "_");
      const safePeriodLabel = periodLabel.replace(/[^a-zA-Z0-9_]/g, "_");
      const filename = `Bao_cao_san_pham_${safePeriodLabel}_${safeAccountName}`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      message.error("Lỗi khi xuất Excel. Vui lòng thử lại.");
    }
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case "daily": {
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();
        return `Ngày ${day}/${month}/${year}`;
      }
      case "monthly": {
        return `Tháng ${selectedMonth}/${selectedYear}`;
      }
      case "yearly": {
        return `Năm ${selectedYear}`;
      }
      case "custom": {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
          return "Chưa chọn khoảng thời gian";
        }
        return `Từ ${dateRange[0].format(
          "DD/MM/YYYY"
        )} đến ${dateRange[1].format("DD/MM/YYYY")}`;
      }
      default: {
        return "";
      }
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
              rotate:
                periodType === "monthly" || periodType === "custom" ? -45 : 0,
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
          data: [revenueData.totalRevenue || 0, averageRevenuePerOrder],
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
              <h4 className="fw-bold">Báo cáo doanh thu</h4>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {/* Header Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="fas fa-filter text-secondary" style={{ fontSize: '20px' }}></i>
                  <h5 className="mb-0 fw-bold">Bộ lọc báo cáo</h5>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Chọn khoảng thời gian để xem báo cáo
                </p>
              </div>

              {/* Report Type Filter Label */}
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-chart-line text-muted" style={{ fontSize: '14px' }}></i>
                  <label className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>Loại báo cáo</label>
                </div>
              </div>

              {/* Tabs for Report Type */}
              <div className="mb-4">
                <div className="btn-group w-100" role="group" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: periodType === 'daily' ? '600' : '500',
                      backgroundColor: periodType === 'daily' ? '#6c757d' : '#fff',
                      border: '1px solid #6c757d',
                      color: periodType === 'daily' ? '#fff' : '#6c757d',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setPeriodType('daily');
                      setRevenueData(null);
                      setDetailedData([]);
                      setProductRevenueData([]);
                    }}
                  >
                    <i className="fas fa-calendar-day me-2"></i>
                    Theo ngày
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: periodType === 'monthly' ? '600' : '500',
                      backgroundColor: periodType === 'monthly' ? '#6c757d' : '#fff',
                      border: '1px solid #6c757d',
                      color: periodType === 'monthly' ? '#fff' : '#6c757d',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setPeriodType('monthly');
                      setRevenueData(null);
                      setDetailedData([]);
                      setProductRevenueData([]);
                    }}
                  >
                    <i className="fas fa-calendar-alt me-2"></i>
                    Theo tháng
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: periodType === 'yearly' ? '600' : '500',
                      backgroundColor: periodType === 'yearly' ? '#6c757d' : '#fff',
                      border: '1px solid #6c757d',
                      color: periodType === 'yearly' ? '#fff' : '#6c757d',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setPeriodType('yearly');
                      setRevenueData(null);
                      setDetailedData([]);
                      setProductRevenueData([]);
                    }}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Theo năm
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: periodType === 'custom' ? '600' : '500',
                      backgroundColor: periodType === 'custom' ? '#6c757d' : '#fff',
                      border: '1px solid #6c757d',
                      color: periodType === 'custom' ? '#fff' : '#6c757d',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setPeriodType('custom');
                      setRevenueData(null);
                      setDetailedData([]);
                      setProductRevenueData([]);
                    }}
                  >
                    <i className="fas fa-calendar-week me-2"></i>
                    Tùy chỉnh
                  </button>
                </div>
              </div>

              {/* Date Selection Section */}
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fas fa-calendar text-muted" style={{ fontSize: '14px' }}></i>
                  <label className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>Chọn ngày</label>
                </div>

                {periodType === "daily" && (
                  <div>
                    <CommonDatePicker
                      value={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setRevenueData(null);
                        setDetailedData([]);
                        setProductRevenueData([]);
                      }}
                      dateFormat="dd/mm/yyyy"
                    />
                  </div>
                )}

                {periodType === "monthly" && (
                  <div className="row g-3">
                    <div className="col-lg-6">
                      <select
                        className="form-select"
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(parseInt(e.target.value));
                          setRevenueData(null);
                          setDetailedData([]);
                          setProductRevenueData([]);
                        }}
                        style={{ borderRadius: '8px', padding: '10px' }}
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
                    <div className="col-lg-6">
                      <select
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(parseInt(e.target.value));
                          setRevenueData(null);
                          setDetailedData([]);
                          setProductRevenueData([]);
                        }}
                        style={{ borderRadius: '8px', padding: '10px' }}
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

                {periodType === "yearly" && (
                  <div>
                    <select
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(parseInt(e.target.value));
                        setRevenueData(null);
                        setProductRevenueData([]);
                      }}
                      style={{ borderRadius: '8px', padding: '10px' }}
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
                )}

                {periodType === "custom" && (
                  <div>
                    <RangePicker
                      value={dateRange}
                      onChange={(dates) => {
                        setDateRange(dates);
                        setRevenueData(null);
                        setDetailedData([]);
                        setProductRevenueData([]);
                      }}
                      format="DD/MM/YYYY"
                      style={{ width: "100%", borderRadius: '8px', padding: '10px' }}
                      placeholder={["Từ ngày", "Đến ngày"]}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  className="btn w-100"
                  onClick={fetchRevenueData}
                  disabled={loading}
                  style={{
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    backgroundColor: '#6c757d',
                    border: '1px solid #6c757d',
                    color: '#fff',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  {loading ? "Đang tải..." : "Xem báo cáo"}
                </button>
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
                                    style={{
                                      fontSize: "2rem",
                                      lineHeight: "1",
                                    }}
                                  ></i>
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
                                    style={{
                                      fontSize: "2rem",
                                      lineHeight: "1",
                                    }}
                                  ></i>
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
                                    className="ti ti-chart-line fs-2"
                                    style={{
                                      fontSize: "2rem",
                                      lineHeight: "1",
                                    }}
                                  ></i>
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
                                          số tiền thu được từ tất cả các đơn
                                          hàng trong khoảng thời gian đã chọn
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
                                          <strong>Trung bình mỗi đơn:</strong>{" "}
                                          Giá trị trung bình của mỗi đơn hàng
                                          (Tổng doanh thu / Số lượng đơn hàng)
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
                        <div className="card">
                          <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="card-title mb-0">
                                Danh sách sản phẩm đã bán
                              </h5>
                              <div className="d-flex align-items-center gap-3">
                                {productRevenueData &&
                                  productRevenueData.length > 0 && (
                                    <TableTopHead
                                      onExportExcel={handleExportExcel}
                                      showRefresh={false}
                                    />
                                  )}
                                <div
                                  className="form-group mb-0"
                                  style={{ minWidth: "250px" }}
                                >
                                  <select
                                    className="form-select"
                                    value={selectedAccountId || ""}
                                    onChange={(e) => {
                                      const accountId = e.target.value || null;
                                      setSelectedAccountId(accountId);
                                      setCurrentPage(1);
                                    }}
                                  >
                                    <option value="">Tất cả nhân viên</option>
                                    {salesAccounts.map((account) => (
                                      <option
                                        key={account.id}
                                        value={account.id}
                                      >
                                        {account.fullName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="card-body">
                            {productRevenueData &&
                              Array.isArray(productRevenueData) &&
                              productRevenueData.length > 0 ? (
                              <PrimeDataTable
                                column={[
                                  {
                                    header: "STT",
                                    field: "index",
                                    body: (rowData, { rowIndex }) => {
                                      if (rowData.isTotal) {
                                        return "-";
                                      }
                                      return (
                                        (currentPage - 1) * rows + rowIndex
                                      );
                                    },
                                    sortable: false,
                                    className: "text-start",
                                  },
                                  {
                                    header: "Tên sản phẩm",
                                    field: "productName",
                                    body: (rowData) => {
                                      if (rowData.isTotal) {
                                        return "-";
                                      }
                                      return rowData.productName;
                                    },
                                    sortable: true,
                                  },
                                  {
                                    header: "Giá bán",
                                    field: "sellingPrice",
                                    body: (rowData) => {
                                      if (rowData.isTotal) {
                                        return "-";
                                      }
                                      const sellingPrice =
                                        rowData.totalSold > 0
                                          ? rowData.totalRevenue /
                                          rowData.totalSold
                                          : 0;
                                      return formatCurrency(sellingPrice);
                                    },
                                    sortable: false,
                                    className: "text-start",
                                  },
                                  {
                                    header: "Số lượng",
                                    field: "totalSold",
                                    body: (rowData) => {
                                      if (rowData.isTotal) {
                                        return "-";
                                      }
                                      return new Intl.NumberFormat(
                                        "vi-VN"
                                      ).format(rowData.totalSold || 0);
                                    },
                                    sortable: true,
                                    className: "text-start",
                                  },
                                  {
                                    header: "Thành tiền",
                                    field: "totalRevenue",
                                    body: (rowData) => {
                                      return formatCurrency(
                                        rowData.totalRevenue || 0
                                      );
                                    },
                                    sortable: true,
                                    className: "text-start",
                                  },
                                ]}
                                data={(() => {
                                  const totalRevenue =
                                    productRevenueData.reduce(
                                      (sum, item) =>
                                        sum + (item.totalRevenue || 0),
                                      0
                                    );
                                  const totalRow = {
                                    isTotal: true,
                                    productId: "total-row",
                                    productName: "-",
                                    totalSold: 0,
                                    totalRevenue: totalRevenue,
                                  };
                                  return [totalRow, ...productRevenueData];
                                })()}
                                totalRecords={
                                  (productRevenueData?.length || 0) + 1
                                }
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rows={rows}
                                setRows={setRows}
                                loading={loading}
                                dataKey="productId"
                              />
                            ) : (
                              <div className="text-center text-muted py-4">
                                <p>
                                  Không có sản phẩm nào được bán trong khoảng
                                  thời gian đã chọn.
                                </p>
                              </div>
                            )}
                          </div>
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
