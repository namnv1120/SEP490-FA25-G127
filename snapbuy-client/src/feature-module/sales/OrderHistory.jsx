import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getAllOrders } from "../../services/OrderService";
import { getAccountById } from "../../services/AccountService";

const OrderHistory = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountNamesMap, setAccountNamesMap] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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
            Number(li.price) ||
            Number(li.unitPrice) ||
            Number(li.amount) ||
            0;
          const qty =
            Number(li.quantity) ||
            Number(li.qty) ||
            Number(li.count) ||
            1;
          return sum + price * qty;
        }, 0);
      }
    }
    return Number(item.total) || 0;
  };

  const loadOrders = async () => {
    // Chỉ set loading cho lần đầu tiên, không set khi filter/search
    if (isInitialLoad) {
      setLoading(true);
    }
    setError("");
    try {
      // Chuẩn bị params cho API search
      const params = {};

      // Thêm searchTerm nếu có
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.searchTerm = debouncedSearchTerm.trim();
      }

      // Thêm orderStatus nếu có
      if (selectedStatus && selectedStatus.trim()) {
        params.orderStatus = selectedStatus.trim();
      }

      // Thêm date range nếu có
      if (dateRange[0] && dateRange[1]) {
        const fromDate = new Date(dateRange[0]);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange[1]);
        toDate.setHours(23, 59, 59, 999);

        // Format date as YYYY-MM-DD theo local timezone (không dùng toISOString vì nó convert sang UTC)
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        params.from = formatDate(fromDate);
        params.to = formatDate(toDate);
      }

      // Gọi API với params
      const response = await getAllOrders(params);
      const allData = response?.content || response || [];

      if (!Array.isArray(allData)) throw new Error("Dữ liệu trả về không đúng định dạng");

      const normalizedData = allData.map((item, index) => {
        // Lấy payment method từ payment object hoặc trực tiếp
        const paymentMethod = item.payment?.paymentMethod ||
          item.paymentMethod ||
          (item.paymentStatus === "PAID" || item.paymentStatus === "PAYMENT_COMPLETED" ? "Tiền mặt" : "-");

        return {
          key: item.orderId || `temp-${index}-${Date.now()}`,
          orderId: item.orderId || "-",
          orderNumber: item.orderNumber || `ORD-${String(index + 1).padStart(5, "0")}`,
          orderDate: item.orderDate || item.createdDate || item.createdAt || item.date || null,
          customerName: item.customerName || "Khách lẻ",
          accountId: item.accountId || null,
          orderStatus: item.orderStatus || "PENDING",
          paymentStatus: item.paymentStatus || "UNPAID",
          paymentMethod: paymentMethod,
          totalAmount: Number(item.totalAmount) || calculateTotal(item) || 0,
        };
      });

      // Fetch account names for all unique accountIds
      const uniqueAccountIds = [...new Set(normalizedData.map(item => item.accountId).filter(Boolean))];
      const accountNames = {};

      // Fetch account names in parallel
      await Promise.all(
        uniqueAccountIds.map(async (accountId) => {
          try {
            const account = await getAccountById(accountId);
            accountNames[accountId] = account.fullName || account.username || "-";
          } catch (err) {
            console.error(`Failed to fetch account ${accountId}:`, err);
            accountNames[accountId] = "-";
          }
        })
      );

      // Update normalizedData with account names
      const dataWithAccountNames = normalizedData.map(item => ({
        ...item,
        createdBy: item.accountId ? (accountNames[item.accountId] || "-") : "-",
      }));

      setAccountNamesMap(accountNames);
      setFilteredData(dataWithAccountNames);
      setTotalRecords(dataWithAccountNames.length);
      setIsInitialLoad(false);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Không thể tải dữ liệu đơn hàng. Vui lòng thử lại."
      );
      setFilteredData([]);
      setTotalRecords(0);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounce searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Tạo key từ dateRange để trigger useEffect
  const dateRangeKey = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      return `${dateRange[0]?.getTime() || ''}-${dateRange[1]?.getTime() || ''}`;
    }
    return 'no-date';
  }, [dateRange]);

  // Effect để trigger loadOrders khi các filter thay đổi
  useEffect(() => {
    loadOrders();
  }, [currentPage, rows, selectedStatus, debouncedSearchTerm, dateRangeKey]);

  // Hàm lấy badge cho Order Status
  const getOrderStatusBadge = (status) => {
    if (!status) return { class: "bg-secondary", text: "Không rõ" };

    const statusLower = status.toLowerCase().trim();
    const statusUpper = status.toUpperCase().trim();

    // Order Status mapping (tiếng Việt và tiếng Anh)
    const orderStatusMap = {
      // Tiếng Việt
      "chờ xác nhận": { class: "bg-warning", text: "Chờ xác nhận" },
      "chờ xử lý": { class: "bg-info", text: "Chờ xử lý" },
      "hoàn tất": { class: "bg-success", text: "Hoàn tất" },
      "đã hủy": { class: "bg-danger", text: "Đã hủy" },
      // Tiếng Anh
      "PENDING": { class: "bg-warning", text: "Chờ xác nhận" },
      "CONFIRMED": { class: "bg-primary", text: "Đã xác nhận" },
      "COMPLETED": { class: "bg-success", text: "Hoàn tất" },
      "CANCELLED": { class: "bg-danger", text: "Đã hủy" },
      "CANCELED": { class: "bg-danger", text: "Đã hủy" },
    };

    return orderStatusMap[statusLower] ||
      orderStatusMap[statusUpper] ||
      { class: "bg-secondary", text: status };
  };

  // Hàm lấy badge cho Payment Status
  const getPaymentStatusBadge = (status) => {
    if (!status) return { class: "bg-secondary", text: "Không rõ" };

    const statusLower = status.toLowerCase().trim();
    const statusUpper = status.toUpperCase().trim();

    // Payment Status mapping (tiếng Việt và tiếng Anh)
    const paymentStatusMap = {
      // Tiếng Việt
      "chưa thanh toán": { class: "bg-warning", text: "Chưa thanh toán" },
      "đã thanh toán": { class: "bg-success", text: "Đã thanh toán" },
      "đã hoàn tiền": { class: "bg-info", text: "Đã hoàn tiền" },
      "thất bại": { class: "bg-danger", text: "Thất bại" },
      // Tiếng Anh
      "UNPAID": { class: "bg-warning", text: "Chưa thanh toán" },
      "PENDING": { class: "bg-warning", text: "Chưa thanh toán" },
      "PAID": { class: "bg-success", text: "Đã thanh toán" },
      "PAYMENT_COMPLETED": { class: "bg-success", text: "Đã thanh toán" },
      "REFUNDED": { class: "bg-info", text: "Đã hoàn tiền" },
      "FAILED": { class: "bg-danger", text: "Thất bại" },
      "PARTIAL": { class: "bg-info", text: "Thanh toán một phần" },
    };

    return paymentStatusMap[statusLower] ||
      paymentStatusMap[statusUpper] ||
      { class: "bg-secondary", text: status };
  };

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
      header: "Mã đơn",
      field: "orderNumber",
      key: "orderNumber",
      sortable: true,
      body: (data) => (
        <Link to="#" className="text-primary fw-medium small">
          {data.orderNumber}
        </Link>
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
      field: "createdBy",
      key: "createdBy",
      sortable: true,
      body: (data) => <span className="text-muted">{data.createdBy}</span>,
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
        const methodUpper = method.toUpperCase();
        const methodMap = {
          "CASH": "Tiền mặt",
          "MOMO": "Ví điện tử MoMo",
          "VÍ ĐIỆN TỬ": "Ví điện tử MoMo",
          "TIỀN MẶT": "Tiền mặt",
          "CARD": "Thẻ",
          "BANK_TRANSFER": "Chuyển khoản",
          "BANKTRANSFER": "Chuyển khoản",
        };
        // Check both uppercase and original method
        const displayMethod = methodMap[methodUpper] ||
          methodMap[method] ||
          (method === "-" ? "-" : method);
        return <span className="text-muted">{displayMethod}</span>;
      },
    },
    {
      header: "Tổng tiền",
      field: "totalAmount",
      key: "totalAmount",
      sortable: true,
      body: (data) => {
        const amount = Number(data.totalAmount);
        if (isNaN(amount) || amount <= 0)
          return <span className="text-muted small">0 ₫</span>;
        return (
          <strong className="text-success">
            {amount.toLocaleString("vi-VN")} ₫
          </strong>
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

        {/* Bộ lọc và tìm kiếm */}
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
                  placeholder="Tìm theo mã đơn, tên khách hàng, tên người tạo đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách đơn hàng{" "}
              <span className="text-muted small">({filteredData.length} bản ghi)</span>
            </h5>
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

      <CommonFooter />
    </div>
  );
};

export default OrderHistory;