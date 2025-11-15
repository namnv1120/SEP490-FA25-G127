import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal, message, Spin } from "antd";
import TableTopHead from "../../../components/table-top-head";
import CommonSelect from "../../../components/select/common-select";
import { getAllOrders, getOrderById, cancelOrder } from "../../../services/OrderService";
import { getCustomerById } from "../../../services/CustomerService";
import { logoPng, barcodeImg3 } from "../../../utils/imagepath";
import "../../../assets/css/pos-sidebar.css";

const PosModals = ({ createdOrder, totalAmount, showPaymentMethodModal, onClosePaymentMethodModal, onPaymentCompleted, onSelectPaymentMethod, showCashPaymentModal, showMomoModal, showOrderSuccessModal, onCloseOrderSuccessModal, completedOrderForPrint, onCashPaymentConfirm, onMomoModalClose, onCompleteOrder, onCashPaymentCompleted, onHandleOrderPayment, onSelectOrder }) => {
  const [selectedTaxType, setSelectedTaxType] = useState(null);
  const [selectedDiscountType, setSelectedDiscountType] = useState(null);
  const [selectedWeightUnit, setSelectedWeightUnit] = useState(null);
  const [selectedTaxRate, setSelectedTaxRate] = useState(null);
  const [selectedCouponCode, setSelectedCouponCode] = useState(null);
  const [selectedDiscountMode, setSelectedDiscountMode] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [momoPayUrl, setMomoPayUrl] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [printReceiptLoading, setPrintReceiptLoading] = useState(false);
  const [showPrintReceiptModal, setShowPrintReceiptModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const cashReceivedInputRef = useRef(null);

  const handleButtonClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleSolve = () => {
    try {
      setInput(eval(input).toString());
    } catch (error) {
      setInput("Error");
    }
  };

  const handleKeyPress = (event) => {
    if (/[0-9+\-*/%.]/.test(event.key)) {
      setInput((prev) => prev + event.key);
    } else if (event.key === "Backspace") {
      handleBackspace();
    } else if (event.key === "Enter") {
      handleSolve();
    } else if (event.key === "c") {
      handleClear();
    }
  };

  const options = {
    taxType: [
      { value: "exclusive", label: "Exclusive" },
      { value: "inclusive", label: "Inclusive" },
    ],
    discountType: [
      { value: "percentage", label: "Percentage" },
      { value: "early_payment", label: "Early payment discounts" },
    ],
    weightUnits: [
      { value: "kg", label: "Kilogram" },
      { value: "g", label: "Grams" },
    ],
    taxRates: [
      { value: "select", label: "Select" },
      { value: "no_tax", label: "No Tax" },
      { value: "10", label: "@10" },
      { value: "15", label: "@15" },
      { value: "vat", label: "VAT" },
      { value: "sltax", label: "SLTAX" },
    ],
    couponCodes: [
      { value: "select", label: "Select" },
    ],
    discountMode: [
      { value: "select", label: "Select" },
      { value: "flat", label: "Flat" },
      { value: "percentage", label: "Percentage" },
    ],
    paymentMethods: [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
    ],
    paymentTypes: [
      { value: "credit", label: "Credit Card" },
      { value: "cash", label: "Cash" },
      { value: "cheque", label: "Cheque" },
      { value: "deposit", label: "Deposit" },
      { value: "points", label: "Points" },
    ],
  };

  // Extract MoMo payUrl from created order
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
        else if (createdOrder.payment.notes && createdOrder.payment.notes.startsWith("PAYURL:")) {
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
  const handleSelectPaymentMethod = (method) => {
    // This will be overridden by prop from Pos.jsx
  };

  // Calculate change amount
  const calculateChange = () => {
    if (!cashReceived) return 0;
    const received = parseFloat(cashReceived) || 0;
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
        const errorMessage = error.response?.data?.message ||
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

  // Function to fetch orders
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setOrdersLoading(true);
      }
      const data = await getAllOrders();
      setOrders(data || []);
      setOrdersFetched(true);
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      if (showLoading) {
        setOrdersLoading(false);
      }
    }
  };

  // Fetch orders when modal opens - always fetch but hide loading after first time
  useEffect(() => {
    const handleModalShown = async () => {
      const ordersModal = document.getElementById('orders');
      if (ordersModal && ordersModal.classList.contains('show')) {
        // Show loading only if no data yet
        await fetchOrders(orders.length === 0);
      }
    };

    // Listen for modal show event
    const ordersModal = document.getElementById('orders');
    if (ordersModal) {
      ordersModal.addEventListener('shown.bs.modal', handleModalShown);
      return () => {
        ordersModal.removeEventListener('shown.bs.modal', handleModalShown);
      };
    }
  }, [orders.length]);


  // Helper function to get order status
  const getOrderStatus = (order) => {
    // Map API status to Vietnamese status
    const status = order.orderStatus || order.status || "";

    if (status === "Hoàn tất" || status === "Completed" || status === "COMPLETED") {
      return "Hoàn tất";
    }
    if (status === "Đã hủy" || status === "Cancelled" || status === "CANCELLED") {
      return "Đã hủy";
    }
    // Default to "Chờ xác nhận"
    return "Chờ xác nhận";
  };

  // Filter orders by status and search query, then sort by date (newest first)
  const getOrdersByStatus = (status) => {
    return orders
      .filter(order => {
        const orderStatus = getOrderStatus(order);
        return orderStatus === status;
      })
      .filter(order => {
        // Apply search filter
        if (!ordersSearchQuery) return true;
        const query = ordersSearchQuery.toLowerCase();
        const customerName = (order.customer?.fullName || order.customer?.customerName || "").toLowerCase();
        const orderNumber = (order.orderNumber || order.orderId || "").toString().toLowerCase();
        const phone = (order.customer?.phone || "").toLowerCase();
        return customerName.includes(query) || orderNumber.includes(query) || phone.includes(query);
      })
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(a.orderDate || a.createdAt || a.createdDate || 0);
        const dateB = new Date(b.orderDate || b.createdAt || b.createdDate || 0);
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
        } catch (error) {
          // If customer fetch fails, continue without customer data
          console.warn("Không thể tải thông tin khách hàng:", error);
        }
      }

      setSelectedOrderDetail(orderDetail);
      setShowOrderDetailModal(true);

      setOrderDetailLoading(false);
    } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
          // If customer fetch fails, continue without customer data
          console.warn("Không thể tải thông tin khách hàng:", error);
        }
      }

      setOrderToPrint(orderData);
      setPrintReceiptLoading(false);

      // Show Ant Design Modal (similar to Order Detail Modal)
      setShowPrintReceiptModal(true);
    } catch (error) {
      setPrintReceiptLoading(false);
      message.error("Không thể mở hóa đơn in");
    }
  };

  // Helper function to close all modals and clean up
  const closeAllModals = () => {
    // Close all Bootstrap modals
    if (window.bootstrap && window.bootstrap.Modal) {
      const allModals = document.querySelectorAll('.modal.show');
      allModals.forEach(modal => {
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      });
    }

    // Remove all backdrops (both Bootstrap and custom)
    const backdrops = document.querySelectorAll('.modal-backdrop, .modal-backdrop-custom');
    backdrops.forEach(backdrop => backdrop.remove());

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Close all Ant Design modals by resetting states
    setShowOrderDetailModal(false);
    setSelectedOrderDetail(null);
  };

  // Handle select order from order list - load order into POS
  const handleSelectOrder = async (order) => {
    try {
      // Fetch full order details if needed
      let orderData = order;
      if (!order.orderDetails || !order.customer) {
        try {
          orderData = await getOrderById(order.orderId);
        } catch (error) {
          message.error("Không thể tải thông tin đơn hàng");
          return;
        }
      }

      // Close orders modal first
      const ordersModal = document.getElementById('orders');
      if (ordersModal && ordersModal.classList.contains('show')) {
        if (window.bootstrap && window.bootstrap.Modal) {
          const ordersBsModal = window.bootstrap.Modal.getInstance(ordersModal);
          if (ordersBsModal) {
            ordersBsModal.hide();

            // Clean up backdrops and body styles
            setTimeout(() => {
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';

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
    } catch (error) {
      message.error("Không thể chọn đơn hàng này");
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (order) => {
    try {
      // Confirm before canceling
      Modal.confirm({
        title: 'Xác nhận hủy đơn',
        content: `Bạn có chắc chắn muốn hủy đơn hàng #${order.orderNumber || order.orderId}?`,
        okText: 'Hủy đơn',
        cancelText: 'Không',
        okButtonProps: { danger: true },
        centered: true, // Hiển thị modal ở giữa màn hình
        onOk: async () => {
          try {
            setCancellingOrderId(order.orderId);
            await cancelOrder(order.orderId);
            message.success("Đã hủy đơn hàng thành công!");

            // Refresh orders list
            try {
              const data = await getAllOrders();
              setOrders(data || []);
            } catch (error) {
              console.error("Không thể tải lại danh sách đơn hàng:", error);
            }

            // Reset POS về trạng thái chưa tạo đơn (giống như khi thanh toán thành công)
            if (onPaymentCompleted) {
              await onPaymentCompleted();
            }
          } catch (error) {
            const errorMessage = error.response?.data?.message ||
              error.message ||
              "Hủy đơn hàng thất bại. Vui lòng thử lại!";
            message.error(errorMessage);
          } finally {
            setCancellingOrderId(null);
          }
        }
      });
    } catch (error) {
      message.error("Không thể hủy đơn hàng này");
    }
  };

  // Handle payment for order from order list
  const handleOrderPayment = async (order) => {
    try {
      // Fetch full order details if needed
      let orderData = order;
      if (!order.orderDetails || !order.customer) {
        try {
          orderData = await getOrderById(order.orderId);
        } catch (error) {
          message.error("Không thể tải thông tin đơn hàng");
          return;
        }
      }

      // Close orders modal first, then show payment modal
      const ordersModal = document.getElementById('orders');
      if (ordersModal && ordersModal.classList.contains('show')) {
        if (window.bootstrap && window.bootstrap.Modal) {
          const ordersBsModal = window.bootstrap.Modal.getInstance(ordersModal);
          if (ordersBsModal) {
            // Hide the modal
            ordersBsModal.hide();

            // Clean up backdrops and body styles immediately
            setTimeout(() => {
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';

              // Show payment modal after cleanup
              if (onHandleOrderPayment) {
                onHandleOrderPayment(orderData);
              } else {
                message.warning("Chức năng thanh toán chưa được tích hợp");
              }
            }, 200);
            return;
          }
        }
      }

      // If orders modal is not open, just show payment modal
      if (onHandleOrderPayment) {
        await onHandleOrderPayment(orderData);
      } else {
        message.warning("Chức năng thanh toán chưa được tích hợp");
      }
    } catch (error) {
      message.error("Không thể xử lý thanh toán cho đơn hàng này");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    } else if (method === "MOMO" || method === "Ví điện tử" || method === "MoMo") {
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
              <h5>Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount || createdOrder?.totalAmount || 0)}</h5>
            </div>
          </div>
          <div className="col-6">
            <button
              className="btn btn-success w-100 py-3"
              onClick={async () => {
                if (onSelectPaymentMethod) {
                  try {
                    await onSelectPaymentMethod("cash");
                  } catch (error) {
                  }
                }
              }}
              style={{ fontSize: '16px' }}
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
                  } catch (error) {
                  }
                }
              }}
              style={{ fontSize: '16px' }}
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
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount || createdOrder?.totalAmount || 0)}
                readOnly
                style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Tiền khách đưa <span className="text-danger">*</span>
              </label>
              <div className="input-icon-start position-relative">
                <input
                  ref={cashReceivedInputRef}
                  type="number"
                  className="form-control"
                  placeholder="Nhập số tiền khách đưa"
                  value={cashReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho phép số dương hoặc rỗng
                    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
                      setCashReceived(value);
                    }
                  }}
                  min="0"
                  step="1000"
                  style={{ fontSize: '16px', paddingLeft: '40px' }}
                  autoFocus
                  onKeyDown={(e) => {
                    // Chặn nhập dấu trừ, dấu cộng, và ký tự e/E
                    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                />
                <span className="input-icon-addon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
                  <i className="ti ti-currency-dollar text-gray-9" />
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
                className={`form-control ${calculateChange() >= 0 ? 'text-success' : 'text-danger'}`}
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(calculateChange()))}
                readOnly
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: calculateChange() >= 0 ? '#d4edda' : '#f8d7da'
                }}
              />
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12">
              <button
                className="btn btn-success w-100"
                onClick={handleCashPaymentConfirm}
                style={{ fontSize: '16px', padding: '10px' }}
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
          // Just close the modal when cancel is clicked
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
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount || createdOrder?.totalAmount || 0)}
            </h3>
          </div>
          {momoPayUrl ? (
            <>
              <div className="mb-3 p-3 bg-light rounded d-flex justify-content-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(momoPayUrl)}`} alt="MoMo QR Code" />
              </div>
              <p className="text-muted mb-3">
                Quét mã QR bằng ứng dụng MoMo để thanh toán
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.open(momoPayUrl, '_blank')}
              >
                <i className="ti ti-external-link me-2" />
                Mở MoMo App
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-danger">Chưa có QR code thanh toán. Vui lòng thử lại.</p>
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
            <div className="mb-3" style={{ fontSize: '64px', color: '#52c41a' }}>
              <i className="ti ti-circle-check" />
            </div>
            <h4 className="mb-2 text-success">Thanh toán thành công!</h4>
            {(completedOrderForPrint || createdOrder) && (
              <p className="text-muted mb-0">
                Mã đơn: <strong>#{(completedOrderForPrint || createdOrder)?.orderNumber || (completedOrderForPrint || createdOrder)?.orderId || '-'}</strong>
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
                    <span>Mã đơn: </span>#{orderToPrint.orderNumber || orderToPrint.orderId || "-"}
                  </div>
                  <div className="invoice-user-name">
                    <span>Tên khách hàng: </span>{getCustomerName(orderToPrint)}
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="invoice-user-name">
                    <span>Ngày: </span>{formatDate(orderToPrint.orderDate || orderToPrint.createdAt || orderToPrint.createdDate)}
                  </div>
                  <div className="invoice-user-name">
                    <span>SĐT: </span>{getCustomerPhone(orderToPrint)}
                  </div>
                </div>
              </div>
            </div>
            <table className="table-borderless w-100 table-fit mb-3">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}># Sản phẩm</th>
                  <th style={{ width: '25%', textAlign: 'right', paddingRight: '5px' }}>Đơn giá</th>
                  <th style={{ width: '5%', textAlign: 'center', paddingLeft: '10px', paddingRight: '5px' }}>SL</th>
                  <th style={{ width: '25%' }} className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderToPrint.orderDetails && orderToPrint.orderDetails.length > 0 ? (
                  <>
                    {orderToPrint.orderDetails.map((item, index) => {
                      const unitPrice = item.unitPrice || 0;
                      const quantity = item.quantity || 0;
                      const discount = item.discount || 0;
                      const total = (unitPrice * quantity) - discount;

                      return (
                        <tr key={item.orderDetailId || index}>
                          <td style={{ width: '45%' }}>{item.productName || "N/A"}</td>
                          <td style={{ width: '25%', textAlign: 'right', paddingRight: '5px' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(unitPrice)}</td>
                          <td style={{ width: '5%', textAlign: 'center', paddingLeft: '10px', paddingRight: '5px' }}>{quantity}</td>
                          <td style={{ width: '25%' }} className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={4}>
                        <table className="table-borderless w-100 table-fit">
                          <tbody>
                            {(() => {
                              // Tính subtotal từ orderDetails
                              const subtotal = orderToPrint.orderDetails?.reduce((sum, item) => {
                                const unitPrice = item.unitPrice || 0;
                                const quantity = item.quantity || 0;
                                const itemDiscount = item.discount || 0;
                                return sum + (unitPrice * quantity - itemDiscount);
                              }, 0) || 0;

                              // Lấy các giá trị từ order
                              const discountAmount = orderToPrint.discountAmount || 0;
                              const taxAmount = orderToPrint.taxAmount || 0;
                              const pointsRedeemed = orderToPrint.pointsRedeemed || 0;
                              const totalAmount = orderToPrint.totalAmount || 0;

                              return (
                                <>
                                  <tr>
                                    <td className="fw-bold">Tạm tính:</td>
                                    <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</td>
                                  </tr>
                                  <tr>
                                    <td className="fw-bold">Giảm giá:</td>
                                    <td className="text-end">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</td>
                                  </tr>
                                  <tr>
                                    <td className="fw-bold">Thuế:</td>
                                    <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount)}</td>
                                  </tr>
                                  {pointsRedeemed > 0 && (
                                    <tr>
                                      <td className="fw-bold">Điểm đã sử dụng:</td>
                                      <td className="text-end text-success">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsRedeemed)}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td className="fw-bold">Tổng cộng:</td>
                                    <td className="text-end fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}</td>
                                  </tr>
                                </>
                              );
                            })()}
                            <tr>
                              <td className="fw-bold">Trạng thái thanh toán:</td>
                              <td className="text-end">{orderToPrint.paymentStatus || orderToPrint.orderStatus || "Chưa thanh toán"}</td>
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
                <p>
                  Cảm ơn quý khách đã mua hàng!
                </p>
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

      {/* Products */}
      {/* Create Customer */}
      <div
        className="modal fade"
        id="create"
        tabIndex={-1}
        aria-labelledby="create"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Customer Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Create Customer */}

      {/* Hold */}
      <div
        className="modal fade modal-default pos-modal"
        id="hold-order"
        aria-labelledby="hold-order"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Hold order</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="bg-light br-10 p-4 text-center mb-3">
                  <h2 className="display-1">0.00</h2>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Order Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter order reference"
                  />
                </div>
                <p>
                  The current order will be set on hold. You can retreive this
                  order from the pending order button. Providing a reference to
                  it might help you to identify the order more quickly.
                </p>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Hold */}

      {/* Edit Product */}
      <div
        className="modal fade modal-default pos-modal"
        id="edit-product"
        aria-labelledby="edit-product"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Price <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.taxType}
                        value={selectedTaxType}
                        onChange={(e) => setSelectedTaxType(e.value)}
                        placeholder="Select Tax Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-percentage" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.discountType}
                        value={selectedDiscountType}
                        onChange={(e) => setSelectedDiscountType(e.value)}
                        placeholder="Select Discount Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Sale Unit <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.weightUnits}
                        value={selectedWeightUnit}
                        onChange={(e) => setSelectedWeightUnit(e.value)}
                        placeholder="Select Sale Unit"
                        filter={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Product */}

      {/* Delete Product */}
      <div
        className="modal fade modal-default"
        id="delete"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-danger-transparent text-danger mb-2">
                    <i className="ti ti-trash" />
                  </div>
                  <h3 className="mb-2">Are you Sure!</h3>
                  <p className="fs-16 mb-3">
                    The current order will be deleted as no payment has been
                    made so far.
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      No, Cancel
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Product */}

      {/* Orders */}
      <div
        className="modal fade pos-modal pos-orders-sidebar"
        id="orders"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-sidebar"
          role="document"
        >
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
                  <i className={`ti ti-refresh ${ordersLoading ? 'spinning' : ''}`} />
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
                        style={{ paddingLeft: '40px' }}
                      />
                      <span className="input-icon-addon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
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
                          <div key={order.orderId} className="card bg-light mb-3">
                            <div className="card-body">
                              <span className="badge bg-warning fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Khách hàng:</span> {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Phương thức thanh toán:</span> {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Ngày:</span> {formatDate(order.orderDate || order.createdAt || order.createdDate)}
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
                                      disabled={cancellingOrderId === order.orderId}
                                    >
                                      <i className="ti ti-x me-1" />
                                      {cancellingOrderId === order.orderId ? 'Đang hủy...' : 'Hủy đơn'}
                                    </button>
                                  </>
                                )}
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleViewOrderDetail(order.orderId)}
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
                        style={{ paddingLeft: '40px' }}
                      />
                      <span className="input-icon-addon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
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
                          <div key={order.orderId} className="card bg-light mb-3">
                            <div className="card-body">
                              <span className="badge bg-success fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Khách hàng:</span> {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Phương thức thanh toán:</span> {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Ngày:</span> {formatDate(order.orderDate || order.createdAt || order.createdDate)}
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
                                  onClick={() => handleViewOrderDetail(order.orderId)}
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
                        style={{ paddingLeft: '40px' }}
                      />
                      <span className="input-icon-addon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
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
                          <div key={order.orderId} className="card bg-light mb-3">
                            <div className="card-body">
                              <span className="badge bg-danger fs-12 mb-2">
                                Mã đơn: #{order.orderNumber || order.orderId}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Khách hàng:</span> {getCustomerName(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Phương thức thanh toán:</span> {getPaymentMethodText(order)}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Ngày:</span> {formatDate(order.orderDate || order.createdAt || order.createdDate)}
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
                                  onClick={() => handleViewOrderDetail(order.orderId)}
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

      {/* Scan Payment */}
      <div className="modal fade modal-default" id="scan-payment">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
              <div className="success-wrap scan-wrap text-center">
                <h5>
                  <span className="text-gray-6">Amount to Pay :</span> $0.00
                </h5>
                <div className="scan-img">
                  <div className="scan-placeholder">QR Code</div>
                </div>
                <p className="mb-3">
                  Scan your Phone or UPI App to Complete the payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Scan Payment */}

      {/* Payment Cash */}
      <div className="modal fade modal-default" id="payment-cash">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Finalize Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Received Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Paying Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="change-item mb-3">
                      <label className="form-label">Change</label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.paymentTypes}
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.value)}
                        placeholder="Select Payment Type"
                        filter={false}
                      />
                    </div>
                    <div className="quick-cash payment-content bg-light d-block mb-3">
                      <div className="d-flex align-items-center flex-wra gap-4">
                        <h5 className="text-nowrap">Quick Cash</h5>
                        <div className="d-flex align-items-center flex-wrap gap-3">
                          {[10, 20, 50, 100, 500, 1000].map((amount) => (
                            <div key={amount} className="form-check">
                              <input
                                type="radio"
                                className="btn-check"
                                name="cash"
                                id={`cash${amount}`}
                              />
                              <label className="btn btn-white" htmlFor={`cash${amount}`}>
                                {amount}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Receiver</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Sale Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Staff Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Payment Cash */}

      {/* Payment Card */}
      <div className="modal fade modal-default" id="payment-card">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Finalize Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Received Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Paying Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="change-item mb-3">
                      <label className="form-label">Change</label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.paymentTypes}
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.value)}
                        placeholder="Select Payment Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Receiver</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Payment Card */}

      {/* Calculator */}
      <div
        className="modal fade pos-modal"
        id="calculator"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body p-0" onKeyDown={handleKeyPress}>
              <div className="calculator-wrap">
                <div className="p-3">
                  <div className="d-flex align-items-center">
                    <h3>Calculator</h3>
                    <button
                      type="button"
                      className="close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div>
                    <input
                      className="input"
                      type="text"
                      placeholder="0"
                      value={input}
                      readOnly
                    />
                  </div>
                </div>
                <div className="calculator-body d-flex justify-content-between">
                  <div className="text-center">
                    <button className="btn btn-clear" onClick={handleClear}>
                      C
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("7")}
                    >
                      7
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("4")}
                    >
                      4
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("1")}
                    >
                      1
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick(",")}
                    >
                      ,
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("/")}
                    >
                      ÷
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("8")}
                    >
                      8
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("5")}
                    >
                      5
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("2")}
                    >
                      2
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("00")}
                    >
                      00
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("%")}
                    >
                      %
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("9")}
                    >
                      9
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("6")}
                    >
                      6
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("3")}
                    >
                      3
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick(".")}
                    >
                      .
                    </button>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-clear" onClick={handleBackspace}>
                      <i className="ti ti-backspace" />
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("*")}
                    >
                      x
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("-")}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("+")}
                    >
                      +
                    </button>
                    <button className="btn btn-clear" onClick={handleSolve}>
                      =
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Calculator */}

      {/* Cash Register Details */}
      <div
        className="modal fade pos-modal"
        id="cash-register"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cash Register Details</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Cash in Hand</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Amount</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Cash Register Details */}

      {/* Today's Sale */}
      <div
        className="modal fade pos-modal"
        id="today-sale"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Today&apos;s Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Total Sale Amount</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Credit Card Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cheque Payment:</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Today's Sale */}

      {/* Today's Profit */}
      <div
        className="modal fade pos-modal"
        id="today-profit"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Today&apos;s Profit</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row justify-content-center g-3 mb-3">
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-success bg-success-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Total Sale</p>
                    <h3 className="text-success">$0.00</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-danger bg-danger-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Expense</p>
                    <h3 className="text-danger">$0.00</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-info bg-info-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Total Profit</p>
                    <h3 className="text-info">$0.00</h3>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Product Revenue</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Product Cost</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Profit
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Today's Profit */}

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
                  <span className="fw-bold">Mã đơn:</span> #{selectedOrderDetail.orderNumber || selectedOrderDetail.orderId}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Khách hàng:</span> {selectedOrderDetail.customerName || selectedOrderDetail.customer?.fullName || selectedOrderDetail.customer?.customerName || "Khách lẻ"}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <span className="fw-bold">Trạng thái:</span> {selectedOrderDetail.orderStatus || getOrderStatus(selectedOrderDetail)}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Ngày đặt:</span> {formatDate(selectedOrderDetail.orderDate || selectedOrderDetail.createdAt || selectedOrderDetail.createdDate)}
                </p>
                <p className="mb-2">
                  <span className="fw-bold">Trạng thái thanh toán:</span> {selectedOrderDetail.paymentStatus || "-"}
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
                    <th>Giảm giá</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderDetail.orderDetails && selectedOrderDetail.orderDetails.length > 0 ? (
                    selectedOrderDetail.orderDetails.map((item, index) => (
                      <tr key={item.orderDetailId || index}>
                        <td>{item.productName || "N/A"}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice || 0)}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discount || 0)}</td>
                        <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice || ((item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0)))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">Không có sản phẩm</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {(() => {
                    // Tính subtotal từ orderDetails
                    const subtotal = selectedOrderDetail.orderDetails?.reduce((sum, item) => {
                      const unitPrice = item.unitPrice || 0;
                      const quantity = item.quantity || 0;
                      const itemDiscount = item.discount || 0;
                      return sum + (unitPrice * quantity - itemDiscount);
                    }, 0) || 0;

                    const discountAmount = selectedOrderDetail.discountAmount || 0;
                    const taxAmount = selectedOrderDetail.taxAmount || 0;
                    const pointsRedeemed = selectedOrderDetail.pointsRedeemed || 0;
                    const totalAmount = selectedOrderDetail.totalAmount || 0;

                    return (
                      <>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">Tạm tính:</td>
                          <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">Giảm giá:</td>
                          <td className="text-end">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">Thuế:</td>
                          <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(taxAmount)}</td>
                        </tr>
                        {pointsRedeemed > 0 && (
                          <tr>
                            <td colSpan={4} className="fw-bold text-end">Điểm đã sử dụng:</td>
                            <td className="text-end text-success">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsRedeemed)}</td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={4} className="fw-bold text-end">Tổng tiền:</td>
                          <td className="text-end fw-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
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
    </>
  );
};

export default PosModals;

