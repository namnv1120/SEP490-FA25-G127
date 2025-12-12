import { useState } from "react";
import { message, DatePicker, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import {
  getDailyCustomerReport,
  getMonthlyCustomerReport,
  getYearlyCustomerReport,
  getCustomCustomerReport,
} from "../../services/CustomerReportService";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

const CustomerReport = () => {
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);
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

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      let data = null;


      switch (periodType) {
        case "daily": {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const day = String(selectedDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          data = await getDailyCustomerReport(dateStr);
          break;
        }
        case "monthly": {
          data = await getMonthlyCustomerReport(selectedYear, selectedMonth);
          break;
        }
        case "yearly": {
          data = await getYearlyCustomerReport(selectedYear);
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
          data = await getCustomCustomerReport(startStr, endStr);
          break;
        }
        default: {
          break;
        }
      }

      setCustomerData(data);
      setCurrentPage(1);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        "Lỗi khi tải dữ liệu báo cáo khách hàng. Vui lòng thử lại."
      );
      setCustomerData(null);
    } finally {
      setLoading(false);
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
        return `Từ ${dateRange[0].format("DD/MM/YYYY")} đến ${dateRange[1].format("DD/MM/YYYY")}`;
      }
      default: {
        return "";
      }
    }
  };

  return (
    <ConfigProvider locale={viVN}>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4 className="fw-bold">Báo cáo khách hàng</h4>
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
                      setCustomerData(null);
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
                      setCustomerData(null);
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
                      setCustomerData(null);
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
                      setCustomerData(null);
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
                        setCustomerData(null);
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
                          setCustomerData(null);
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
                          setCustomerData(null);
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
                        setCustomerData(null);
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
                        setCustomerData(null);
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
                  onClick={fetchCustomerData}
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

          {!loading && customerData && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">
                      Báo cáo khách hàng - {getPeriodLabel()}
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
                                  Tổng số khách hàng
                                </h6>
                                <h3 className="text-white mb-0">
                                  {customerData.customerCount || 0}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-primary rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-users fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
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
                                  Tổng số sản phẩm đã mua
                                </h6>
                                <h3 className="text-white mb-0">
                                  {customerData.totalProductsPurchased || 0}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-success rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-package fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="row mt-4">
                      <div className="col-lg-12">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Danh sách khách hàng</h5>
                          </div>
                          <div className="card-body">
                            {customerData.customerDetails && customerData.customerDetails.length > 0 ? (
                              <PrimeDataTable
                                column={[
                                  {
                                    header: "STT",
                                    field: "index",
                                    body: (rowData, { rowIndex }) => {
                                      return (currentPage - 1) * rows + rowIndex + 1;
                                    },
                                    sortable: false,
                                    className: "text-center",
                                  },
                                  {
                                    header: "Mã khách hàng",
                                    field: "customerCode",
                                    sortable: true,
                                  },
                                  {
                                    header: "Tên khách hàng",
                                    field: "customerName",
                                    sortable: true,
                                  },
                                  {
                                    header: "Số điện thoại",
                                    field: "phone",
                                    sortable: true,
                                  },
                                  {
                                    header: "Số sản phẩm đã mua",
                                    field: "productsPurchasedCount",
                                    body: (rowData) => {
                                      return new Intl.NumberFormat("vi-VN").format(
                                        rowData.productsPurchasedCount || 0
                                      );
                                    },
                                    sortable: true,
                                    className: "text-center",
                                  },
                                  {
                                    header: "Tổng số lượng đã mua",
                                    field: "totalQuantityPurchased",
                                    body: (rowData) => {
                                      return new Intl.NumberFormat("vi-VN").format(
                                        rowData.totalQuantityPurchased || 0
                                      );
                                    },
                                    sortable: true,
                                    className: "text-center",
                                  },
                                ]}
                                data={customerData.customerDetails || []}
                                totalRecords={customerData.customerDetails?.length || 0}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rows={rows}
                                setRows={setRows}
                                loading={loading}
                                dataKey="customerId"
                              />
                            ) : (
                              <div className="text-center text-muted py-4">
                                <p>Không có khách hàng nào trong khoảng thời gian đã chọn.</p>
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

          {!loading && !customerData && (
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted">
                  Không có dữ liệu khách hàng cho khoảng thời gian đã chọn.
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

export default CustomerReport;

