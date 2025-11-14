import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import PrimeDataTable from "../../components/data-table";
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
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [selectedReferenceType, setSelectedReferenceType] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const TransactionTypes = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      { value: "IMPORT", label: "Nhập kho" },
      { value: "EXPORT", label: "Xuất kho" },
      { value: "ADJUSTMENT", label: "Điều chỉnh" },
    ],
    []
  );

  const ReferenceTypes = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      { value: "PURCHASE_ORDER", label: "Đơn nhập" },
      { value: "SALES_ORDER", label: "Đơn bán (POS)" },
      { value: "ADJUSTMENT", label: "Điều chỉnh kho" },
    ],
    []
  );

  const dateRangeKey = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return "null";
    const [start, end] = dateRange.map(d => d.toISOString().split("T")[0]);
    return `${start}_${end}`;
  }, [dateRange]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [from, to] = dateRange.map(d =>
        d ? new Date(d).toISOString().split("T")[0] : null
      );

      const params = {
        page: currentPage - 1,
        size: rows,
        sort: "transactionDate",
        dir: "DESC",
        ...(selectedTransactionType && { transactionType: selectedTransactionType }),
        ...(selectedReferenceType && { referenceType: selectedReferenceType }),
        ...(from && { from }),
        ...(to && { to }),
      };

      const { content } = await getTransactions(params);

      const normalizedData = content.map((item, index) => {
        const parsedDate = item.transactionDate
          ? new Date(item.transactionDate)
          : item.createdAt
            ? new Date(item.createdAt)
            : item.date
              ? new Date(item.date)
              : null;

        const uniqueKey =
          item.transactionId ||
          `fallback-${index}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        const prefixMap = { IMPORT: "NK", EXPORT: "XK", ADJUSTMENT: "DC" };
        const prefix = prefixMap[item.transactionType] || "GD";

        const offset = (currentPage - 1) * rows;
        const shortCode = `${prefix}-${String(offset + index + 1).padStart(3, "0")}`;

        return {
          key: uniqueKey,
          shortCode,
          transactionDate: parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null,
          productName: item.productName || "Không xác định",
          productCode: item.productCode || item.productId?.slice(0, 8) || "-",
          transactionType: item.transactionType || "UNKNOWN",
          quantity: Number(item.quantity) || 0,
          referenceType: item.referenceType || "-",
        };
      });

      const trimmedSearch = searchProduct.trim().toLowerCase();
      const filteredData = trimmedSearch
        ? normalizedData.filter(
          item =>
            item.productName.toLowerCase().includes(trimmedSearch) ||
            item.productCode.toLowerCase().includes(trimmedSearch)
        )
        : normalizedData;

      setListData(filteredData);
      setTotalRecords(filteredData.length);
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setListData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    rows,
    selectedTransactionType,
    selectedReferenceType,
    dateRange,
    searchProduct,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchProduct, selectedTransactionType, selectedReferenceType, dateRangeKey, rows, loadTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, loadTransactions]);

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Mã GD",
      field: "shortCode",
      key: "shortCode",
      sortable: true,
      body: (data) => (
        <Link to="#" className="text-primary fw-medium small">
          {data.shortCode}
        </Link>
      ),
    },
    {
      header: "Thời gian",
      field: "transactionDate",
      key: "transactionDate",
      sortable: true,
      body: (data) =>
        data.transactionDate && !isNaN(new Date(data.transactionDate).getTime())
          ? new Date(data.transactionDate).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "-",
    },
    {
      header: "Sản phẩm",
      field: "productName",
      key: "productName",
      sortable: true,
      body: (data) => (
        <div>
          <span className="fw-medium d-block">{data.productName}</span>
          {data.productCode !== "-" && (
            <small className="text-muted">Mã: {data.productCode}</small>
          )}
        </div>
      ),
    },
    {
      header: "Loại",
      field: "transactionType",
      key: "transactionType",
      sortable: true,
      body: (data) => {
        const badge =
          {
            IMPORT: { class: "bg-success", text: "Nhập kho" },
            EXPORT: { class: "bg-danger", text: "Xuất kho" },
            ADJUSTMENT: { class: "bg-warning", text: "Điều chỉnh" },
          }[data.transactionType] || { class: "bg-secondary", text: data.transactionType };
        return <span className={`badge ${badge.class} small`}>{badge.text}</span>;
      },
    },
    {
      header: "Số lượng",
      field: "quantity",
      key: "quantity",
      sortable: true,
      body: (data) => (
        <span className={data.quantity > 0 ? "text-success" : "text-danger"}>
          <strong>
            {data.quantity > 0 ? "+" : ""}
            {Math.abs(data.quantity)}
          </strong>
        </span>
      ),
    },
    {
      header: "Tham chiếu",
      field: "referenceType",
      key: "referenceType",
      sortable: true,
      body: (data) => {
        const map = {
          PURCHASE_ORDER: "Đơn nhập",
          SALES_ORDER: "Đơn bán (POS)",
          ADJUSTMENT: "Điều chỉnh kho",
        };
        const text = map[data.referenceType] || data.referenceType || "Không rõ";
        return (
          <small
            className={
              data.referenceType === "SALES_ORDER" ? "text-primary fw-bold" : "text-muted"
            }
          >
            {text}
          </small>
        );
      },
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
              onSubmit={e => {
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
                <CommonDateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Loại giao dịch
                </label>
                <CommonSelect
                  options={TransactionTypes}
                  value={TransactionTypes.find(
                    i => i.value === selectedTransactionType
                  )}
                  onChange={s => setSelectedTransactionType(s?.value || "")}
                  placeholder="Chọn loại"
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Loại tham chiếu
                </label>
                <CommonSelect
                  options={ReferenceTypes}
                  value={ReferenceTypes.find(
                    i => i.value === selectedReferenceType
                  )}
                  onChange={s => setSelectedReferenceType(s?.value || "")}
                  placeholder="Chọn loại"
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Tìm sản phẩm
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên hoặc mã sản phẩm"
                  value={searchProduct}
                  onChange={e => {
                    setSearchProduct(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách giao dịch{" "}
              <span className="text-muted small">({totalRecords} bản ghi)</span>
            </h5>
            <ul className="table-top-head">
              <TooltipIcons />
              <li>
                <Link to="#" className="text-muted">
                  <i className="ti ti-printer fs-5" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="card-body p-0">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mx-3 mt-3">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            {!loading && !error && listData.length === 0 && (
              <div className="text-center py-5 text-muted">
                <i className="ti ti-package fs-1 d-block mb-3" />
                <p>Không có giao dịch nào phù hợp với bộ lọc</p>
              </div>
            )}

            <PrimeDataTable
              column={columns}
              data={listData}
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalRecords={totalRecords}
              dataKey="key"
              loading={loading}
              serverSidePagination={false}
            />
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default TransactionHistory;