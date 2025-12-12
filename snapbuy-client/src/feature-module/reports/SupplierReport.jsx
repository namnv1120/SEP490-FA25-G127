import { useState } from "react";
import { message, DatePicker, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import {
  getDailySupplierReport,
  getMonthlySupplierReport,
  getYearlySupplierReport,
  getCustomSupplierReport,
} from "../../services/SupplierReportService";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

const SupplierReport = () => {
  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState(null);
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

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      let data = null;


      switch (periodType) {
        case "daily": {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
          const day = String(selectedDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          data = await getDailySupplierReport(dateStr);
          break;
        }
        case "monthly": {
          data = await getMonthlySupplierReport(selectedYear, selectedMonth);
          break;
        }
        case "yearly": {
          data = await getYearlySupplierReport(selectedYear);
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
          data = await getCustomSupplierReport(startStr, endStr);
          break;
        }
        default: {
          break;
        }
      }

      setSupplierData(data);
      setCurrentPage(1);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        "Lỗi khi tải dữ liệu báo cáo nhà cung cấp. Vui lòng thử lại."
      );
      setSupplierData(null);
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
              <h4 className="fw-bold">Báo cáo nhà cung cấp</h4>
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
                      setSupplierData(null);
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
                      setSupplierData(null);
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
                      setSupplierData(null);
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
                      setSupplierData(null);
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
                        setSupplierData(null);
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
                          setSupplierData(null);
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
                          setSupplierData(null);
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
                        setSupplierData(null);
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
                        setSupplierData(null);
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
                  onClick={fetchSupplierData}
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

          {!loading && supplierData && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">
                      Báo cáo nhà cung cấp - {getPeriodLabel()}
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
                                  Tổng số nhà cung cấp
                                </h6>
                                <h3 className="text-white mb-0">
                                  {supplierData.supplierCount || 0}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-primary rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-truck fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
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
                                  Tổng tiền đã nhập
                                </h6>
                                <h3 className="text-white mb-0">
                                  {formatCurrency(supplierData.totalAmount || 0)}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-success rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-currency-dollar fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
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
                                  Số lượng sản phẩm khác nhau
                                </h6>
                                <h3 className="text-white mb-0">
                                  {supplierData.uniqueProductsCount || 0}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-info rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-package fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6">
                        <div className="card bg-warning text-white">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white mb-2">
                                  Tổng số lượng đã nhập
                                </h6>
                                <h3 className="text-white mb-0">
                                  {new Intl.NumberFormat("vi-VN").format(supplierData.totalQuantityReceived || 0)}
                                </h3>
                              </div>
                              <div className="avatar-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="avatar-title bg-light text-warning rounded-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                                  <i className="ti ti-box fs-2" style={{ fontSize: '2rem', lineHeight: '1' }}></i>
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
                            <h5 className="card-title">Danh sách nhà cung cấp</h5>
                          </div>
                          <div className="card-body">
                            {supplierData.supplierDetails && supplierData.supplierDetails.length > 0 ? (
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
                                    header: "Mã nhà cung cấp",
                                    field: "supplierCode",
                                    sortable: true,
                                  },
                                  {
                                    header: "Tên nhà cung cấp",
                                    field: "supplierName",
                                    sortable: true,
                                  },
                                  {
                                    header: "Số điện thoại",
                                    field: "phone",
                                    sortable: true,
                                  },
                                  {
                                    header: "Số sản phẩm đã nhập",
                                    field: "productsReceivedCount",
                                    body: (rowData) => {
                                      return new Intl.NumberFormat("vi-VN").format(
                                        rowData.productsReceivedCount || 0
                                      );
                                    },
                                    sortable: true,
                                    className: "text-center",
                                  },
                                  {
                                    header: "Tổng số lượng đã nhập",
                                    field: "totalQuantityReceived",
                                    body: (rowData) => {
                                      return new Intl.NumberFormat("vi-VN").format(
                                        rowData.totalQuantityReceived || 0
                                      );
                                    },
                                    sortable: true,
                                    className: "text-center",
                                  },
                                  {
                                    header: "Tổng tiền đã nhập",
                                    field: "totalAmount",
                                    body: (rowData) => {
                                      return formatCurrency(rowData.totalAmount || 0);
                                    },
                                    sortable: true,
                                    className: "text-center",
                                  },
                                ]}
                                data={supplierData.supplierDetails || []}
                                totalRecords={supplierData.supplierDetails?.length || 0}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rows={rows}
                                setRows={setRows}
                                loading={loading}
                                dataKey="supplierId"
                              />
                            ) : (
                              <div className="text-center text-muted py-4">
                                <p>Không có nhà cung cấp nào trong khoảng thời gian đã chọn.</p>
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

          {!loading && !supplierData && (
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted">
                  Không có dữ liệu nhà cung cấp cho khoảng thời gian đã chọn.
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

export default SupplierReport;

