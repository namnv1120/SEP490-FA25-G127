import { useState, useEffect, useCallback } from "react";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import { getAllOrders, cancelOrder } from "../../services/OrderService";
import { getAccountById, getMyInfo } from "../../services/AccountService";
import OrderDetailModal from "../../core/modals/sales/OrderDetailModal";
import { message, Spin, Modal } from "antd";

const OrderHistory = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountNamesMap, setAccountNamesMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [_actionLoading, setActionLoading] = useState(false);

  const OrderStatuses = [
    { value: "", label: "Tất cả" },
    { value: "Chờ xác nhận", label: "Chờ xác nhận" },
    { value: "Hoàn tất", label: "Hoàn tất" },
    { value: "Đã hủy", label: "Đã hủy" },
  ];

  const PaymentStatuses = [
    { value: "", label: "Tất cả" },
    { value: "Chưa thanh toán", label: "Chưa thanh toán" },
    { value: "Đã thanh toán", label: "Đã thanh toán" },
    { value: "Thất bại", label: "Thất bại" },
    { value: "Đã hoàn tiền", label: "Đã hoàn tiền" },
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
    setLoading(true);
    setError("");
    try {
      // Get current user info and role
      const userInfo = await getMyInfo();
      const currentUser = userInfo.result || userInfo;
      const currentUserId = currentUser?.id;
      const currentUserRole = localStorage.getItem("role");

      // Check if user is owner or admin
      const isOwnerOrAdmin =
        currentUserRole === "Chủ cửa hàng" ||
        currentUserRole === "Quản trị viên";

      const params = {};
      if (searchTerm?.trim()) params.searchTerm = searchTerm.trim();
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

      // FILTER THEO ROLE: Nhân viên chỉ thấy đơn của mình, Owner/Admin thấy tất cả
      let filteredByRole = normalizedData;
      if (!isOwnerOrAdmin && currentUserId) {
        filteredByRole = normalizedData.filter(
          (order) => order.accountId === currentUserId
        );
      }

      // Lấy danh sách accountId duy nhất
      const uniqueAccountIds = [
        ...new Set(
          filteredByRole.map((item) => item.accountId).filter(Boolean)
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
      const dataWithAccountNames = filteredByRole.map((item) => ({
        ...item,
        accountName:
          item.accountName ||
          (item.accountId ? accountNames[item.accountId] || "-" : "-"),
      }));

      // Filter theo payment status (client-side)
      let filteredByPaymentStatus = dataWithAccountNames;
      if (selectedPaymentStatus?.trim()) {
        filteredByPaymentStatus = dataWithAccountNames.filter((item) => {
          const paymentStatus = (item.paymentStatus || "").toLowerCase();
          const selectedPayment = selectedPaymentStatus.toLowerCase();

          // Map các giá trị tiếng Anh sang tiếng Việt
          const statusMap = {
            unpaid: "chưa thanh toán",
            paid: "đã thanh toán",
            payment_completed: "đã thanh toán",
            pending: "chưa thanh toán",
          };

          const normalizedPaymentStatus =
            statusMap[paymentStatus] || paymentStatus;
          return normalizedPaymentStatus === selectedPayment;
        });
      }

      // Sắp xếp theo ngày đặt hàng giảm dần (đơn mới nhất ở trên)
      const sortedData = [...filteredByPaymentStatus].sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        return dateB - dateA; // Giảm dần (mới nhất trước)
      });

      setAccountNamesMap(accountNames);
      setFilteredData(sortedData);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải dữ liệu đơn hàng."
      );
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedPaymentStatus, dateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedPaymentStatus("");
    setDateRange([null, null]);
    setCurrentPage(1);
    message.success("Đã làm mới lịch sử đơn hàng thành công!");
  };

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
      "chờ hoàn hàng": { class: "bg-warning text-dark", text: "Chờ hoàn hàng" },
      "đã hủy": { class: "bg-danger", text: "Đã hủy" },
      "trả hàng": { class: "bg-info", text: "Trả hàng" },
      PENDING: { class: "bg-warning", text: "Chờ xác nhận" },
      COMPLETED: { class: "bg-success", text: "Hoàn tất" },
      CANCELLED: { class: "bg-danger", text: "Đã hủy" },
      CANCELED: { class: "bg-danger", text: "Đã hủy" },
      RETURNED: { class: "bg-info", text: "Trả hàng" },
      PENDING_RETURN: { class: "bg-warning text-dark", text: "Chờ hoàn hàng" },
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
      "thất bại": { class: "bg-danger", text: "Thất bại" },
      "đã hoàn tiền": { class: "bg-info", text: "Đã hoàn tiền" },
      UNPAID: { class: "bg-warning", text: "Chưa thanh toán" },
      PAID: { class: "bg-success", text: "Đã thanh toán" },
      PAYMENT_COMPLETED: { class: "bg-success", text: "Đã thanh toán" },
    };
    const key = Object.keys(map).find(
      (k) => k.toLowerCase() === status?.toLowerCase()
    );
    return map[key] || { class: "bg-secondary", text: status || "Không rõ" };
  };

  // Reset select-all checkbox và tất cả checkbox khi chuyển trang
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }
    // Uncheck tất cả checkbox khi chuyển trang
    const checkboxes = document.querySelectorAll(
      '.table-list-card input[type="checkbox"][data-id]'
    );
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });
  }, [currentPage]);

  // Handle select-all checkbox (giống PurchaseOrder.jsx)
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

    // Cleanup function to remove event listener
    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAll);
      }
    };
  }, [filteredData, currentPage]);

  // Normalize order ID to string
  const normalizeOrderId = (orderId) => {
    if (!orderId || orderId === "-") return null;
    const id = orderId.toString().trim();
    return id || null;
  };

  // Get selected orders data (giống PurchaseOrder.jsx - query từ DOM)
  const getSelectedOrders = () => {
    const checkboxes = document.querySelectorAll(
      '.table-list-card input[type="checkbox"][data-id]:checked'
    );
    const selectedIds = new Set();

    checkboxes.forEach((cb) => {
      const id = cb.getAttribute("data-id");
      if (id) selectedIds.add(id);
    });

    return filteredData.filter((order) => {
      const orderId = normalizeOrderId(order.orderId);
      if (!orderId) return false;
      return (
        selectedIds.has(orderId) ||
        selectedIds.has(order.orderId?.toString()) ||
        selectedIds.has(order.orderId)
      );
    });
  };

  // Handle cancel orders
  const _handleCancelOrders = async () => {
    const selected = getSelectedOrders();
    if (selected.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng để hủy!");
      return;
    }

    // Phân loại đơn hợp lệ và không hợp lệ
    const validOrders = [];
    const invalidOrders = [];

    selected.forEach((order) => {
      const paymentStatus = order.paymentStatus?.toLowerCase() || "";
      const orderStatus = order.orderStatus?.toLowerCase() || "";

      // Chỉ có thể hủy đơn chưa thanh toán hoặc chờ xác nhận
      if (
        paymentStatus === "chưa thanh toán" ||
        paymentStatus === "unpaid" ||
        orderStatus === "chờ xác nhận" ||
        orderStatus === "pending"
      ) {
        validOrders.push(order);
      } else {
        invalidOrders.push(
          `${order.orderNumber} (${order.orderStatus || "N/A"})`
        );
      }
    });

    // Hiển thị cảnh báo cho các đơn không hợp lệ
    if (invalidOrders.length > 0) {
      message.warning({
        content: (
          <div>
            <p>Không thể hủy các đơn sau:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {invalidOrders.slice(0, 5).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
              {invalidOrders.length > 5 && (
                <li>... và {invalidOrders.length - 5} đơn khác</li>
              )}
            </ul>
          </div>
        ),
        duration: 5,
      });
    }

    if (validOrders.length === 0) {
      // message.error("Không có đơn hàng nào có thể hủy!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy đơn",
      content: `Bạn có chắc chắn muốn hủy ${validOrders.length} đơn hàng đã chọn?`,
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        let successCount = 0;
        let errorCount = 0;
        const errorMessages = [];

        for (const order of validOrders) {
          try {
            await cancelOrder(order.orderId);
            successCount++;
          } catch (err) {
            errorCount++;
            const errorMsg =
              err.response?.data?.message ||
              err.message ||
              "Lỗi không xác định";
            errorMessages.push(`${order.orderNumber}: ${errorMsg}`);
          }
        }

        if (successCount > 0) {
          message.success(`Đã hủy ${successCount} đơn hàng thành công!`);
        }
        if (errorCount > 0) {
          message.error({
            content: (
              <div>
                <p>Có {errorCount} đơn hàng xử lý thất bại:</p>
                <ul
                  style={{
                    marginTop: 8,
                    paddingLeft: 20,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {errorMessages.slice(0, 5).map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                  {errorMessages.length > 5 && (
                    <li>... và {errorMessages.length - 5} lỗi khác</li>
                  )}
                </ul>
              </div>
            ),
            duration: 8,
          });
        }

        // Uncheck all checkboxes (giống PurchaseOrder.jsx)
        document
          .querySelectorAll('.table-list-card input[type="checkbox"]:checked')
          .forEach((cb) => {
            cb.checked = false;
          });

        await loadOrders();
        setActionLoading(false);
      },
    });
  };

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: (data) => {
        const orderId = normalizeOrderId(data.orderId);
        if (!orderId) return null;

        return (
          <label className="checkboxs">
            <input type="checkbox" data-id={orderId} />
            <span className="checkmarks" />
          </label>
        );
      },
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
              <h4 className="fw-bold">Lịch Sử Đơn Hàng</h4>
              <h6>Theo dõi các đơn hàng đã đặt và xử lý</h6>
            </div>
          </div>
          <TableTopHead
            onRefresh={handleRefresh}
            showExcel={false}
            showMail={false}
          />
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
              <div className="col-12 col-md-6 col-lg-3 ms-auto">
                <label className="form-label fw-semibold text-dark mb-1">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mã đơn, tên khách..."
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
            <div className="d-flex align-items-end gap-3">
              <div>
                <CommonSelect
                  options={OrderStatuses}
                  value={OrderStatuses.find(
                    (item) => item.value === selectedStatus
                  )}
                  onChange={(selected) =>
                    setSelectedStatus(selected?.value || "")
                  }
                  placeholder="Chọn trạng thái đơn"
                  className="w-100"
                />
              </div>
              <div>
                <CommonSelect
                  options={PaymentStatuses}
                  value={PaymentStatuses.find(
                    (item) => item.value === selectedPaymentStatus
                  )}
                  onChange={(selected) =>
                    setSelectedPaymentStatus(selected?.value || "")
                  }
                  placeholder="Chọn trạng thái thanh toán"
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
                data={filteredData}
                rows={rows}
                setRows={setRows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={filteredData.length}
                dataKey="key"
                loading={loading}
                serverSidePagination={false}
              />
            )}
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
