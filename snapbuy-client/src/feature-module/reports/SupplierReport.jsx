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
              <h4>Báo cáo nhà cung cấp</h4>
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
                        setSupplierData(null);
                        
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
                          setSupplierData(null);
                          
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
                            setSupplierData(null);
                            
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
                            setSupplierData(null);
                            
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
                          setSupplierData(null);
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
                          setSupplierData(null);
                          
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
                    onClick={fetchSupplierData}
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

