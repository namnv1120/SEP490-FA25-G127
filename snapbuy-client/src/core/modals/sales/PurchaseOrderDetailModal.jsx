import { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message } from "antd";
import { getPurchaseOrderById } from "../../../services/PurchaseOrderService";

const PurchaseOrderDetailModal = ({ isOpen, onClose, purchaseOrderId }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrderById(purchaseOrderId);

      if (!data) {
        message.warning("Không tìm thấy dữ liệu đơn hàng!");
        onClose();
        return;
      }

      setOrderData(data);
    } catch (error) {
      const errorMessage = error.message || "Không thể tải chi tiết đơn hàng!";
      message.error(errorMessage);

      if (
        error.message?.includes("Status: 404") ||
        error.message?.includes("Status: 500")
      ) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, onClose]);

  useEffect(() => {
    if (isOpen && purchaseOrderId) {
      fetchOrderDetail();
    }
  }, [isOpen, purchaseOrderId, fetchOrderDetail]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return `${Number(amount).toLocaleString("vi-VN")} ₫`;
  };

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "chờ duyệt":
        return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
      case "đã duyệt":
        return <span className="badge bg-info">Đã duyệt</span>;
      case "chờ xác nhận":
        return (
          <span
            className="badge text-white"
            style={{ backgroundColor: "#ff9800" }}
          >
            Chờ xác nhận
          </span>
        );
      case "đã nhận hàng":
        return <span className="badge bg-success">Đã nhận hàng</span>;
      default:
        return <span className="badge bg-danger">Đã huỷ</span>;
    }
  };

  const isReceived = orderData?.status?.toLowerCase() === "đã nhận hàng";
  const isWaitingConfirmation =
    orderData?.status?.toLowerCase() === "chờ xác nhận";
  const isApproved = orderData?.status?.toLowerCase() === "đã duyệt";
  // Nếu đã duyệt hoặc chờ xác nhận, tính theo số lượng thực nhận (kể cả = 0)
  const shouldUseReceivedQty =
    isApproved || isWaitingConfirmation || isReceived;

  const subtotal =
    orderData?.details?.reduce((sum, item) => {
      const receiveQty = item.receiveQuantity || item.receivedQuantity || 0;
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      // Nếu đã duyệt/chờ xác nhận/đã nhận hàng và có receiveQuantity (kể cả = 0), tính theo receiveQuantity
      // Ngược lại tính theo quantity
      const qty =
        shouldUseReceivedQty && receiveQty !== null && receiveQty !== undefined
          ? receiveQty
          : quantity;
      return sum + qty * unitPrice;
    }, 0) || 0;

  // taxAmount từ server là SỐ TIỀN THUẾ, không phải tỷ lệ %
  const taxAmount = orderData?.taxAmount || 0;

  // Tính tỷ lệ thuế % từ số tiền thuế và subtotal
  const taxRate = subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(1) : 0;

  // Sử dụng taxAmount trực tiếp vì nó đã là số tiền thuế
  const calculatedTax = taxAmount;

  // Tổng cộng
  const totalAmount = orderData?.totalAmount || subtotal + calculatedTax;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      centered={true}
      closable={true}
      title={
        <div>
          <h4 className="mb-1">Chi tiết đơn đặt hàng</h4>
          {orderData && (
            <span className="text-muted">{orderData.purchaseOrderNumber}</span>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Spin size="large" />
        </div>
      ) : orderData ? (
        <div className="purchase-order-detail">
          {/* THÔNG TIN ĐƠN HÀNG */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">Thông tin đơn hàng</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Nhà cung cấp:</label>
                  <p className="mb-0 fw-semibold">
                    {orderData.supplierName || "—"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Người tạo đơn:</label>
                  <p className="mb-0 fw-semibold">
                    {orderData.fullName || "—"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Ngày tạo phiếu:</label>
                  <p className="mb-0">
                    {formatDateTime(orderData.orderDate || orderData.createdAt)}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Ngày nhận phiếu:</label>
                  <p className="mb-0">
                    {orderData.receivedDate
                      ? formatDateTime(orderData.receivedDate)
                      : "—"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="text-muted small">Trạng thái:</label>
                  <p className="mb-0">{renderStatusBadge(orderData.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DANH SÁCH SẢN PHẨM */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">Danh sách sản phẩm</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        style={{
                          width:
                            orderData.status?.toLowerCase() === "đã duyệt" ||
                            orderData.status?.toLowerCase() ===
                              "chờ xác nhận" ||
                            orderData.status?.toLowerCase() === "đã nhận hàng"
                              ? "30%"
                              : "40%",
                        }}
                      >
                        Sản phẩm
                      </th>
                      <th style={{ width: "15%" }} className="text-center">
                        Số lượng
                      </th>
                      {(orderData.status?.toLowerCase() === "đã duyệt" ||
                        orderData.status?.toLowerCase() === "chờ xác nhận" ||
                        orderData.status?.toLowerCase() === "đã nhận hàng") && (
                        <th style={{ width: "15%" }} className="text-center">
                          SL thực nhận
                        </th>
                      )}
                      <th style={{ width: "20%" }} className="text-end">
                        Đơn giá
                      </th>
                      <th style={{ width: "20%" }} className="text-end">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.details && orderData.details.length > 0 ? (
                      orderData.details.map((item, index) => {
                        const isApprovedOrReceived =
                          orderData.status?.toLowerCase() === "đã duyệt" ||
                          orderData.status?.toLowerCase() === "chờ xác nhận" ||
                          orderData.status?.toLowerCase() === "đã nhận hàng";
                        const receiveQty =
                          item.receiveQuantity || item.receivedQuantity || 0;
                        const quantity = item.quantity || 0;
                        const unitPrice = item.unitPrice || 0;
                        // Nếu đã duyệt/chờ xác nhận/đã nhận hàng và có receiveQuantity (kể cả = 0), tính theo receiveQuantity
                        const total =
                          isApprovedOrReceived &&
                          receiveQty !== null &&
                          receiveQty !== undefined
                            ? receiveQty * unitPrice
                            : quantity * unitPrice;

                        return (
                          <tr key={index}>
                            <td>
                              <div>
                                <p className="mb-0 fw-semibold">
                                  {item.productName || "—"}
                                </p>
                                {item.productCode && (
                                  <small className="text-muted">
                                    Mã: {item.productCode}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td className="text-center">{quantity}</td>
                            {isApprovedOrReceived && (
                              <td className="text-center">
                                <span
                                  className={
                                    receiveQty > 0 ? "text-success fw-bold" : ""
                                  }
                                >
                                  {receiveQty}
                                </span>
                              </td>
                            )}
                            <td className="text-end">
                              {formatCurrency(unitPrice)}
                            </td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(total)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          Không có sản phẩm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TỔNG TIỀN */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8"></div>
                <div className="col-md-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tổng tiền hàng:</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  {calculatedTax > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span>Thuế ({taxRate}%):</span>
                      <strong>{formatCurrency(calculatedTax)}</strong>
                    </div>
                  )}
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <span className="fw-bold">Tổng cộng:</span>
                    <strong className="text-primary fs-5">
                      {formatCurrency(totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GHI CHÚ */}
          {orderData.notes && (
            <div className="card mb-3">
              <div className="card-header bg-light">
                <h5 className="mb-0">Ghi chú</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{orderData.notes}</p>
              </div>
            </div>
          )}

          {/* NÚT ACTION */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-5">
          <p className="text-muted">Không tìm thấy thông tin đơn hàng</p>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseOrderDetailModal;
