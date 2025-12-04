import React, { useState, useEffect, useMemo, useCallback } from "react";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import { getTransactions } from "../../services/InventoryTransactionsService";
import { message, Spin } from "antd";

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
      { value: "Nhập kho", label: "Nhập kho" },
      { value: "Bán ra", label: "Bán ra" },
      { value: "Trả hàng", label: "Trả hàng" },
    ],
    []
  );

  const ReferenceTypes = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      { value: "Phiếu nhập hàng", label: "Phiếu nhập hàng" },
      { value: "Đơn hàng", label: "Đơn hàng" },
    ],
    []
  );

  const dateRangeKey = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return "null";
    return `${dateRange[0]?.getTime() || ""}-${dateRange[1]?.getTime() || ""}`;
  }, [dateRange]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Format date range cho LocalDateTime (giữ nguyên local timezone)
      let from = null;
      let to = null;
      if (dateRange[0] && dateRange[1]) {
        const startDate = new Date(dateRange[0]);
        startDate.setHours(0, 0, 0, 0);
        // Format theo local timezone thay vì UTC
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        from = formatDate(startDate);

        const endDate = new Date(dateRange[1]);
        endDate.setHours(23, 59, 59, 999);
        to = formatDate(endDate);
      }

      const params = {
        page: currentPage - 1,
        size: rows,
        sort: "transactionDate",
        dir: "DESC",
        ...(searchProduct.trim() && { productName: searchProduct.trim() }),
        ...(selectedTransactionType && {
          transactionType: selectedTransactionType,
        }),
        ...(selectedReferenceType && { referenceType: selectedReferenceType }),
        ...(from && { from }),
        ...(to && { to }),
      };

      const { content, totalElements } = await getTransactions(params);

      const normalizedData = content.map((item, index) => {
        const parsedDate = item.transactionDate
          ? new Date(item.transactionDate)
          : null;

        const uniqueKey =
          item.transactionId ||
          `fallback-${index}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        return {
          key: uniqueKey,
          transactionType: item.transactionType || "UNKNOWN",
          productName: item.productName || "Không xác định",
          quantity: Number(item.quantity) || 0,
          transactionDate:
            parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null,
          referenceType: item.referenceType || "-",
          note: item.notes || "-",
        };
      });

      setListData(normalizedData);
      setTotalRecords(totalElements);
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

  // Load data khi currentPage hoặc các filter thay đổi
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = () => {
    setSearchProduct("");
    setSelectedTransactionType("");
    setSelectedReferenceType("");
    setDateRange([null, null]);
    setCurrentPage(1);
    message.success("Đã làm mới lịch sử giao dịch kho thành công!");
  };

  // Handle select-all checkbox
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all");

    const handleSelectAll = (e) => {
      const checkboxes = document.querySelectorAll(
        '.table-list-card input[type="checkbox"][data-id]'
      );
      checkboxes.forEach((cb) => {
        cb.checked = e.target.checked;
      });
    };

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", handleSelectAll);
    }

    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAll);
      }
    };
  }, [listData]);

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: (data) => (
        <label className="checkboxs">
          <input type="checkbox" data-id={data.key} />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Loại",
      field: "transactionType",
      key: "transactionType",
      sortable: true,
      body: (data) => {
        const badge = {
          "Nhập kho": { class: "bg-success text-white", text: "Nhập kho" },
          "Bán ra": { class: "bg-danger text-white", text: "Bán ra" },
          "Trả hàng": { class: "bg-info text-white", text: "Trả hàng" },
        }[data.transactionType] || {
          class: "bg-secondary text-white",
          text: data.transactionType || "Không xác định",
        };
        return (
          <span className={`badge ${badge.class} small`}>{badge.text}</span>
        );
      },
    },
    {
      header: "Sản phẩm",
      field: "productName",
      key: "productName",
      sortable: true,
      body: (data) => <span className="fw-medium">{data.productName}</span>,
    },
    {
      header: "Số lượng",
      field: "quantity",
      key: "quantity",
      sortable: true,
      body: (data) => {
        // Nhập kho và Trả hàng -> hiển thị dấu +
        // Bán ra -> hiển thị dấu -
        let sign = "";
        let textColor = "";

        if (
          data.transactionType === "Nhập kho" ||
          data.transactionType === "Trả hàng"
        ) {
          sign = "+";
          textColor = "text-success";
        } else if (data.transactionType === "Bán ra") {
          sign = "-";
          textColor = "text-danger";
        } else {
          // Trường hợp khác: dựa vào giá trị quantity
          sign = data.quantity >= 0 ? "+" : "-";
          textColor = data.quantity >= 0 ? "text-success" : "text-danger";
        }

        return (
          <span className={textColor}>
            <strong>
              {sign}
              {Math.abs(data.quantity)}
            </strong>
          </span>
        );
      },
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
      header: "Tham chiếu",
      field: "referenceType",
      key: "referenceType",
      sortable: true,
      body: (data) => {
        const text = data.referenceType || "Không rõ";
        let className = "text-muted";
        if (data.referenceType === "Đơn hàng") {
          className = "text-primary fw-bold";
        } else if (data.referenceType === "Phiếu nhập hàng") {
          className = "text-success fw-bold";
        }
        return <small className={className}>{text}</small>;
      },
    },
    {
      header: "Ghi chú",
      field: "note",
      key: "note",
      sortable: true,
      body: (data) => <small className="text-muted">{data.note}</small>,
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Lịch Sử Giao Dịch Kho</h4>
              <h6>Theo dõi nhập, xuất, điều chỉnh hàng tồn</h6>
            </div>
          </div>
          <TableTopHead
            onRefresh={handleRefresh}
            showExcel={false}
            showMail={false}
          />
        </div>

        <div className="card mb-3 shadow-sm">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Khoảng thời gian
                </label>
                <CommonDateRangePicker
                  value={dateRange}
                  onChange={(newRange) => {
                    setDateRange(newRange);
                    setCurrentPage(1);
                  }}
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3 ms-auto">
                <label className="form-label fw-semibold text-dark mb-1">
                  Tìm sản phẩm
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên hoặc mã sản phẩm"
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách giao dịch{" "}
              <span className="text-muted small">({totalRecords} bản ghi)</span>
            </h5>
            <div className="d-flex align-items-end gap-3">
              <div>
                <CommonSelect
                  options={TransactionTypes}
                  value={TransactionTypes.find(
                    (i) => i.value === selectedTransactionType
                  )}
                  onChange={(s) => {
                    setSelectedTransactionType(s?.value || "");
                    setCurrentPage(1);
                  }}
                  placeholder="Chọn loại giao dịch"
                  className="w-100"
                />
              </div>
              <div>
                <CommonSelect
                  options={ReferenceTypes}
                  value={ReferenceTypes.find(
                    (i) => i.value === selectedReferenceType
                  )}
                  onChange={(s) => {
                    setSelectedReferenceType(s?.value || "");
                    setCurrentPage(1);
                  }}
                  placeholder="Chọn loại tham chiếu"
                  className="w-100"
                />
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mx-3 mt-3">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <Spin size="large" />
              </div>
            ) : (
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
                serverSidePagination={true}
              />
            )}
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default TransactionHistory;
