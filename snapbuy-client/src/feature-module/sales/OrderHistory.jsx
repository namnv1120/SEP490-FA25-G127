import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/CommonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getAllOrders } from "../../services/OrderService";
import { getAccountById } from "../../services/AccountService";
import OrderDetailModal from "../../core/modals/sales/OrderDetailModal";

const OrderHistory = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountNamesMap, setAccountNamesMap] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const OrderStatuses = [
    { value: "", label: "Tất cả" },
    { value: "Chờ xác nhận", label: "Chờ xác nhận" },
    { value: "Hoàn tất", label: "Hoàn tất" },
    { value: "Đã hủy", label: "Đã hủy" },
  ];

  // --- Tính tổng tiền đơn hàng ---
  const calculateTotal = (item) => {
    const possibleKeys = [
      "lineItems",
      "orderDetails",
      "items",
      "orderLines",
      "orderItems",
      "details",
    ];
    for (const key of possibleKeys) {
      const arr = item[key];
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.reduce((sum, li) => {
          const price =
            Number(li.price) || Number(li.unitPrice) || Number(li.amount) || 0;
          const qty =
            Number(li.quantity) || Number(li.qty) || Number(li.count) || 1;
          return sum + price * qty;
        }, 0);
      }
    }
    return Number(item.total) || 0;
  };

  const loadOrders = useCallback(async () => {
    if (isInitialLoad) setLoading(true);
    setError("");
    try {
      const params = {};
      if (debouncedSearchTerm?.trim())
        params.searchTerm = debouncedSearchTerm.trim();
      if (selectedStatus?.trim()) params.orderStatus = selectedStatus.trim();
      if (dateRange[0] && dateRange[1]) {
        const fromDate = new Date(dateRange[0]);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange[1]);
        toDate.setHours(23, 59, 59, 999);
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        params.from = formatDate(fromDate);
        params.to = formatDate(toDate);
      }

      const response = await getAllOrders(params);
      const allData = response?.content || response || [];
      if (!Array.isArray(allData))
        throw new Error("Dữ liệu trả về không đúng định dạng");

      // Chuẩn hóa dữ liệu
      const normalizedData = allData.map((item, index) => {
        const paymentMethod =
          item.payment?.paymentMethod ||
          item.paymentMethod ||
          (item.paymentStatus === "PAID" ||
          item.paymentStatus === "PAYMENT_COMPLETED"
            ? "Tiền mặt"
            : "-");
        return {
          key: item.orderId || `temp-${index}-${Date.now()}`,
          orderId: item.orderId || "-",
          orderNumber:
            item.orderNumber || `ORD-${String(index + 1).padStart(5, "0")}`,
          orderDate:
            item.orderDate ||
            item.createdDate ||
            item.createdAt ||
            item.date ||
            null,
          customerName: item.customerName || "Khách lẻ",
          accountId: item.accountId || null,
          orderStatus: item.orderStatus || "PENDING",
          paymentStatus: item.paymentStatus || "UNPAID",
          paymentMethod: paymentMethod,
          totalAmount: Number(item.totalAmount) || calculateTotal(item) || 0,
          rawData: item,
        };
      });

      // Lấy danh sách accountId duy nhất
      const uniqueAccountIds = [
        ...new Set(
          normalizedData.map((item) => item.accountId).filter(Boolean)
        ),
      ];

      const accountNames = {};
      await Promise.all(
        uniqueAccountIds.map(async (accountId) => {
          try {
            const account = await getAccountById(accountId);
            accountNames[accountId] =
              account.fullName || account.username || account.name || "-";
          } catch (err) {
            console.error(`Failed to fetch account ${accountId}:`, err);
            accountNames[accountId] = "-";
          }
        })
      );

      // Update normalizedData with account names (use accountName from backend if available, otherwise fetch)
      const dataWithAccountNames = normalizedData.map((item) => ({
        ...item,
        accountName:
          item.accountName ||
          (item.accountId ? accountNames[item.accountId] || "-" : "-"),
      }));

      // Sắp xếp theo ngày đặt hàng giảm dần (đơn mới nhất ở trên)
      const sortedData = [...dataWithAccountNames].sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        return dateB - dateA; // Giảm dần (mới nhất trước)
      });

      setAccountNamesMap(accountNames);
      setFilteredData(sortedData);

      setIsInitialLoad(false);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải dữ liệu đơn hàng."
      );
      setFilteredData([]);

      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedStatus, dateRange, isInitialLoad]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Hàm mở modal chi tiết
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Badge functions
  const getOrderStatusBadge = (status) => {
    const map = {
      "chờ xác nhận": { class: "bg-warning", text: "Chờ xác nhận" },
      "hoàn tất": { class: "bg-success", text: "Hoàn tất" },
      "đã hủy": { class: "bg-danger", text: "Đã hủy" },
      PENDING: { class: "bg-warning", text: "Chờ xác nhận" },
      COMPLETED: { class: "bg-success", text: "Hoàn tất" },
      CANCELLED: { class: "bg-danger", text: "Đã hủy" },
      CANCELED: { class: "bg-danger", text: "Đã hủy" },
    };
    const key = Object.keys(map).find(
      (k) => k.toLowerCase() === status?.toLowerCase()
    );
    return map[key] || { class: "bg-secondary", text: status || "Không rõ" };
  };

  const getPaymentStatusBadge = (status) => {
    const map = {
      "chưa thanh toán": { class: "bg-warning", text: "Chưa thanh toán" },
      "đã thanh toán": { class: "bg-success", text: "Đã thanh toán" },
      UNPAID: { class: "bg-warning", text: "Chưa thanh toán" },
      PAID: { class: "bg-success", text: "Đã thanh toán" },
      PAYMENT_COMPLETED: { class: "bg-success", text: "Đã thanh toán" },
    };
    const key = Object.keys(map).find(
      (k) => k.toLowerCase() === status?.toLowerCase()
    );
    return map[key] || { class: "bg-secondary", text: status || "Không rõ" };
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
  }, [filteredData]);

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
          <input type="checkbox" data-id={data.orderId} />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Mã đơn",
      field: "orderNumber",
      key: "orderNumber",
      sortable: true,
      body: (data) => (
        <span
          className="text-primary fw-medium small cursor-pointer"
          onClick={() => handleViewDetail(data)}
          style={{ cursor: "pointer" }}
        >
          {data.orderNumber}
        </span>
      ),
    },
    {
      header: "Tên khách hàng",
      field: "customerName",
      key: "customerName",
      sortable: true,
      body: (data) => <span className="fw-medium">{data.customerName}</span>,
    },
    {
      header: "Người tạo đơn",
      field: "accountName",
      key: "accountName",
      sortable: true,
      body: (data) => (
        <span className="text-muted">{data.accountName || "-"}</span>
      ),
    },
    {
      header: "Ngày đặt hàng",
      field: "orderDate",
      key: "orderDate",
      sortable: true,
      body: (data) =>
        data.orderDate
          ? new Date(data.orderDate).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      header: "Trạng thái đơn",
      field: "orderStatus",
      key: "orderStatus",
      sortable: true,
      body: (data) => {
        const badge = getOrderStatusBadge(data.orderStatus);
        return (
          <span className={`badge ${badge.class} small`}>{badge.text}</span>
        );
      },
    },
    {
      header: "Trạng thái thanh toán",
      field: "paymentStatus",
      key: "paymentStatus",
      sortable: true,
      body: (data) => {
        const badge = getPaymentStatusBadge(data.paymentStatus);
        return (
          <span className={`badge ${badge.class} small`}>{badge.text}</span>
        );
      },
    },
    {
      header: "Hình thức",
      field: "paymentMethod",
      key: "paymentMethod",
      sortable: true,
      body: (data) => {
        const method = (data.paymentMethod || "-").toString();
        const map = {
          CASH: "Tiền mặt",
          MOMO: "Ví MoMo",
          "TIỀN MẶT": "Tiền mặt",
          BANK_TRANSFER: "Chuyển khoản",
        };
        return (
          <span className="text-muted">
            {map[method.toUpperCase()] || method}
          </span>
        );
      },
    },
    {
      header: "Tổng tiền",
      field: "totalAmount",
      key: "totalAmount",
      sortable: true,
      body: (data) => {
        const amount = Number(data.totalAmount);
        return amount > 0 ? (
          <strong className="text-success">
            {amount.toLocaleString("vi-VN")} ₫
          </strong>
        ) : (
          <span className="text-muted small">0 ₫</span>
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
              <h4>Lịch Sử Đơn Hàng</h4>
              <h6>Theo dõi các đơn hàng đã đặt và xử lý</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <RefreshIcon onClick={loadOrders} loading={loading} />
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
                loadOrders();
              }}
              className="row g-3 align-items-end"
            >
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Thời gian tạo đơn
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
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Trạng thái
                </label>
                <CommonSelect
                  options={OrderStatuses}
                  value={OrderStatuses.find(
                    (item) => item.value === selectedStatus
                  )}
                  onChange={(selected) =>
                    setSelectedStatus(selected?.value || "")
                  }
                  placeholder="Chọn trạng thái"
                  className="w-100"
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3 ms-auto">
                <label className="form-label fw-semibold text-dark mb-1">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo mã đơn, tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Bảng */}
        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách đơn hàng{" "}
              <span className="text-muted small">
                ({filteredData.length} bản ghi)
              </span>
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
            <PrimeDataTable
              column={columns}
              data={filteredData}
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalRecords={filteredData.length}
              dataKey="key"
              loading={loading && !isInitialLoad}
              serverSidePagination={false}
            />
          </div>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      <OrderDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        order={selectedOrder}
        accountNamesMap={accountNamesMap}
      />

      <CommonFooter />
    </div>
  );
};

export default OrderHistory;
