import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/Collapse";
import { getTransactions } from "../../services/InventoryTransactionsService";

const TransactionHistory = () => {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load dữ liệu khi filter thay đổi
  useEffect(() => {
    loadTransactions();
  }, [currentPage, rows, selectedProduct, selectedTransactionType, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const from = dateRange[0]
        ? new Date(dateRange[0]).toISOString().split("T")[0]
        : null;
      const to = dateRange[1]
        ? new Date(dateRange[1]).toISOString().split("T")[0]
        : null;

      const data = await getTransactions({
        page: currentPage - 1,
        size: rows,
        sort: "transactionDate",
        dir: "DESC",
        productId: selectedProduct || null,
        transactionType: selectedTransactionType || null,
        from,
        to,
      });

      // Gán transactionId tạm nếu null hoặc trùng
      const normalizedData = (data.content || []).map((item, index) => ({
        ...item,
        transactionId: item.transactionId || `temp-${index}`,
      }));

      setListData(normalizedData);
      setTotalRecords(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setError(
        "Không thể tải dữ liệu giao dịch. Vui lòng kiểm tra kết nối hoặc đăng nhập lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Mã GD",
      field: "transactionId",
      body: (row) => (
        <Link to="#" className="text-primary fw-medium small">
          {row.transactionId.slice(0, 8)}...
        </Link>
      ),
    },
    {
      header: "Thời gian",
      field: "transactionDate",
      body: (row) =>
        new Date(row.transactionDate).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      header: "Sản phẩm",
      field: "productName",
      body: (row) => <span className="fw-medium">{row.productName}</span>,
    },
    {
      header: "Loại",
      field: "transactionType",
      body: (row) => {
        const badge = {
          IMPORT: { class: "bg-success", text: "Nhập kho" },
          EXPORT: { class: "bg-danger", text: "Xuất kho" },
          ADJUSTMENT: { class: "bg-warning", text: "Điều chỉnh" },
        }[row.transactionType] || {
          class: "bg-secondary",
          text: row.transactionType,
        };

        return <span className={`badge ${badge.class} small`}>{badge.text}</span>;
      },
    },
    {
      header: "Số lượng",
      field: "quantity",
      body: (row) => (
        <span className={row.quantity > 0 ? "text-success" : "text-danger"}>
          <strong>
            {row.quantity > 0 ? "+" : ""}
            {row.quantity}
          </strong>
        </span>
      ),
    },
    {
      header: "Tham chiếu",
      field: "referenceType",
      body: (row) => {
        const ref =
          {
            PURCHASE_ORDER: "Đơn nhập",
            SALES_ORDER: "Đơn bán",
            ADJUSTMENT: "Điều chỉnh kho",
          }[row.referenceType] || row.referenceType;
        return <small className="text-muted">{ref}</small>;
      },
    },
    {
      header: "Mã tham chiếu",
      field: "referenceId",
      body: (row) => (
        <code className="small text-muted">
          {row.referenceId ? row.referenceId.slice(0, 8) + "..." : "-"}
        </code>
      ),
    },
  ];

  const TransactionTypes = [
    { value: "", label: "Tất cả" },
    { value: "IMPORT", label: "Nhập kho" },
    { value: "EXPORT", label: "Xuất kho" },
    { value: "ADJUSTMENT", label: "Điều chỉnh" },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Lịch Sử Giao Dịch Kho</h4>
              <h6>Theo dõi nhập, xuất, điều chỉnh hàng tồn</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <RefreshIcon onClick={loadTransactions} loading={loading} />
            <CollapesIcon />
          </ul>
        </div>

        {/* Bộ lọc */}
        <div className="card mb-3 shadow-sm">
          <div className="card-body p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                loadTransactions();
              }}
              className="row g-3 align-items-end"
            >
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Khoảng thời gian
                </label>
                <div style={{ height: "38px" }}>
                  <CommonDateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-100 h-100"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Loại giao dịch
                </label>
                <div style={{ height: "38px" }}>
                  <CommonSelect
                    options={TransactionTypes}
                    value={selectedTransactionType}
                    onChange={(e) => setSelectedTransactionType(e.value)}
                    placeholder="Chọn loại"
                    className="w-100 h-100"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Mã sản phẩm
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: PRD001"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value.trim())}
                  style={{ height: "38px" }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100 h-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ minHeight: "38px" }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      <span>Đang tìm...</span>
                    </>
                  ) : (
                    <>
                      <i className="ti ti-search fs-5" />
                      <span>Tìm kiếm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3 bg-light-subtle px-4 py-3">
            <div>
              <h5 className="mb-0 fw-semibold">
                Danh sách giao dịch{" "}
                <span className="text-muted small">({totalRecords} bản ghi)</span>
              </h5>
            </div>
            <ul className="table-top-head">
              <TooltipIcons />
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="In"
                  className="text-muted"
                >
                  <i className="ti ti-printer fs-5" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="card-body p-0">
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mx-3 mt-3"
                role="alert"
              >
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            <PrimeDataTable
              column={columns}
              data={listData}
              dataKey="transactionId"
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalRecords={totalRecords}
              loading={loading}
              emptyMessage="Không có giao dịch nào phù hợp."
            />
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default TransactionHistory;