import { useState, useEffect, useCallback } from "react";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import {
  getReturnOrders,
  cancelOrder,
  markOrderForReturn,
  revertReturnStatus,
} from "../../services/OrderService";
import { getAccountById } from "../../services/AccountService";
import OrderDetailModal from "../../core/modals/sales/OrderDetailModal";
import SelectOrdersForReturnModal from "../../core/modals/sales/SelectOrdersForReturnModal";
import { message, Spin, Modal } from "antd";

const ReturnOrder = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountNamesMap, setAccountNamesMap] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const OrderStatuses = [
    { value: "", label: "Tất cả" },
    { value: "Chờ hoàn hàng", label: "Chờ hoàn hàng" },
    { value: "Trả hàng", label: "Trả hàng" },
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

      const response = await getReturnOrders(params);
      const allData = response?.content || response || [];
      if (!Array.isArray(allData))
        throw new Error("Dữ liệu trả về không đúng định dạng");

      // HIỂN THỊ ĐƠN "CHờ HOÀN HÀNG" VÀ "TRẢ HÀNG"
      const returnedOrders = allData.filter((item) => {
        const status = (item.orderStatus || "").toLowerCase();
        return (
          status === "chờ hoàn hàng" ||
          status === "trả hàng" ||
          status === "returned" ||
          status === "pending_return"
        );
      });

      // Chuẩn hóa dữ liệu
      const normalizedData = returnedOrders.map((item, index) => {
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
          updatedDate: item.updatedDate || null,
          returnDate: item.updatedDate || null,
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

      // Update normalizedData with account names
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
  }, [searchTerm, selectedStatus, dateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setDateRange([null, null]);
    setCurrentPage(1);
    message.success("Đã làm mới danh sách đơn hoàn hàng thành công!");
  };

  // Hàm mở modal chi tiết
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Hàm xử lý hoàn hàng
  const handleReturnOrders = async (selectedOrders) => {
    if (selectedOrders.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng để hoàn!");
      return;
    }

    setActionLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errorMessages = [];

    for (const order of selectedOrders) {
      try {
        // Use markOrderForReturn API to mark order as pending return
        await markOrderForReturn(order.orderId);
        successCount++;
      } catch (err) {
        errorCount++;
        const errorMsg =
          err.response?.data?.message || err.message || "Lỗi không xác định";
        errorMessages.push(`${order.orderNumber}: ${errorMsg}`);
      }
    }

    if (successCount > 0) {
      message.success(`Đã đánh dấu ${successCount} đơn hàng chờ hoàn!`);
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

    await loadOrders();
    setActionLoading(false);
    setShowSelectModal(false);
  };

  // Hàm xác nhận hoàn đơn (gọi API cancel)
  const handleConfirmReturn = (order) => {
    Modal.confirm({
      title: "Xác nhận hoàn đơn hàng",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn hoàn đơn hàng{" "}
            <strong>{order.orderNumber}</strong>?
          </p>
          <p className="text-muted mb-0">
            <small>Thao tác này sẽ:</small>
          </p>
          <ul className="text-muted small mb-0">
            <li>Trả hàng về kho</li>
            <li>Hoàn tiền cho khách hàng</li>
            <li>Điều chỉnh điểm tích lũy</li>
          </ul>
        </div>
      ),
      okText: "Xác nhận hoàn",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          setActionLoading(true);
          await cancelOrder(order.orderId);
          message.success(`Đã hoàn đơn hàng ${order.orderNumber} thành công!`);
          await loadOrders();
        } catch (err) {
          const errorMsg =
            err.response?.data?.message || err.message || "Lỗi không xác định";
          message.error(`Không thể hoàn đơn: ${errorMsg}`);
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Hàm xóa phiếu hoàn hàng (chỉ với phiếu chờ hoàn)
  const handleDeleteReturn = (order) => {
    Modal.confirm({
      title: "Xóa phiếu hoàn hàng",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa phiếu hoàn hàng{" "}
            <strong>{order.orderNumber}</strong>?
          </p>
          <p className="text-muted mb-0">
            <small>
              Phiếu sẽ được chuyển về trạng thái "Hoàn tất" ban đầu.
            </small>
          </p>
        </div>
      ),
      okText: "Xóa phiếu",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          setActionLoading(true);
          await revertReturnStatus(order.orderId);
          message.success(`Đã xóa phiếu hoàn hàng ${order.orderNumber}!`);
          await loadOrders();
        } catch (err) {
          const errorMsg =
            err.response?.data?.message || err.message || "Lỗi không xác định";
          message.error(`Không thể xóa phiếu: ${errorMsg}`);
        } finally {
          setActionLoading(false);
        }
      },
    });
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

  // Reset select-all checkbox và tất cả checkbox khi chuyển trang
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all-returns");
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

  // Handle select-all checkbox
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all-returns");

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

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all-returns" />
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
      key: "checkbox",
    },
    {
      header: "Mã đơn",
      field: "orderNumber",
      key: "orderNumber",
      sortable: true,
      body: (data) => (
        <span
          className="text-primary fw-medium cursor-pointer"
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
      header: "Ngày tạo phiếu trả hàng",
      field: "updatedDate",
      key: "updatedDate",
      sortable: true,
      body: (data) => {
        // Hiển thị updatedDate - thời gian cập nhật trạng thái đơn
        // (thời gian đánh dấu chờ hoàn hoặc thời gian hoàn đơn thực sự)
        return data.updatedDate
          ? new Date(data.updatedDate).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";
      },
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
      header: "",
      key: "actions",
      sortable: false,
      body: (data) => {
        const isPendingReturn =
          data.orderStatus.toLowerCase() === "chờ hoàn hàng" ||
          data.orderStatus.toLowerCase() === "pending_return";

        const isReturned =
          data.orderStatus.toLowerCase() === "trả hàng" ||
          data.orderStatus.toLowerCase() === "returned";

        return (
          <div className="d-flex gap-2">
            {isPendingReturn ? (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleConfirmReturn(data)}
                  disabled={actionLoading}
                  title="Xác nhận hoàn đơn"
                >
                  <i className="ti ti-check" />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteReturn(data)}
                  disabled={actionLoading}
                  title="Xóa phiếu hoàn hàng"
                >
                  <i className="ti ti-trash" />
                </button>
              </>
            ) : isReturned ? (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleViewDetail(data)}
                title="Xem chi tiết"
              >
                <i className="ti ti-eye" />
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleViewDetail(data)}
                title="Xem chi tiết"
              >
                <i className="ti ti-eye" />
              </button>
            )}
          </div>
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
              <h4 className="fw-bold">Đơn Hoàn Hàng</h4>
              <h6>Quản lý các đơn hàng cần hoàn trả</h6>
            </div>
          </div>
          <TableTopHead
            onRefresh={handleRefresh}
            showExcel={false}
            showMail={false}
          />
          <div className="page-btn d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowSelectModal(true)}
              disabled={actionLoading}
            >
              <i className="ti ti-circle-plus me-1" />
              Tạo đơn hoàn hàng
            </button>
          </div>
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
                  Thời gian tạo phiếu trả hàng
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

      {/* Modal chọn đơn để hoàn */}
      <SelectOrdersForReturnModal
        show={showSelectModal}
        onHide={() => setShowSelectModal(false)}
        onConfirm={handleReturnOrders}
      />

      {/* Modal chi tiết đơn hàng */}
      <OrderDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        order={selectedOrder}
        accountNamesMap={accountNamesMap}
      />

      <CommonFooter />
    </div>
  );
};

export default ReturnOrder;
