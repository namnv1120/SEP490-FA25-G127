import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Modal, message, Spin } from "antd";
import {
  getAllOrders,
  getOrderById,
  cancelOrder,
  getMyOrdersByDateTimeRange,
} from "../../../services/OrderService";
import { getMyInfo } from "../../../services/AccountService";
import { getCustomerById } from "../../../services/CustomerService";
import { logoPng } from "../../../utils/imagepath";
import CashDenominationInput from "../../../components/cash-denomination/CashDenominationInput";
import "../../../assets/css/pos-sidebar.css";

const PosModals = ({
  createdOrder,
  totalAmount,
  showPaymentMethodModal,
  onClosePaymentMethodModal,
  onPaymentCompleted,
  onSelectPaymentMethod,
  showCashPaymentModal,
  showMomoModal,
  showOrderSuccessModal,
  showOrderCancelledModal,
  onCloseOrderSuccessModal,
  onCloseOrderCancelledModal,
  completedOrderForPrint,
  cancelledOrder,
  onCashPaymentConfirm,
  onMomoModalClose,
  onCompleteOrder,
  onCashPaymentCompleted,
  onSelectOrder,
  showShiftModal,
  onCloseShiftModal,
  currentShift,
  shiftLoading,
  onCloseShift,
  userRole,
}) => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");

  const [cashReceived, setCashReceived] = useState("");
  const [momoPayUrl, setMomoPayUrl] = useState(null);
  const [shiftAmount, setShiftAmount] = useState("");
  const [expectedDrawer, setExpectedDrawer] = useState(null);
  const [shiftNote, setShiftNote] = useState("");
  const [myAccountId, setMyAccountId] = useState(null);
  const [_openCashDenominations, setOpenCashDenominations] = useState([]);
  const [closeCashDenominations, setCloseCashDenominations] = useState([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [printReceiptLoading, setPrintReceiptLoading] = useState(false);
  const [showPrintReceiptModal, setShowPrintReceiptModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const cashReceivedInputRef = useRef(null);

  // Format số thành tiền Việt (với dấu chấm phân cách hàng nghìn)
  const formatCashCurrency = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const num = parseFloat(String(value).replace(/\./g, "").replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN");
  };

  // Parse chuỗi tiền Việt thành số
  const parseCashCurrency = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const num = parseFloat(String(value).replace(/\./g, "").replace(/,/g, ""));
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    setShiftAmount("");
    setShiftNote("");
  }, [showShiftModal, currentShift?.status]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const info = await getMyInfo();
        const u = info.result || info;
        const accountId = u?.id || null;
        console.log("🔑 Loaded myAccountId:", accountId);
        setMyAccountId(accountId);
      } catch {
        void 0;
      }
    };
    // Load user immediately on mount
    loadUser();
  }, []);

  const expectedPollingRef = useRef(null);
  const computeExpectedDrawer = useCallback(async () => {
    if (
      !showShiftModal ||
      !currentShift ||
      currentShift.status !== "Mở" ||
      !currentShift.openedAt
    ) {
      setExpectedDrawer(null);
      return;
    }
    try {
      const startISO = currentShift.openedAt;
      const nowISO = new Date().toISOString();
      let rows = (await getMyOrdersByDateTimeRange(startISO, nowISO)) || [];
      if (!Array.isArray(rows) || rows.length === 0) {
        try {
          const fromDate = new Date(startISO);
          const toDate = new Date(nowISO);
          const formatDate = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;
          const resp = await getAllOrders({
            from: formatDate(fromDate),
            to: formatDate(toDate),
          });
          const all = resp?.content || resp || [];
          const myId = myAccountId;
          const fromTs = fromDate.getTime();
          const toTs = toDate.getTime();
          rows = (Array.isArray(all) ? all : []).filter((o) => {
            const uid =
              o.accountId || (o.account && o.account.accountId) || null;
            const dt = new Date(
              o.orderDate || o.createdDate || o.createdAt || Date.now()
            ).getTime();
            return (
              myId &&
              uid &&
              String(uid) === String(myId) &&
              dt >= fromTs &&
              dt <= toTs
            );
          });
        } catch {
          void 0;
        }
      }
      const paid = (s) =>
        (s || "").toString().toLowerCase().includes("đã thanh toán") ||
        (s || "").toString().toUpperCase() === "PAID" ||
        (s || "").toString().toUpperCase() === "PAYMENT_COMPLETED";
      const done = (s) =>
        (s || "").toString().toLowerCase().includes("hoàn tất") ||
        (s || "").toString().toUpperCase() === "COMPLETED";
      const methodStr = (o) =>
        (o.payment?.paymentMethod || o.paymentMethod || "")
          .toString()
          .toUpperCase();
      const isCash = (m) => m.includes("CASH") || m.includes("TIỀN MẶT");
      const completedPaid = rows.filter(
        (o) => paid(o.paymentStatus) && done(o.orderStatus)
      );
      const cashCol = completedPaid
        .filter((o) => isCash(methodStr(o)))
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const changeReturned = completedPaid.reduce(
        (sum, o) => sum + Number(o.payment?.changeAmount || 0),
        0
      );
      setExpectedDrawer(
        Number(currentShift?.initialCash || 0) + cashCol - changeReturned
      );
    } catch {
      setExpectedDrawer(null);
    }
  }, [showShiftModal, currentShift, myAccountId]);

  useEffect(() => {
    if (
      showShiftModal &&
      currentShift?.status === "Mở" &&
      currentShift?.openedAt &&
      myAccountId
    ) {
      computeExpectedDrawer();
      const id = setInterval(computeExpectedDrawer, 2000);
      expectedPollingRef.current = id;
      return () => {
        if (expectedPollingRef.current) {
          clearInterval(expectedPollingRef.current);
          expectedPollingRef.current = null;
        }
      };
    } else {
      if (expectedPollingRef.current) {
        clearInterval(expectedPollingRef.current);
        expectedPollingRef.current = null;
      }
    }
  }, [
    showShiftModal,
    currentShift?.openedAt,
    currentShift?.status,
    myAccountId,
    computeExpectedDrawer,
  ]);

  // Extract MoMo payUrl from created order and auto-open tab
  useEffect(() => {
    if (createdOrder && showMomoModal) {
      let foundPayUrl = null;

      // OrderResponse has payment (singular) field
      if (createdOrder.payment) {
        // Check if payment has payUrl directly
        if (createdOrder.payment.payUrl) {
          foundPayUrl = createdOrder.payment.payUrl;
        }
        // Check if payment notes contain PAYURL
        else if (
          createdOrder.payment.notes &&
          createdOrder.payment.notes.startsWith("PAYURL:")
        ) {
          foundPayUrl = createdOrder.payment.notes.substring("PAYURL:".length);
        }
      }
      // Fallback: check if payUrl is directly in order response
      if (!foundPayUrl && createdOrder.payUrl) {
        foundPayUrl = createdOrder.payUrl;
      }

      setMomoPayUrl(foundPayUrl);
    } else if (!showMomoModal) {
      setMomoPayUrl(null);
    }
  }, [createdOrder, showMomoModal]);

  // Handle payment method selection - will be passed from Pos.jsx

  // Calculate change amount
  const calculateChange = () => {
    if (!cashReceived) return 0;
    const received = parseCashCurrency(cashReceived);
    const total = parseFloat(totalAmount || createdOrder?.totalAmount || 0);
    return received - total;
  };

  // Handle cash payment confirmation
  const handleCashPaymentConfirm = async () => {
    const change = calculateChange();
    if (change < 0) {
      message.warning("Số tiền khách đưa không đủ!");
      return;
    }

    // Call API to complete order (finalize payment and update statuses)
    if (createdOrder && createdOrder.orderId) {
      try {
        message.loading("Đang xử lý thanh toán...", 0);

        // Use onCashPaymentCompleted if available, otherwise use onCompleteOrder
        const completionHandler = onCashPaymentCompleted || onCompleteOrder;
        if (completionHandler) {
          await completionHandler(createdOrder.orderId);
        }

        message.destroy();

        // Close cash payment modal
        setCashReceived("");
        if (onCashPaymentConfirm) {
          onCashPaymentConfirm();
        }
        // Success modal will be shown by onCashPaymentCompleted handler in Pos.jsx
      } catch (error) {
        message.destroy();
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại!";
        message.error(errorMessage);
      }
    } else {
      message.error("Không tìm thấy đơn hàng. Vui lòng thử lại!");
    }
  };

  // Reset cash received when modal closes and focus input when modal opens
  useEffect(() => {
    if (!showCashPaymentModal) {
      setCashReceived("");
    } else {
      // Focus vào input khi modal mở
      setTimeout(() => {
        if (cashReceivedInputRef.current) {
          cashReceivedInputRef.current.focus();
          // Select all text nếu có giá trị
          if (cashReceivedInputRef.current.value) {
            cashReceivedInputRef.current.select();
          }
        }
      }, 100); // Delay nhỏ để đảm bảo modal đã render xong
    }
  }, [showCashPaymentModal]);

  // Function to fetch orders - filter by shift for SALESMAN role
  const fetchOrders = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setOrdersLoading(true);
        }

        console.log("📋 fetchOrders called with:", {
          userRole,
          shiftStatus: currentShift?.status,
          shiftOpenedAt: currentShift?.openedAt,
          myAccountId,
        });

        // If user is Nhân viên bán hàng (SALESMAN) and has an open shift, only fetch orders from current shift
        const isSalesman =
          userRole === "Nhân viên bán hàng" || userRole === "SALESMAN";
        if (
          isSalesman &&
          currentShift?.status === "Mở" &&
          currentShift?.openedAt &&
          myAccountId
        ) {
          const startISO = currentShift.openedAt;
          const nowISO = new Date().toISOString();
          const fromDate = new Date(startISO);
          const toDate = new Date(nowISO);
          const fromTs = fromDate.getTime();
          const toTs = toDate.getTime();

          // Try getMyOrdersByDateTimeRange first
          let shiftOrders = [];
          try {
            shiftOrders =
              (await getMyOrdersByDateTimeRange(startISO, nowISO)) || [];
          } catch {
            shiftOrders = [];
          }

          // If empty, try getAllOrders with date filter
          if (!Array.isArray(shiftOrders) || shiftOrders.length === 0) {
            try {
              const formatDate = (d) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                  2,
                  "0"
                )}-${String(d.getDate()).padStart(2, "0")}`;
              const resp = await getAllOrders({
                from: formatDate(fromDate),
                to: formatDate(toDate),
              });
              shiftOrders = resp?.content || resp || [];
            } catch {
              shiftOrders = [];
            }
          }

          // ALWAYS filter by myAccountId and time range to ensure only current user's orders are shown
          const filteredOrders = (
            Array.isArray(shiftOrders) ? shiftOrders : []
          ).filter((o) => {
            const uid =
              o.accountId || (o.account && o.account.accountId) || null;
            const dt = new Date(
              o.orderDate || o.createdDate || o.createdAt || Date.now()
            ).getTime();
            const isMyOrder = uid && String(uid) === String(myAccountId);
            const isInTimeRange = dt >= fromTs && dt <= toTs;
            return isMyOrder && isInTimeRange;
          });

          console.log("🔍 SALESMAN orders filter:", {
            myAccountId,
            shiftStart: startISO,
            totalFetched: shiftOrders.length,
            afterFilter: filteredOrders.length,
          });

          setOrders(filteredOrders);
        } else if (
          isSalesman &&
          (!currentShift || currentShift?.status !== "Mở")
        ) {
          // Nhân viên bán hàng without open shift - show empty
          console.log(
            "🔍 Nhân viên bán hàng no open shift - showing empty orders"
          );
          setOrders([]);
        } else {
          // STORE_OWNER - show all orders
          const data = await getAllOrders();
          setOrders(data || []);
        }
      } catch {
        message.error("Không thể tải danh sách đơn hàng");
        setOrders([]);
      } finally {
        if (showLoading) {
          setOrdersLoading(false);
        }
      }
    },
    [userRole, currentShift, myAccountId]
  );

  // Fetch orders when modal opens or when shift changes
  useEffect(() => {
    const handleModalShown = async () => {
      const ordersModal = document.getElementById("orders");
      if (ordersModal && ordersModal.classList.contains("show")) {
        // Always refetch when modal opens to get latest orders
        await fetchOrders(true);
      }
    };

    // Listen for modal show event
    const ordersModal = document.getElementById("orders");
    if (ordersModal) {
      ordersModal.addEventListener("shown.bs.modal", handleModalShown);
      return () => {
        ordersModal.removeEventListener("shown.bs.modal", handleModalShown);
      };
    }
  }, [fetchOrders]);

  // Reset orders when shift changes (for Nhân viên bán hàng)
  useEffect(() => {
    const isSalesman =
      userRole === "Nhân viên bán hàng" || userRole === "SALESMAN";
    if (isSalesman) {
      // When shift opens/closes, reset orders
      setOrders([]);
    }
  }, [currentShift?.shiftId, currentShift?.status, userRole]);

  // Helper function to get order status
  const getOrderStatus = (order) => {
    // Map API status to Vietnamese status
    const status = order.orderStatus || order.status || "";
    const statusLower = status.toLowerCase();

    if (
      status === "Hoàn tất" ||
      status === "Completed" ||
      status === "COMPLETED"
    ) {
      return "Hoàn tất";
    }
    if (
      status === "Đã hủy" ||
      status === "Cancelled" ||
      status === "CANCELLED"
    ) {
      return "Đã hủy";
    }
    // Check for return-related statuses - exclude from "Chờ xác nhận"
    if (
      statusLower === "chờ hoàn hàng" ||
      statusLower === "pending_return" ||
      statusLower === "trả hàng" ||
      statusLower === "returned"
    ) {
      return null; // Don't show in any tab
    }
    // Default to "Chờ xác nhận"
    return "Chờ xác nhận";
  };

  // Filter orders by status and search query, then sort by date (newest first)
  const getOrdersByStatus = (status) => {
    return orders
      .filter((order) => {
        const orderStatus = getOrderStatus(order);
        // Filter out orders with null status (return orders)
        if (orderStatus === null) return false;
        return orderStatus === status;
      })
      .filter((order) => {
        // Apply search filter
        if (!ordersSearchQuery) return true;
        const query = ordersSearchQuery.toLowerCase();
        const customerName = (
          order.customer?.fullName ||
          order.customer?.customerName ||
          ""
        ).toLowerCase();
        const orderNumber = (order.orderNumber || order.orderId || "")
          .toString()
          .toLowerCase();
        const phone = (order.customer?.phone || "").toLowerCase();
        return (
          customerName.includes(query) ||
          orderNumber.includes(query) ||
          phone.includes(query)
        );
      })
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(
          a.orderDate || a.createdAt || a.createdDate || 0
        );
        const dateB = new Date(
          b.orderDate || b.createdAt || b.createdDate || 0
        );
        return dateB - dateA; // Descending order (newest first)
      });
  };

  // Handle view order details
  const handleViewOrderDetail = async (orderId) => {
    try {
      setOrderDetailLoading(true);

      // Fetch order detail and show modal on top of orders modal
      const orderDetail = await getOrderById(orderId);

      // Fetch customer if we have customerId but no customer object
      if (orderDetail.customerId && !orderDetail.customer) {
        try {
          const customerData = await getCustomerById(orderDetail.customerId);
          orderDetail.customer = customerData;
        } catch {
          // If customer fetch fails, continue without customer data
        }
      }

      setSelectedOrderDetail(orderDetail);
      setShowOrderDetailModal(true);

      setOrderDetailLoading(false);
    } catch {
      setOrderDetailLoading(false);
      message.error("Không thể tải chi tiết đơn hàng");
    }
  };

  // Handle print order - show receipt modal first
  const handlePrintOrder = async (order) => {
    try {
      setPrintReceiptLoading(true);

      // Fetch full order details if needed
      let orderData = order;
      if (!order.orderDetails) {
        try {
          orderData = await getOrderById(order.orderId);
        } catch {
          message.error("Không thể tải chi tiết đơn hàng để in");
          setPrintReceiptLoading(false);
          return;
        }
      }

      // Fetch customer if we have customerId but no customer object
      if (orderData.customerId && !orderData.customer) {
        try {
          const customerData = await getCustomerById(orderData.customerId);
          orderData.customer = customerData;
        } catch {
          // If customer fetch fails, continue without customer data
        }
      }

      setOrderToPrint(orderData);
      setPrintReceiptLoading(false);

      // Show Ant Design Modal (similar to Order Detail Modal)
      setShowPrintReceiptModal(true);
    } catch {
      setPrintReceiptLoading(false);
      message.error("Không thể mở hóa đơn in");
    }
  };

  // Helper function to close all modals and clean up

  // Handle select order from order list - load order into POS
  const handleSelectOrder = async (order) => {
    try {
      // Fetch full order details if needed
      let orderData = order;
      if (!order.orderDetails || !order.customer) {
        try {
          orderData = await getOrderById(order.orderId);
        } catch {
          message.error("Không thể tải thông tin đơn hàng");
          return;
        }
      }

      // Close orders modal first
      const ordersModal = document.getElementById("orders");
      if (ordersModal && ordersModal.classList.contains("show")) {
        if (window.bootstrap && window.bootstrap.Modal) {
          const ordersBsModal = window.bootstrap.Modal.getInstance(ordersModal);
          if (ordersBsModal) {
            ordersBsModal.hide();

            // Clean up backdrops and body styles
            setTimeout(() => {
              const backdrops = document.querySelectorAll(".modal-backdrop");
              backdrops.forEach((backdrop) => backdrop.remove());
              document.body.classList.remove("modal-open");
              document.body.style.overflow = "";
              document.body.style.paddingRight = "";

              // Load order into POS
              if (onSelectOrder) {
                onSelectOrder(orderData);
              } else {
                message.warning("Chức năng chọn đơn chưa được tích hợp");
              }
            }, 200);
            return;
          }
        }
      }

      // If orders modal is not open, just load order
      if (onSelectOrder) {
        await onSelectOrder(orderData);
      } else {
        message.warning("Chức năng chọn đơn chưa được tích hợp");
      }
    } catch {
      message.error("Không thể chọn đơn hàng này");
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (order) => {
    try {
      // Confirm before canceling
      Modal.confirm({
        title: "Xác nhận hủy đơn",
        content: `Bạn có chắc chắn muốn hủy đơn hàng #${
          order.orderNumber || order.orderId
        }?`,
        okText: "Hủy đơn",
        cancelText: "Không",
        okButtonProps: { danger: true },
        centered: true, // Hiển thị modal ở giữa màn hình
        onOk: async () => {
          try {
            setCancellingOrderId(order.orderId);

            // Nếu đang hiện MoMo modal cho đơn này, đóng modal trước
            if (
              showMomoModal &&
              createdOrder &&
              order.orderId === createdOrder.orderId
            ) {
              if (onMomoModalClose) {
                onMomoModalClose();
              }
            }

            await cancelOrder(order.orderId);
            message.success("Đã hủy đơn hàng thành công!");

            // Refresh orders list
            try {
              const data = await getAllOrders();
              setOrders(data || []);
            } catch {
              void 0;
            }

            // Chỉ reset POS nếu đơn bị hủy là đơn hiện tại đang được tạo
            // Không reset nếu hủy đơn khác trong danh sách
            if (
              onPaymentCompleted &&
              createdOrder &&
              order.orderId === createdOrder.orderId
            ) {
              await onPaymentCompleted();
            }
          } catch {
            message.error("Hủy đơn hàng thất bại. Vui lòng thử lại!");
          } finally {
            setCancellingOrderId(null);
          }
        },
      });
    } catch {
      message.error("Không thể hủy đơn hàng này");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Get payment method display text
  const getPaymentMethodText = (order) => {
    if (!order.payment || !order.payment.paymentMethod) {
      return "Chưa chọn";
    }
    const method = order.payment.paymentMethod;
    if (method === "Tiền mặt" || method === "CASH" || method === "Cash") {
      return "Tiền mặt";
    } else if (
      method === "MOMO" ||
      method === "Ví điện tử" ||
      method === "MoMo"
    ) {
      return "MoMo";
    }
    return method;
  };

  // Get customer name from order
  const getCustomerName = (order) => {
    // Try multiple sources for customer name
    if (order.customerName) {
      return order.customerName;
    }
    if (order.customer) {
      if (order.customer.fullName) {
        return order.customer.fullName;
      }
      if (order.customer.customerName) {
        return order.customer.customerName;
      }
      if (order.customer.name) {
        return order.customer.name;
      }
    }
    return "Khách lẻ";
  };

  // Get customer phone from order (sync, assumes customer is already fetched)
  const getCustomerPhone = (order) => {
    if (order.customer) {
      if (order.customer.phone) {
        return order.customer.phone;
      }
      if (order.customer.phoneNumber) {
        return order.customer.phoneNumber;
      }
      if (order.customer.phoneNo) {
        return order.customer.phoneNo;
      }
    }
    return "-";
  };

  return (
    <>
      {/* Payment Method Selection Modal */}
      <Modal
        title="Chọn phương thức thanh toán"
        open={showPaymentMethodModal}
        onCancel={onClosePaymentMethodModal}
        footer={null}
        centered
        width={500}
        zIndex={10020}
        mask={true}
        maskClosable={true}
        getContainer={false}
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="text-center mb-4">
              <h5>
                Tổng tiền:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount || createdOrder?.totalAmount || 0)}
              </h5>
            </div>
          </div>
          <div className="col-6">
            <button
              className="btn btn-success w-100 py-3"
              onClick={async () => {
                if (onSelectPaymentMethod) {
                  try {
                    await onSelectPaymentMethod("cash");
                  } catch {
                    void 0;
                  }
                }
              }}
              style={{ fontSize: "16px" }}
            >
              <i className="ti ti-cash-banknote fs-24 d-block mb-2" />
              Tiền mặt
            </button>
          </div>
          <div className="col-6">
            <button
              className="btn btn-primary w-100 py-3"
              onClick={async () => {
                if (onSelectPaymentMethod) {
                  try {
                    await onSelectPaymentMethod("momo");
                  } catch {
                    void 0;
                  }
                }
              }}
              style={{ fontSize: "16px" }}
            >
              <i className="ti ti-scan fs-24 d-block mb-2" />
              MoMo
            </button>
          </div>
        </div>
      </Modal>

      {/* Cash Payment Modal */}
      <Modal
        title="Thanh toán tiền mặt"
        open={showCashPaymentModal}
        onCancel={() => {
          // Just close the modal when cancel is clicked
          setCashReceived("");
          if (onCashPaymentConfirm) {
            onCashPaymentConfirm();
          }
        }}
        afterOpenChange={(open) => {
          // Focus vào input khi modal đã mở hoàn toàn
          if (open && cashReceivedInputRef.current) {
            setTimeout(() => {
              cashReceivedInputRef.current?.focus();
              if (cashReceivedInputRef.current?.value) {
                cashReceivedInputRef.current.select();
              }
            }, 100);
          }
        }}
        footer={null}
        centered
        width={500}
        zIndex={10021}
        mask={true}
        maskClosable={true}
        getContainer={false}
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">Tổng tiền đơn hàng</label>
              <input
                type="text"
                className="form-control"
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount || createdOrder?.totalAmount || 0)}
                readOnly
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Tiền khách đưa <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <input
                  ref={cashReceivedInputRef}
                  type="text"
                  className="form-control text-end"
                  placeholder="Nhập số tiền khách đưa"
                  value={cashReceived}
                  onChange={(e) => {
                    // Chỉ cho phép nhập số
                    const rawInput = e.target.value.replace(/[^0-9]/g, "");
                    if (rawInput === "") {
                      setCashReceived("");
                      return;
                    }
                    const numValue = parseCashCurrency(rawInput);
                    setCashReceived(formatCashCurrency(numValue));
                  }}
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    paddingRight: "50px",
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    // Cho phép Enter để xác nhận thanh toán
                    if (
                      e.key === "Enter" &&
                      parseCashCurrency(cashReceived) >=
                        (totalAmount || createdOrder?.totalAmount || 0)
                    ) {
                      handleCashPaymentConfirm();
                      return;
                    }
                    // Chặn các ký tự không phải số, phím điều hướng, và phím điều khiển
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Home",
                      "End",
                    ];
                    const isNumber = /[0-9]/.test(e.key);
                    const isAllowedKey = allowedKeys.includes(e.key);
                    const isCtrlA = e.ctrlKey && e.key === "a";
                    const isCtrlC = e.ctrlKey && e.key === "c";
                    const isCtrlV = e.ctrlKey && e.key === "v";
                    const isCtrlX = e.ctrlKey && e.key === "x";

                    // Chặn dấu trừ, dấu cộng, dấu chấm và ký tự e/E
                    if (
                      e.key === "-" ||
                      e.key === "+" ||
                      e.key === "e" ||
                      e.key === "E" ||
                      e.key === "."
                    ) {
                      e.preventDefault();
                      return;
                    }

                    if (
                      !isNumber &&
                      !isAllowedKey &&
                      !isCtrlA &&
                      !isCtrlC &&
                      !isCtrlV &&
                      !isCtrlX
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text");
                    const numericValue = pastedText.replace(/[^0-9]/g, "");
                    if (numericValue) {
                      const num = parseInt(numericValue, 10);
                      if (!isNaN(num) && num >= 0) {
                        setCashReceived(formatCashCurrency(num));
                      }
                    }
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    pointerEvents: "none",
                    fontWeight: "bold",
                    color: "#6c757d",
                    fontSize: "16px",
                  }}
                >
                  ₫
                </span>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">
                {calculateChange() >= 0 ? "Tiền thừa" : "Tiền thiếu"}
              </label>
              <input
                type="text"
                className={`form-control ${
                  calculateChange() >= 0 ? "text-success" : "text-danger"
                }`}
                value={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Math.abs(calculateChange()))}
                readOnly
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                  backgroundColor:
                    calculateChange() >= 0 ? "#d4edda" : "#f8d7da",
                }}
              />
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12">
              <button
                className="btn btn-success w-100"
                onClick={handleCashPaymentConfirm}
                style={{ fontSize: "16px", padding: "10px" }}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MoMo Payment Modal */}
      <Modal
        title="Thanh toán qua MoMo"
        open={showMomoModal}
        onCancel={() => {
          if (onMomoModalClose) {
            onMomoModalClose();
          }
        }}
        footer={null}
        centered
        width={400}
        zIndex={10021}
        mask={true}
        maskClosable={true}
        getContainer={false}
      >
        <div className="text-center">
          <div className="mb-3">
            <h5 className="mb-2">Số tiền cần thanh toán</h5>
            <h3 className="text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount || createdOrder?.totalAmount || 0)}
            </h3>
          </div>
          {momoPayUrl ? (
            <>
              <div className="mb-3 p-3 bg-light rounded d-flex justify-content-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    momoPayUrl
                  )}`}
                  alt="MoMo QR Code"
                />
              </div>
              <p className="text-muted mb-3">
                Quét mã QR bằng ứng dụng MoMo để thanh toán
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.open(momoPayUrl, "_blank")}
              >
                <i className="ti ti-external-link me-2" />
                Mở MoMo App
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <Spin size="large" />
              <p className="text-muted mt-3">Đang tạo mã thanh toán...</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Order Success Modal */}
      <Modal
        title="Thành công"
        open={showOrderSuccessModal}
        onCancel={() => {
          if (onCloseOrderSuccessModal) {
            onCloseOrderSuccessModal();
          }
        }}
        footer={null}
        centered
        width={400}
        zIndex={10021}
        mask={true}
        maskClosable={true}
        getContainer={false}
      >
        <div className="text-center py-4">
          <div className="mb-4">
            <div
              className="mb-3"
              style={{ fontSize: "64px", color: "#52c41a" }}
            >
              <i className="ti ti-circle-check" />
            </div>
            <h4 className="mb-2 text-success">Thanh toán thành công!</h4>
            {(completedOrderForPrint || createdOrder) && (
              <p className="text-muted mb-0">
                Mã đơn:{" "}
                <strong>
                  #
                  {(completedOrderForPrint || createdOrder)?.orderNumber ||
                    (completedOrderForPrint || createdOrder)?.orderId ||
                    "-"}
                </strong>
              </p>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-primary"
              onClick={async () => {
                const orderToPrint = completedOrderForPrint || createdOrder;
                if (orderToPrint) {
                  await handlePrintOrder(orderToPrint);
                  if (onCloseOrderSuccessModal) {
                    onCloseOrderSuccessModal();
                  }
                }
              }}
            >
              <i className="ti ti-printer me-2" />
              In hóa đơn
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (onCloseOrderSuccessModal) {
                  onCloseOrderSuccessModal();
                }
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
      {/* /Order Success Modal */}

      {/* Order Cancelled Modal */}
      <Modal
        title="Đã hủy"
        open={showOrderCancelledModal}
        onCancel={() => {
          if (onCloseOrderCancelledModal) {
            onCloseOrderCancelledModal();
          }
        }}
        footer={null}
        centered
        width={400}
        zIndex={10021}
        mask={true}
        maskClosable={true}
        getContainer={false}
      >
        <div className="text-center py-4">
          <div className="mb-4">
            <div
              className="mb-3"
              style={{ fontSize: "64px", color: "#ff4d4f" }}
            >
              <i className="ti ti-circle-x" />
            </div>
            <h4 className="mb-2 text-danger">Thanh toán đã bị hủy!</h4>
            {cancelledOrder && (
              <>
                <p className="text-muted mb-0">
                  Mã đơn:{" "}
                  <strong>
                    #
                    {cancelledOrder?.orderNumber ||
                      cancelledOrder?.orderId ||
                      "-"}
                  </strong>
                </p>
                <p className="text-muted small mt-2">
                  Giao dịch MoMo đã bị hủy hoặc quá thời gian.
                  <br />
                  Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
              </>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (onCloseOrderCancelledModal) {
                  onCloseOrderCancelledModal();
                }
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
      {/* /Order Cancelled Modal */}

      {/* Print Receipt Modal */}
      <Modal
        title="Hóa đơn bán hàng"
        open={showPrintReceiptModal}
        onCancel={() => {
          setShowPrintReceiptModal(false);
          setOrderToPrint(null);
        }}
        footer={null}
        centered
        width={400}
        zIndex={10001}
        mask={true}
        maskClosable={true}
      >
        {printReceiptLoading ? (
          <div className="text-center py-4">
            <Spin size="large" />
          </div>
        ) : orderToPrint ? (
          <div>
            <div className="icon-head text-center mb-3">
              <Link to="#">
                <img src={logoPng} width={130} height={40} alt="Receipt Logo" />
              </Link>
            </div>
            <div className="tax-invoice mb-3">
              <h6 className="text-center">Hóa đơn</h6>
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <div className="invoice-user-name">
                    <span>Mã đơn: </span>#
                    {orderToPrint.orderNumber || orderToPrint.orderId || "-"}
                  </div>
                  <div className="invoice-user-name">
                    <span>Tên khách hàng: </span>
                    {getCustomerName(orderToPrint)}
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="invoice-user-name">
                    <span>Ngày: </span>
                    {formatDate(
                      orderToPrint.orderDate ||
                        orderToPrint.createdAt ||
                        orderToPrint.createdDate
                    )}
                  </div>
                  <div className="invoice-user-name">
                    <span>SĐT: </span>
                    {getCustomerPhone(orderToPrint)}
                  </div>
                </div>
              </div>
            </div>
            <table className="table-borderless w-100 table-fit mb-3">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}># Sản phẩm</th>
                  <th
                    style={{
                      width: "25%",
                      textAlign: "right",
                      paddingRight: "5px",
                    }}
                  >
                    Đơn giá
                  </th>
                  <th
                    style={{
                      width: "5%",
                      textAlign: "center",
                      paddingLeft: "10px",
                      paddingRight: "5px",
                    }}
                  >
                    SL
                  </th>
                  <th style={{ width: "25%" }} className="text-end">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderToPrint.orderDetails &&
                orderToPrint.orderDetails.length > 0 ? (
                  <>
                    {orderToPrint.orderDetails.map((item, index) => {
                      const unitPrice = item.unitPrice || 0;
                      const quantity = item.quantity || 0;
                      const discountPercent = item.discount || 0;
                      const total =
                        unitPrice * quantity * (1 - discountPercent / 100);

                      return (
                        <tr key={item.orderDetailId || index}>
                          <td style={{ width: "45%" }}>
                            {item.productName || "N/A"}
                          </td>
                          <td
                            style={{
                              width: "25%",
                              textAlign: "right",
                              paddingRight: "5px",
                            }}
                          >
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(unitPrice)}
                          </td>
                          <td
                            style={{
                              width: "5%",
                              textAlign: "center",
                              paddingLeft: "10px",
                              paddingRight: "5px",
                            }}
                          >
                            {quantity}
                          </td>
                          <td style={{ width: "25%" }} className="text-end">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(total)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={4}>
                        <table className="table-borderless w-100 table-fit">
                          <tbody>
                            {(() => {
                              // Tính subtotal từ orderDetails (sau khi đã trừ giảm giá sản phẩm)
                              const subtotal =
                                orderToPrint.orderDetails?.reduce(
                                  (sum, item) => {
                                    const unitPrice = item.unitPrice || 0;
                                    const quantity = item.quantity || 0;
                                    const discountPercent = item.discount || 0;
                                    const itemTotal =
                                      unitPrice *
                                      quantity *
                                      (1 - discountPercent / 100);
                                    return sum + itemTotal;
                                  },
                                  0
                                ) || 0;

                              // Lấy các giá trị từ order
                              const discountAmount =
                                orderToPrint.discountAmount || 0;
                              const taxAmount = orderToPrint.taxAmount || 0;
                              const pointsRedeemed =
                                orderToPrint.pointsRedeemed || 0;
                              const totalAmount = orderToPrint.totalAmount || 0;

                              // Tính phần trăm chiết khấu và thuế
                              const discountPercent =
                                subtotal > 0
                                  ? ((discountAmount / subtotal) * 100).toFixed(
                                      2
                                    )
                                  : 0;
                              const afterDiscount = subtotal - discountAmount;
                              const taxPercent =
                                afterDiscount > 0
                                  ? ((taxAmount / afterDiscount) * 100).toFixed(
                                      2
                                    )
                                  : 0;

                              return (
                                <>
                                  <tr>
                                    <td className="fw-bold">Tạm tính:</td>
                                    <td className="text-end">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(subtotal)}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="fw-bold">Chiết khấu:</td>
                                    <td className="text-end">
                                      {discountPercent > 0
                                        ? `${discountPercent}%`
                                        : "0%"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="fw-bold">Thuế:</td>
                                    <td className="text-end">
                                      {taxPercent > 0 ? `${taxPercent}%` : "0%"}
                                    </td>
                                  </tr>
                                  {pointsRedeemed > 0 && (
                                    <tr>
                                      <td className="fw-bold">
                                        Điểm đã sử dụng:
                                      </td>
                                      <td className="text-end text-success">
                                        -
                                        {new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        }).format(pointsRedeemed)}
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td className="fw-bold">Tổng cộng:</td>
                                    <td className="text-end fw-bold">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(totalAmount)}
                                    </td>
                                  </tr>
                                </>
                              );
                            })()}
                            <tr>
                              <td className="fw-bold">
                                Trạng thái thanh toán:
                              </td>
                              <td className="text-end">
                                {orderToPrint.paymentStatus ||
                                  orderToPrint.orderStatus ||
                                  "Chưa thanh toán"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-3">
                      Không có sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="text-center invoice-bar">
              <div className="border-bottom border-dashed mb-3">
                <p>Cảm ơn quý khách đã mua hàng!</p>
              </div>
              <button
                className="btn btn-md btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <i className="ti ti-printer me-2" />
                In hóa đơn
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>Không có dữ liệu hóa đơn</p>
          </div>
        )}
      </Modal>
      {/* /Print Receipt Modal */}

      {/* Orders */}
      <div
        className="modal fade pos-modal pos-orders-sidebar"
        id="orders"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-sidebar" role="document">
          <div className="modal-content modal-content-sidebar">
            <div className="modal-header">
              <h5 className="modal-title">Danh sách đơn hàng</h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => fetchOrders(true)}
                  disabled={ordersLoading}
                  title="Làm mới danh sách"
                >
                  <i
                    className={`ti ti-refresh ${
                      ordersLoading ? "spinning" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="tabs-sets">
                <ul className="nav nav-tabs" id="myTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="pending-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#pending"
                      type="button"
                      role="tab"
                    >
                      Chờ xác nhận
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="completed-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#completed"
                      type="button"
                      role="tab"
                    >
                      Hoàn tất
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="cancelled-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#cancelled"
                      type="button"
                      role="tab"
                    >
                      Đã hủy
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  {/* Chờ xác nhận */}
                  <div
                    className="tab-pane fade show active"
                    id="pending"
                    role="tabpanel"
                  >
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={ordersSearchQuery}
                        onChange={(e) => setOrdersSearchQuery(e.target.value)}
                        style={{ paddingLeft: "40px" }}
                      />
                      <span
                        className="input-icon-addon"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          pointerEvents: "none",
                        }}
                      >
                        <i className="ti ti-search" />
                      </span>
                    </div>
                    <div className="order-body">
                      {ordersLoading ? (
                        <div className="text-center py-4">
                          <Spin size="large" />
                        </div>
                      ) : getOrdersByStatus("Chờ xác nhận").length === 0 ? (
                        <div className="text-center py-4">
                          <p>Không có đơn hàng chờ xác nhận</p>
                        </div>
                      ) : (
                        getOrdersByStatus("Chờ xác nhận").map((order) => (
                          <div
                            key={order.orderId}
                            className="card bg-light mb-3"
                          >
                            <div className="card-body">
                              <span className="badge bg-warning fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Khách hàng:
                                    </span>{" "}
                                    {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Tổng tiền:
                                    </span>{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Phương thức thanh toán:
                                    </span>{" "}
                                    {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Ngày:
                                    </span>{" "}
                                    {formatDate(
                                      order.orderDate ||
                                        order.createdAt ||
                                        order.createdDate
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-3">
                                {getOrderStatus(order) === "Hoàn tất" && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handlePrintOrder(order)}
                                  >
                                    <i className="ti ti-printer me-1" />
                                    In đơn
                                  </button>
                                )}
                                {getOrderStatus(order) === "Chờ xác nhận" && (
                                  <>
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleSelectOrder(order)}
                                    >
                                      <i className="ti ti-shopping-cart me-1" />
                                      Chọn đơn
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleCancelOrder(order)}
                                      disabled={
                                        cancellingOrderId === order.orderId
                                      }
                                    >
                                      <i className="ti ti-x me-1" />
                                      {cancellingOrderId === order.orderId
                                        ? "Đang hủy..."
                                        : "Hủy đơn"}
                                    </button>
                                  </>
                                )}
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() =>
                                    handleViewOrderDetail(order.orderId)
                                  }
                                  disabled={orderDetailLoading}
                                >
                                  <i className="ti ti-eye me-1" />
                                  Chi tiết đơn
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Hoàn tất */}
                  <div className="tab-pane fade" id="completed" role="tabpanel">
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={ordersSearchQuery}
                        onChange={(e) => setOrdersSearchQuery(e.target.value)}
                        style={{ paddingLeft: "40px" }}
                      />
                      <span
                        className="input-icon-addon"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          pointerEvents: "none",
                        }}
                      >
                        <i className="ti ti-search" />
                      </span>
                    </div>
                    <div className="order-body">
                      {ordersLoading ? (
                        <div className="text-center py-4">
                          <Spin size="large" />
                        </div>
                      ) : getOrdersByStatus("Hoàn tất").length === 0 ? (
                        <div className="text-center py-4">
                          <p>Không có đơn hàng hoàn tất</p>
                        </div>
                      ) : (
                        getOrdersByStatus("Hoàn tất").map((order) => (
                          <div
                            key={order.orderId}
                            className="card bg-light mb-3"
                          >
                            <div className="card-body">
                              <span className="badge bg-success fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Khách hàng:
                                    </span>{" "}
                                    {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Tổng tiền:
                                    </span>{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Phương thức thanh toán:
                                    </span>{" "}
                                    {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Ngày:
                                    </span>{" "}
                                    {formatDate(
                                      order.orderDate ||
                                        order.createdAt ||
                                        order.createdDate
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-3">
                                {getOrderStatus(order) === "Hoàn tất" && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handlePrintOrder(order)}
                                  >
                                    <i className="ti ti-printer me-1" />
                                    In đơn
                                  </button>
                                )}
                                {getOrderStatus(order) === "Chờ xác nhận" && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleSelectOrder(order)}
                                  >
                                    <i className="ti ti-shopping-cart me-1" />
                                    Chọn đơn
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() =>
                                    handleViewOrderDetail(order.orderId)
                                  }
                                  disabled={orderDetailLoading}
                                >
                                  <i className="ti ti-eye me-1" />
                                  Chi tiết đơn
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Đã hủy */}
                  <div className="tab-pane fade" id="cancelled" role="tabpanel">
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={ordersSearchQuery}
                        onChange={(e) => setOrdersSearchQuery(e.target.value)}
                        style={{ paddingLeft: "40px" }}
                      />
                      <span
                        className="input-icon-addon"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 1,
                          pointerEvents: "none",
                        }}
                      >
                        <i className="ti ti-search" />
                      </span>
                    </div>
                    <div className="order-body">
                      {ordersLoading ? (
                        <div className="text-center py-4">
                          <Spin size="large" />
                        </div>
                      ) : getOrdersByStatus("Đã hủy").length === 0 ? (
                        <div className="text-center py-4">
                          <p>Không có đơn hàng đã hủy</p>
                        </div>
                      ) : (
                        getOrdersByStatus("Đã hủy").map((order) => (
                          <div
                            key={order.orderId}
                            className="card bg-light mb-3"
                          >
                            <div className="card-body">
                              <span className="badge bg-danger fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Khách hàng:
                                    </span>{" "}
                                    {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Tổng tiền:
                                    </span>{" "}
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Phương thức thanh toán:
                                    </span>{" "}
                                    {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">
                                      Ngày:
                                    </span>{" "}
                                    {formatDate(
                                      order.orderDate ||
                                        order.createdAt ||
                                        order.createdDate
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-3">
                                {getOrderStatus(order) === "Hoàn tất" && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handlePrintOrder(order)}
                                  >
                                    <i className="ti ti-printer me-1" />
                                    In đơn
                                  </button>
                                )}
                                {getOrderStatus(order) === "Chờ xác nhận" && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleSelectOrder(order)}
                                  >
                                    <i className="ti ti-shopping-cart me-1" />
                                    Chọn đơn
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() =>
                                    handleViewOrderDetail(order.orderId)
                                  }
                                  disabled={orderDetailLoading}
                                >
                                  <i className="ti ti-eye me-1" />
                                  Chi tiết đơn
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Orders */}

      {/* Order Detail Modal */}
      <Modal
        title="Chi tiết đơn hàng"
        open={showOrderDetailModal}
        onCancel={() => {
          setShowOrderDetailModal(false);
          setSelectedOrderDetail(null);
        }}
        footer={null}
        centered
        width={800}
        zIndex={10000}
        mask={true}
        maskClosable={true}
      >
        {orderDetailLoading ? (
          <div className="text-center py-4">
            <Spin size="large" />
          </div>
        ) : selectedOrderDetail ? (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-2">
                  <span className="fw-bold">Mã đơn:</span> #
                  {selectedOrderDetail.orderNumber ||
                    selectedOrderDetail.orderId}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Khách hàng:</span>{" "}
                  {selectedOrderDetail.customerName ||
                    selectedOrderDetail.customer?.fullName ||
                    selectedOrderDetail.customer?.customerName ||
                    "Khách lẻ"}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <span className="fw-bold">Trạng thái:</span>{" "}
                  {selectedOrderDetail.orderStatus ||
                    getOrderStatus(selectedOrderDetail)}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Ngày đặt:</span>{" "}
                  {formatDate(
                    selectedOrderDetail.orderDate ||
                      selectedOrderDetail.createdAt ||
                      selectedOrderDetail.createdDate
                  )}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Trạng thái thanh toán:</span>{" "}
                  {selectedOrderDetail.paymentStatus || "-"}
                </p>
              </div>
            </div>

            <div className="table-responsive mb-3">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Chiết khấu</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderDetail.orderDetails &&
                  selectedOrderDetail.orderDetails.length > 0 ? (
                    selectedOrderDetail.orderDetails.map((item, index) => {
                      const unitPrice = item.unitPrice || 0;
                      const quantity = item.quantity || 0;
                      const discountPercent = item.discount || 0;
                      const itemTotal =
                        unitPrice * quantity * (1 - discountPercent / 100);

                      return (
                        <tr key={item.orderDetailId || index}>
                          <td>{item.productName || "N/A"}</td>
                          <td>{quantity}</td>
                          <td>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(unitPrice)}
                          </td>
                          <td>
                            {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                          </td>
                          <td className="text-end">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.totalPrice || itemTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {(() => {
                    // Tính subtotal từ orderDetails (sau khi đã trừ giảm giá sản phẩm)
                    const subtotal =
                      selectedOrderDetail.orderDetails?.reduce((sum, item) => {
                        const unitPrice = item.unitPrice || 0;
                        const quantity = item.quantity || 0;
                        const discountPercent = item.discount || 0;
                        const itemTotal =
                          unitPrice * quantity * (1 - discountPercent / 100);
                        return sum + itemTotal;
                      }, 0) || 0;

                    const discountAmount =
                      selectedOrderDetail.discountAmount || 0;
                    const taxAmount = selectedOrderDetail.taxAmount || 0;
                    const pointsRedeemed =
                      selectedOrderDetail.pointsRedeemed || 0;
                    const totalAmount = selectedOrderDetail.totalAmount || 0;

                    // Tính phần trăm chiết khấu và thuế
                    const discountPercent =
                      subtotal > 0
                        ? ((discountAmount / subtotal) * 100).toFixed(2)
                        : 0;
                    const afterDiscount = subtotal - discountAmount;
                    const taxPercent =
                      afterDiscount > 0
                        ? ((taxAmount / afterDiscount) * 100).toFixed(2)
                        : 0;

                    return (
                      <>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">
                            Tạm tính:
                          </td>
                          <td className="text-end">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">
                            Chiết khấu:
                          </td>
                          <td className="text-end">
                            {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">
                            Thuế:
                          </td>
                          <td className="text-end">
                            {taxPercent > 0 ? `${taxPercent}%` : "0%"}
                          </td>
                        </tr>
                        {pointsRedeemed > 0 && (
                          <tr>
                            <td colSpan={4} className="fw-bold text-end">
                              Điểm đã sử dụng:
                            </td>
                            <td className="text-end text-success">
                              -
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(pointsRedeemed)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">
                            Tổng tiền:
                          </td>
                          <td className="text-end fw-bold">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(totalAmount)}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>Không có dữ liệu</p>
          </div>
        )}
      </Modal>
      {/* /Order Detail Modal */}

      <Modal
        open={!!showShiftModal}
        onCancel={() => {
          onCloseShiftModal();
          setShiftAmount("");
          setShiftNote("");
          setOpenCashDenominations([]);
          setCloseCashDenominations([]);
        }}
        footer={null}
        title={
          <div className="d-flex align-items-center">
            <i
              className={`ti ${
                currentShift && currentShift.status === "Mở"
                  ? "ti-x"
                  : "ti-cash"
              } me-2 fs-5`}
            ></i>
            <span>
              {currentShift && currentShift.status === "Mở"
                ? "Đóng ca làm việc"
                : "Mở ca làm việc"}
            </span>
          </div>
        }
        width={800}
        centered
      >
        <div className="modal-body">
          {shiftLoading ? (
            <div className="text-center py-4">
              <Spin size="large" />
            </div>
          ) : currentShift && currentShift.status === "Mở" ? (
            <div>
              <div className="mb-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Trạng thái:</span>
                  <span className="badge badge-success">Đang mở</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Bắt đầu:</span>
                  <span className="fw-semibold">
                    {currentShift?.openedAt
                      ? new Date(currentShift.openedAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tiền ban đầu:</span>
                  <span className="fw-semibold text-primary">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(currentShift?.initialCash || 0))}
                  </span>
                </div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                  <span className="text-muted">Tiền dự kiến:</span>
                  <span className="fw-bold text-success">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      Number(expectedDrawer ?? (currentShift?.initialCash || 0))
                    )}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="ti ti-cash me-2"></i>
                  Tiền thực tế trong két
                </label>
                <div className="input-icon-start position-relative mb-2">
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="Nhập số tiền hiện tại"
                    value={shiftAmount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        setShiftAmount("");
                        return;
                      }
                      // Kiểm tra nếu là số hợp lệ
                      const numValue = v.replace(/[^\d.]/g, "");
                      if (
                        numValue === v &&
                        !isNaN(parseFloat(v)) &&
                        parseFloat(v) >= 0
                      ) {
                        setShiftAmount(v);
                      } else {
                        message.warning("Vui lòng chỉ nhập số dương!");
                        // Giữ giá trị cũ nếu nhập ký tự không hợp lệ
                        return;
                      }
                    }}
                    onKeyDown={(e) => {
                      // Chặn các ký tự không phải số, phím điều hướng, và phím điều khiển
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "Tab",
                        "Escape",
                        "Enter",
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                        "Home",
                        "End",
                        ".",
                      ];
                      const isNumber = /[0-9]/.test(e.key);
                      const isAllowedKey = allowedKeys.includes(e.key);
                      const isCtrlA = e.ctrlKey && e.key === "a";
                      const isCtrlC = e.ctrlKey && e.key === "c";
                      const isCtrlV = e.ctrlKey && e.key === "v";
                      const isCtrlX = e.ctrlKey && e.key === "x";

                      // Chặn dấu trừ, dấu cộng, và ký tự e/E
                      if (
                        e.key === "-" ||
                        e.key === "+" ||
                        e.key === "e" ||
                        e.key === "E"
                      ) {
                        e.preventDefault();
                        message.warning("Vui lòng chỉ nhập số dương!");
                        return;
                      }

                      if (
                        !isNumber &&
                        !isAllowedKey &&
                        !isCtrlA &&
                        !isCtrlC &&
                        !isCtrlV &&
                        !isCtrlX
                      ) {
                        e.preventDefault();
                        message.warning("Vui lòng chỉ nhập số!");
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData("text");
                      const numericValue = pastedText.replace(/[^\d.]/g, "");
                      if (numericValue) {
                        const num = parseFloat(numericValue);
                        if (!isNaN(num) && num >= 0) {
                          setShiftAmount(numericValue);
                          message.success("Đã dán số tiền");
                        } else {
                          message.warning(
                            "Dữ liệu dán không hợp lệ! Vui lòng chỉ dán số."
                          );
                        }
                      }
                    }}
                    min="0"
                    step="1000"
                    style={{ paddingLeft: "40px" }}
                  />
                  <span
                    className="input-icon-addon"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  >
                    <i className="ti ti-currency-dollar text-gray-9" />
                  </span>
                </div>

                <CashDenominationInput
                  value={closeCashDenominations}
                  onChange={(denoms) => {
                    setCloseCashDenominations(denoms);
                    const total = denoms.reduce(
                      (sum, d) => sum + d.value * d.quantity,
                      0
                    );
                    setShiftAmount(total.toString());
                  }}
                />

                {/* Hiển thị chênh lệch */}
                {shiftAmount && !isNaN(shiftAmount) && (
                  <div
                    className={`mt-3 p-3 rounded ${
                      Number(shiftAmount) -
                        Number(
                          expectedDrawer ?? (currentShift?.initialCash || 0)
                        ) >=
                      0
                        ? "bg-success-subtle"
                        : "bg-danger-subtle"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">
                        <i
                          className={`ti ${
                            Number(shiftAmount) -
                              Number(
                                expectedDrawer ??
                                  (currentShift?.initialCash || 0)
                              ) >=
                            0
                              ? "ti-trending-up"
                              : "ti-trending-down"
                          } me-2`}
                        ></i>
                        Chênh lệch:
                      </span>
                      <span
                        className={`fw-bold fs-5 ${
                          Number(shiftAmount) -
                            Number(
                              expectedDrawer ?? (currentShift?.initialCash || 0)
                            ) >=
                          0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {Number(shiftAmount) -
                          Number(
                            expectedDrawer ?? (currentShift?.initialCash || 0)
                          ) >=
                        0
                          ? "+"
                          : ""}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          Number(shiftAmount) -
                            Number(
                              expectedDrawer ?? (currentShift?.initialCash || 0)
                            )
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <label className="form-label fw-bold">
                  <i className="ti ti-note me-2"></i>
                  Ghi chú chốt ca
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Nhập ghi chú về ca làm việc (nếu có)..."
                  value={shiftNote}
                  onChange={(e) => {
                    const v = e.target.value;
                    setShiftNote(v);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i
                className="ti ti-info-circle text-muted"
                style={{ fontSize: "48px" }}
              ></i>
              <h5 className="mt-3 mb-2">Ca chưa được mở</h5>
              <p className="text-muted">
                Vui lòng liên hệ quản lý để mở ca làm việc
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
          {currentShift && currentShift.status === "Mở" && (
            <button
              className="btn btn-purple"
              onClick={async () => {
                await onCloseShift(
                  shiftAmount,
                  shiftNote,
                  closeCashDenominations
                );
                setShiftAmount("");
                setShiftNote("");
                setCloseCashDenominations([]);
              }}
            >
              Đóng ca
            </button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PosModals;
