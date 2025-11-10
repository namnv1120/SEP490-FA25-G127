import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import Datatable from "../../core/pagination/datatable";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
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

  // Mock data để test hiển thị
  const mockData = [
    {
      transactionId: "TXN001",
      transactionDate: "2025-10-01T08:30:00",
      productName: "Bộ nồi Inox 3 đáy Sunhouse SH333",
      transactionType: "IMPORT",
      quantity: 100,
      referenceType: "PURCHASE_ORDER",
      referenceId: "REF001",
    },
    {
      transactionId: "TXN002",
      transactionDate: "2025-10-03T09:45:00",
      productName: "Bộ nồi Anod Sunhouse AN668",
      transactionType: "IMPORT",
      quantity: 80,
      referenceType: "PURCHASE_ORDER",
      referenceId: "REF002",
    },
    {
      transactionId: "TXN003",
      transactionDate: "2025-10-05T10:00:00",
      productName: "Chảo chống dính Sunhouse CS26",
      transactionType: "IMPORT",
      quantity: 120,
      referenceType: "PURCHASE_ORDER",
      referenceId: "REF003",
    },
    {
      transactionId: "TXN004",
      transactionDate: "2025-10-10T11:30:00",
      productName: "Nồi cơm điện Sunhouse SHD8955",
      transactionType: "IMPORT",
      quantity: 60,
      referenceType: "PURCHASE_ORDER",
      referenceId: "REF004",
    },
    {
      transactionId: "TXN005",
      transactionDate: "2025-10-12T14:15:00",
      productName: "Bếp điện từ đơn Sunhouse SHB9100",
      transactionType: "IMPORT",
      quantity: 70,
      referenceType: "PURCHASE_ORDER",
      referenceId: "REF005",
    },
  ];

  const TransactionTypes = [
    { value: "", label: "Tất cả" },
    { value: "IMPORT", label: "Nhập kho" },
    { value: "EXPORT", label: "Xuất kho" },
    { value: "ADJUSTMENT", label: "Điều chỉnh" },
  ];

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

      const params = {
        page: currentPage - 1,
        size: rows,
        productId: selectedProduct || null,
        transactionType: selectedTransactionType || null,
        from,
        to,
      };

      console.log("=== Tham số gửi lên API ===", params);

      // Dùng mock data test
      const data = { content: mockData, totalElements: mockData.length };

      // Uncomment khi API sẵn sàng
      // const data = await getTransactions(params);

      const normalizedData = (data.content || []).map((item, index) => ({
        ...item,
        transactionId: item.transactionId ?? `temp-${index}-${Date.now()}`,
      }));

      setListData(normalizedData);
      setTotalRecords(data.totalElements || 0);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      setError("Không thể tải dữ liệu giao dịch. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows, selectedProduct, selectedTransactionType, dateRange]);

  const columns = [
    {
      title: "Mã GD",
      dataIndex: "transactionId",
      key: "transactionId",
      sorter: (a, b) => a.transactionId.localeCompare(b.transactionId),
      render: (text) => (
        <Link to="#" className="text-primary fw-medium small">
          {text.slice(0, 8)}...
        </Link>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "transactionDate",
      key: "transactionDate",
      sorter: (a, b) =>
        new Date(a.transactionDate) - new Date(b.transactionDate),
      render: (text) =>
        new Date(text).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Loại",
      dataIndex: "transactionType",
      key: "transactionType",
      sorter: (a, b) => a.transactionType.localeCompare(b.transactionType),
      render: (type) => {
        const badge = {
          IMPORT: { class: "bg-success", text: "Nhập kho" },
          EXPORT: { class: "bg-danger", text: "Xuất kho" },
          ADJUSTMENT: { class: "bg-warning", text: "Điều chỉnh" },
        }[type] || { class: "bg-secondary", text: type };
        return (
          <span className={`badge ${badge.class} small`}>{badge.text}</span>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty) => (
        <span className={qty > 0 ? "text-success" : "text-danger"}>
          <strong>
            {qty > 0 ? "+" : ""}
            {qty}
          </strong>
        </span>
      ),
    },
    {
      title: "Tham chiếu",
      dataIndex: "referenceType",
      key: "referenceType",
      sorter: (a, b) =>
        (a.referenceType || "").localeCompare(b.referenceType || ""),
      render: (refType) => {
        const ref =
          {
            PURCHASE_ORDER: "Đơn nhập",
            SALES_ORDER: "Đơn bán",
            ADJUSTMENT: "Điều chỉnh kho",
          }[refType] || refType;
        return <small className="text-muted">{ref}</small>;
      },
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "referenceId",
      key: "referenceId",
      sorter: (a, b) =>
        (a.referenceId || "").localeCompare(b.referenceId || ""),
      render: (refId) => (
        <code className="small text-muted">
          {refId ? refId.slice(0, 8) + "..." : "-"}
        </code>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
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
                    value={TransactionTypes.find(
                      (item) => item.value === selectedTransactionType
                    )}
                    onChange={(selected) =>
                      setSelectedTransactionType(selected?.value || "")
                    }
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

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3 bg-light-subtle px-4 py-3">
            <div>
              <h5 className="mb-0 fw-semibold">
                Danh sách giao dịch{" "}
                <span className="text-muted small">
                  ({totalRecords} bản ghi)
                </span>
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
            <Datatable
              columns={columns}
              dataSource={listData}
              current={currentPage}
              pageSize={rows}
              total={totalRecords}
              onChange={(page, size) => {
                setCurrentPage(page);
                setRows(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setRows(size);
              }}
            />
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default TransactionHistory;
