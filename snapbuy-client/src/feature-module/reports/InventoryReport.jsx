import { useState } from "react";
import { message, ConfigProvider, DatePicker } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import { getInventoryReportByDate } from "../../services/InventoryReportService";

dayjs.locale("vi");

const InventoryReport = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [comparisonOverview, setComparisonOverview] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);

  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Hàm tải dữ liệu
  const handleLoadData = async () => {
    if (!selectedDate) {
      message.warning("Vui lòng chọn ngày");
      return;
    }

    try {
      setLoading(true);

      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");

      // Gọi API backend thông qua service
      const data = await getInventoryReportByDate(formattedDate);

      if (data) {
        // Set overview data
        setComparisonOverview(data.overview);

        // Set detail data
        setComparisonData(data.details || []);

        message.success("Tải dữ liệu báo cáo thành công!");
      } else {
        message.warning("Không có dữ liệu báo cáo.");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      message.error(
        error.response?.data?.message ||
          "Lỗi khi tải dữ liệu báo cáo. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Columns cho bảng so sánh
  const comparisonColumns = [
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
      header: "Mã SP",
      field: "productCode",
      sortable: true,
    },
    {
      header: "Tên sản phẩm",
      field: "productName",
      sortable: true,
    },
    {
      header: "Danh mục",
      field: "categoryName",
      sortable: true,
    },
    {
      header: "Tồn hiện tại",
      field: "currentStock",
      body: (rowData) => {
        return formatNumber(rowData.currentStock || 0);
      },
      sortable: true,
      className: "text-center",
    },
    {
      header: "Tồn tại thời điểm",
      field: "stockAtDate",
      body: (rowData) => {
        return formatNumber(rowData.stockAtDate || 0);
      },
      sortable: true,
      className: "text-center",
    },
    {
      header: "Đã bán",
      field: "quantitySold",
      body: (rowData) => {
        return (
          <span className="text-danger fw-bold">
            {formatNumber(rowData.quantitySold || 0)}
          </span>
        );
      },
      sortable: true,
      className: "text-center",
    },
    {
      header: "Đã nhập",
      field: "quantityReceived",
      body: (rowData) => {
        return (
          <span className="text-success fw-bold">
            {formatNumber(rowData.quantityReceived || 0)}
          </span>
        );
      },
      sortable: true,
      className: "text-center",
    },
    {
      header: "Chênh lệch",
      field: "stockDifference",
      body: (rowData) => {
        const diff = rowData.stockDifference || 0;
        const className =
          diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "text-muted";
        const icon = diff > 0 ? "↑" : diff < 0 ? "↓" : "=";
        return (
          <span className={`${className} fw-bold`}>
            {icon} {formatNumber(Math.abs(diff))}
          </span>
        );
      },
      sortable: true,
      className: "text-center",
    },
    {
      header: "Giá trị hiện tại",
      field: "currentValue",
      body: (rowData) => {
        return formatCurrency(rowData.currentValue || 0);
      },
      sortable: true,
      className: "text-start",
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4 className="fw-bold">Báo cáo tồn kho</h4>
            </div>
          </div>

          {/* Form Chọn Ngày */}
          <div className="card mb-4">
            <div className="card-body">
              {/* Header Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="fas fa-filter text-secondary"
                    style={{ fontSize: "20px" }}
                  ></i>
                  <h5 className="mb-0 fw-bold">Bộ lọc báo cáo</h5>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                  Chọn ngày để xem báo cáo tồn kho
                </p>
              </div>

              {/* Date Selection Section */}
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i
                    className="fas fa-calendar text-muted"
                    style={{ fontSize: "14px" }}
                  ></i>
                  <label
                    className="mb-0 fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    Chọn ngày
                  </label>
                </div>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                  disabledDate={(current) => {
                    return current && current > dayjs().endOf("day");
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="mt-4">
                <button
                  className="btn w-100"
                  onClick={handleLoadData}
                  disabled={!selectedDate || loading}
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    backgroundColor: "#6c757d",
                    border: "1px solid #6c757d",
                    color: "#fff",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    opacity: !selectedDate || loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chart-line me-2"></i>
                      Xem báo cáo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Hiển thị kết quả */}
          {comparisonOverview ? (
            <>
              {/* 4 Overview Cards */}
              <div className="row">
                <div className="col-lg-3 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#FF9F43", color: "white" }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">Tổng sản phẩm</h6>
                          <h3 className="text-white mb-0">
                            {formatNumber(
                              comparisonOverview.totalProducts || 0
                            )}
                          </h3>
                        </div>
                        <div className="avatar-lg">
                          <span
                            className="avatar-title bg-white rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="ti ti-package"
                              style={{ fontSize: "2rem", color: "#FF9F43" }}
                            ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#28C76F", color: "white" }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">Tổng số lượng tồn</h6>
                          <h3 className="text-white mb-0">
                            {formatNumber(
                              comparisonOverview.currentTotalStock || 0
                            )}
                          </h3>
                        </div>
                        <div className="avatar-lg">
                          <span
                            className="avatar-title bg-white rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="ti ti-box"
                              style={{ fontSize: "2rem", color: "#28C76F" }}
                            ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#00CFE8", color: "white" }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">Giá trị tồn kho</h6>
                          <h4 className="text-white mb-0">
                            {formatCurrency(
                              comparisonOverview.currentTotalValue || 0
                            )}
                          </h4>
                        </div>
                        <div className="avatar-lg">
                          <span
                            className="avatar-title bg-white rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="ti ti-currency-dollar"
                              style={{ fontSize: "2rem", color: "#00CFE8" }}
                            ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div
                    className="card"
                    style={{ backgroundColor: "#FFB800", color: "white" }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-2">Tồn kho thấp</h6>
                          <h3 className="text-white mb-0">
                            {formatNumber(
                              comparisonOverview.productsWithDecrease || 0
                            )}
                          </h3>
                        </div>
                        <div className="avatar-lg">
                          <span
                            className="avatar-title bg-white rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="ti ti-alert-triangle"
                              style={{ fontSize: "2rem", color: "#FFB800" }}
                            ></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng So Sánh */}
              <div className="card mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    Chi Tiết So Sánh Tồn Sản Phẩm
                  </h5>
                </div>
                <div className="card-body">
                  {comparisonData &&
                  Array.isArray(comparisonData) &&
                  comparisonData.length > 0 ? (
                    <PrimeDataTable
                      column={comparisonColumns}
                      data={comparisonData}
                      totalRecords={comparisonData.length}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      rows={rows}
                      setRows={setRows}
                      loading={loading}
                      dataKey="productId"
                    />
                  ) : (
                    <div className="text-center text-muted py-4">
                      <p>Không có dữ liệu so sánh.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="card-body text-center py-5">
                <i
                  className="ti ti-file-search"
                  style={{ fontSize: "4rem", color: "#ccc" }}
                ></i>
                <p className="text-muted mt-3 mb-0">
                  Vui lòng chọn ngày, sau đó click "Xem báo cáo" để xem báo cáo tồn kho.
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

export default InventoryReport;
