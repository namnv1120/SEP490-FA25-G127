import { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message } from "antd";
import { getAllOrders } from "../../../services/OrderService";
import { getAccountById, getMyInfo } from "../../../services/AccountService";
import CommonDateRangePicker from "../../../components/date-range-picker/common-date-range-picker";

const SelectOrdersForReturnModal = ({ show, onHide, onConfirm }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Load completed orders
  const loadCompletedOrders = useCallback(async () => {
    setLoading(true);
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

      const params = {
        orderStatus: "Hoàn tất", // Only completed orders
      };

      if (searchTerm?.trim()) {
        params.searchTerm = searchTerm.trim();
      }

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

      // Normalize data
      const normalizedData = allData.map((item, index) => ({
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
        totalAmount: Number(item.totalAmount) || 0,
        rawData: item,
      }));

      // FILTER THEO ROLE: Chủ/Admin thấy tất cả, Nhân viên chỉ thấy đơn của mình
      let filteredByRole = normalizedData;
      if (!isOwnerOrAdmin && currentUserId) {
        filteredByRole = normalizedData.filter(
          (order) => order.accountId === currentUserId
        );
      }

      // Get account names
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

      const dataWithAccountNames = filteredByRole.map((item) => ({
        ...item,
        accountName:
          item.accountName ||
          (item.accountId ? accountNames[item.accountId] || "-" : "-"),
      }));

      // Sort by date descending
      const sortedData = [...dataWithAccountNames].sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        return dateB - dateA;
      });

      setOrders(sortedData);
    } catch (err) {
      console.error("Error loading completed orders:", err);
      message.error("Không thể tải danh sách đơn hàng hoàn tất!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, dateRange]);

  useEffect(() => {
    if (show) {
      loadCompletedOrders();
      setSelectedOrders([]);
    }
  }, [show, loadCompletedOrders]);

  // Handle select all checkbox
  useEffect(() => {
    if (!show) return;

    const selectAllCheckbox = document.getElementById(
      "return-modal-select-all"
    );

    const handleSelectAll = (e) => {
      const checkboxes = document.querySelectorAll(
        '.return-modal-table input[type="checkbox"][data-order-id]'
      );
      checkboxes.forEach((cb) => {
        cb.checked = e.target.checked;
      });

      if (e.target.checked) {
        setSelectedOrders([...orders]);
      } else {
        setSelectedOrders([]);
      }
    };

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", handleSelectAll);
    }

    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAll);
      }
    };
  }, [show, orders]);

  const handleCheckboxChange = (order, isChecked) => {
    if (isChecked) {
      setSelectedOrders((prev) => [...prev, order]);
    } else {
      setSelectedOrders((prev) =>
        prev.filter((o) => o.orderId !== order.orderId)
      );
    }
  };

  const handleConfirm = () => {
    if (selectedOrders.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }

    onConfirm(selectedOrders);
  };

  const handleClose = () => {
    setSearchTerm("");
    setDateRange([null, null]);
    setSelectedOrders([]);
    onHide();
  };

  return (
    <Modal
      title={
        <div>
          <h5 className="mb-0">Chọn đơn hàng để hoàn</h5>
          <small className="text-muted">
            Chỉ hiển thị các đơn có trạng thái "Hoàn tất"
          </small>
        </div>
      }
      open={show}
      onCancel={handleClose}
      width={1000}
      footer={[
        <button
          key="cancel"
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Hủy
        </button>,
        <button
          key="confirm"
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={selectedOrders.length === 0}
        >
          Xác nhận ({selectedOrders.length})
        </button>,
      ]}
    >
      {/* Search and filter */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Thời gian</label>
          <CommonDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-100"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Tìm kiếm</label>
          <input
            type="text"
            className="form-control"
            placeholder="Mã đơn, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="return-modal-table"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Spin size="large" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <i className="ti ti-inbox" style={{ fontSize: "48px" }} />
            <p className="mt-2">Không có đơn hàng nào</p>
          </div>
        ) : (
          <table className="table table-hover">
            <thead className="sticky-top bg-light">
              <tr>
                <th style={{ width: "50px" }}>
                  <label className="checkboxs">
                    <input type="checkbox" id="return-modal-select-all" />
                    <span className="checkmarks" />
                  </label>
                </th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Người tạo</th>
                <th>Ngày đặt</th>
                <th className="text-end">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.key}>
                  <td>
                    <label className="checkboxs">
                      <input
                        type="checkbox"
                        data-order-id={order.orderId}
                        checked={selectedOrders.some(
                          (o) => o.orderId === order.orderId
                        )}
                        onChange={(e) =>
                          handleCheckboxChange(order, e.target.checked)
                        }
                      />
                      <span className="checkmarks" />
                    </label>
                  </td>
                  <td>
                    <span className="text-primary fw-medium">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td>{order.customerName}</td>
                  <td className="text-muted">{order.accountName || "-"}</td>
                  <td>
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="text-end">
                    <strong className="text-success">
                      {order.totalAmount.toLocaleString("vi-VN")} ₫
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};

export default SelectOrdersForReturnModal;
