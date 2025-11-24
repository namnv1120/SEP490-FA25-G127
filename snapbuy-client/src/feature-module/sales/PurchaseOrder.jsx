/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import {
  deletePurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrderById,
  searchPurchaseOrders,
  confirmPurchaseOrder,
  revertPurchaseOrder,
  sendPurchaseOrderEmail,
} from "../../services/PurchaseOrderService";
import { message, Spin, Modal } from "antd";
import { allRoutes } from "../../routes/AllRoutes";
import DeleteModal from "../../components/delete-modal";
import { Modal as BootstrapModal } from "bootstrap";
import PurchaseOrderDetailModal from "../../core/modals/sales/PurchaseOrderDetailModal";
import { getMyInfo } from "../../services/AccountService";

const PurchaseOrder = () => {
  const route = allRoutes;
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const getAccountRole = () => {
    const role = localStorage.getItem("role");
    return role;
  };

  const isAdmin = () => {
    const role = getAccountRole();
    return role === "Quản trị viên";
  };

  const isOwner = () => {
    const role = getAccountRole();
    return role === "Chủ cửa hàng";
  };

  const canApprove = () => {
    const result = isAdmin() || isOwner();
    return result;
  };

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
    if (amount === undefined || amount === null) return "—";
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

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);

      const backendSortField = sortField || "orderDate";
      const backendSortDir = sortOrder === "asc" ? "ASC" : "DESC";
      const backendPage = currentPage - 1;

      const result = await searchPurchaseOrders(
        searchQuery || "",
        backendPage,
        rows,
        backendSortField,
        backendSortDir
      );

      const formatted = (result.content || []).map((item) => ({
        ...item,
        orderDate: item.orderDate || item.createdAt,
        receivedDate: item.receivedDate || null,
        totalAmount: item.totalAmount ?? 0,
        status: item.status || "Chờ duyệt",
      }));

      setListData(formatted);
      setTotalRecords(result.totalElements || 0);
    } catch (error) {
      message.error("Không thể tải danh sách đơn đặt hàng!");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleBulkAction = async (action) => {
    try {
      const checkboxes = document.querySelectorAll(
        '.table-list-card input[type="checkbox"]:checked'
      );
      const selectedIds = [];

      checkboxes.forEach((cb) => {
        const id = cb.dataset.id;
        if (id && id !== "select-all") selectedIds.push(id);
      });

      if (selectedIds.length === 0) {
        message.warning("Vui lòng chọn ít nhất một đơn hàng!");
        return;
      }

      if (action === "approve" && !canApprove()) {
        message.error(
          "Chỉ Chủ cửa hàng và Quản trị viên mới có quyền duyệt đơn!"
        );
        return;
      }

      // Lấy accountId từ API để đảm bảo đúng và tồn tại trong database
      let currentAccountId = null;
      if (action === "approve" || action === "revert") {
        try {
          const userInfo = await getMyInfo();
          currentAccountId = (userInfo.result || userInfo)?.id;
          console.log("Current accountId from API:", currentAccountId);
          
          if (!currentAccountId) {
            message.error("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại!");
            return;
          }
        } catch (error) {
          message.error("Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại!");
          return;
        }
      }

      const validOrders = [];
      const invalidOrders = [];

      for (const id of selectedIds) {
        const order = listData.find((o) => o.purchaseOrderId === id);

        if (!order) {
          invalidOrders.push(id);
          continue;
        }
        const status = order.status?.toLowerCase();

        if (action === "approve") {
          if (status === "chờ duyệt") {
            validOrders.push(id);
          } else {
            invalidOrders.push(
              `${order.purchaseOrderNumber} (${order.status})`
            );
          }
        } else if (action === "cancel") {
          if (
            status === "chờ duyệt" ||
            status === "đã duyệt" ||
            status === "chờ xác nhận"
          ) {
            validOrders.push(id);
          } else {
            invalidOrders.push(
              `${order.purchaseOrderNumber} (${order.status})`
            );
          }
        } else if (action === "receive") {
          if (status === "chờ xác nhận") {
            validOrders.push(id);
          } else if (status === "chờ duyệt") {
            invalidOrders.push(
              `${order.purchaseOrderNumber} - Chưa được duyệt`
            );
          } else if (status === "đã duyệt") {
            invalidOrders.push(
              `${order.purchaseOrderNumber} - Chưa cập nhật số lượng thực nhận`
            );
          } else {
            invalidOrders.push(
              `${order.purchaseOrderNumber} (${order.status})`
            );
          }
        } else if (action === "revert") {
          if (status === "chờ xác nhận") {
            validOrders.push(id);
          } else {
            invalidOrders.push(
              `${order.purchaseOrderNumber} (${order.status})`
            );
          }
        }
      }

      if (invalidOrders.length > 0) {
        const actionText =
          action === "approve"
            ? "duyệt"
            : action === "cancel"
            ? "huỷ"
            : action === "receive"
            ? "xác nhận nhận hàng"
            : action === "revert"
            ? "huỷ xác nhận"
            : "xử lý";

        message.warning({
          content: (
            <div>
              <p>Không thể {actionText} các đơn sau:</p>
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

      setLoading(true);

      let successCount = 0;
      let errorCount = 0;
      let errorMessages = [];

      for (const id of validOrders) {
        try {
          if (action === "approve") {
            await approvePurchaseOrder(id, { 
              ownerAccountId: currentAccountId,
              notes: "Duyệt hàng loạt" 
            });
          } else if (action === "cancel") {
            await cancelPurchaseOrder(id);
          } else if (action === "receive") {
            const orderDetail = await getPurchaseOrderById(id);

            // Cho phép receiveQuantity = 0 (nhà cung cấp hết hàng), chỉ cần có giá trị (không null)
            const allHaveReceivedQty = orderDetail.details?.every((d) => {
              const qty = d.receiveQuantity ?? d.receivedQuantity;
              return qty !== null && qty !== undefined;
            });

            if (!allHaveReceivedQty) {
              const order = listData.find((o) => o.purchaseOrderId === id);
              errorMessages.push(
                `${
                  order?.purchaseOrderNumber || id
                }: Chưa cập nhật số lượng thực nhận`
              );
              errorCount++;
              continue;
            }

            // Chuẩn bị items array cho confirm request
            const items = orderDetail.details.map((detail) => ({
              purchaseOrderDetailId: detail.purchaseOrderDetailId || detail.id,
              receivedQuantity: detail.receiveQuantity ?? detail.receivedQuantity ?? 0,
            }));

            await confirmPurchaseOrder(id, {
              items,
              notes: "Xác nhận nhận hàng loạt",
            });
          } else if (action === "revert") {
            await revertPurchaseOrder(id, {
              ownerAccountId: currentAccountId,
              notes: "Quay lại trạng thái đã duyệt",
            });
          }
          successCount++;
        } catch (err) {
          errorCount++;
          const order = listData.find((o) => o.purchaseOrderId === id);
          const errorMsg =
            err.response?.data?.message || err.message || "Lỗi không xác định";
          errorMessages.push(
            `${order?.purchaseOrderNumber || id}: ${errorMsg}`
          );
        }
      }

      if (successCount > 0) {
        message.success(`Đã xử lý thành công ${successCount} đơn hàng!`);
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

      await fetchPurchaseOrders();

      document
        .querySelectorAll('.table-list-card input[type="checkbox"]:checked')
        .forEach((cb) => {
          cb.checked = false;
        });
    } catch (err) {
      message.error("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }, 0);
  };

  const handleDeleteConfirm = async (purchaseOrderId) => {
    try {
      await deletePurchaseOrder(purchaseOrderId);
      await fetchPurchaseOrders();
      setSelectedItem(null);

      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = BootstrapModal.getInstance(modalElement);
        if (modal) modal.hide();
      }

      message.success("Đã xoá đơn đặt hàng thành công!");
    } catch (error) {
      message.error("Không thể xoá đơn đặt hàng!");
    }
  };

  const handleDeleteCancel = () => {
    setSelectedItem(null);
  };

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
  }, [listData]);

  const generateEmailTemplate = async (orderIds) => {
    const orders = await Promise.all(
      orderIds.map((id) => getPurchaseOrderById(id))
    );

    const escapeHtml = (text) => {
      if (!text) return "";
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const formatCurrency = (amount) => {
      return `${Number(amount).toLocaleString("vi-VN")} ₫`;
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const currentDate = new Date();
    const sendDate = currentDate.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let html = `<!DOCTYPE html>
<html lang='vi'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Phiếu nhập kho</title>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
.container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; }
.email-header h1 { color: white; border: none; padding: 0; margin: 0 0 10px 0; font-size: 24px; }
.email-header p { margin: 5px 0; color: rgba(255,255,255,0.9); }
h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
h2 { color: #34495e; margin-top: 30px; }
.header-info { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
.header-info p { margin: 5px 0; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
th { background-color: #3498db; color: white; font-weight: bold; }
tr:hover { background-color: #f5f5f5; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.total-section { margin-top: 20px; padding: 15px; background-color: #ecf0f1; border-radius: 5px; }
.total-row { display: flex; justify-content: space-between; margin: 10px 0; }
.total-amount { font-size: 18px; font-weight: bold; color: #27ae60; }
.footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #7f8c8d; font-size: 14px; }
.order-separator { margin: 30px 0; border-top: 2px solid #3498db; }
</style>
</head>
<body>
<div class='container'>
<div class='email-header'>
<h1>Hệ Thống Quản Lý Bán Hàng - SnapBuy</h1>
<p><strong>Ngày gửi:</strong> ${sendDate}</p>
<p><strong>Nội dung:</strong> Phiếu nhập kho</p>
</div>
<h1>Phiếu Nhập Kho</h1>`;

    orders.forEach((order, index) => {
      if (index > 0) {
        html += `<div class='order-separator'></div>`;
      }

      const firstOrder = orders[0];
      html += `
<div class='header-info'>
<p><strong>Kính gửi:</strong> ${escapeHtml(
        firstOrder?.supplierName || ""
      )}</p>`;
      if (firstOrder?.supplierCode) {
        html += `<p><strong>Mã nhà cung cấp:</strong> ${escapeHtml(
          firstOrder.supplierCode
        )}</p>`;
      }
      html += `<p><strong>Đơn hàng:</strong> ${escapeHtml(
        order.purchaseOrderNumber || ""
      )}</p>
<p><strong>Ngày tạo đơn:</strong> ${formatDateTime(
        order.orderDate || order.createdAt
      )}</p>
</div>`;

      html += `
<table>
<thead>
<tr>
<th>STT</th>
<th>Sản phẩm</th>
<th class='text-center'>Số lượng</th>
<th class='text-right'>Đơn giá</th>
<th class='text-right'>Thành tiền</th>
</tr>
</thead>
<tbody>`;

      let subtotal = 0;
      if (order.details && order.details.length > 0) {
        order.details.forEach((detail, idx) => {
          const itemTotal = (detail.quantity || 0) * (detail.unitPrice || 0);
          subtotal += itemTotal;
          html += `
<tr>
<td>${idx + 1}</td>
<td>${escapeHtml(detail.productName || "")}${
            detail.productCode
              ? `<br><small style='color: #7f8c8d;'>Mã: ${escapeHtml(
                  detail.productCode
                )}</small>`
              : ""
          }</td>
<td class='text-center'>${detail.quantity || 0}</td>
<td class='text-right'>${formatCurrency(detail.unitPrice || 0)}</td>
<td class='text-right'>${formatCurrency(itemTotal)}</td>
</tr>`;
        });
      } else {
        html += `<tr><td colspan='5' class='text-center'>Không có sản phẩm</td></tr>`;
      }

      html += `</tbody></table>`;

      const taxAmount = order.taxAmount || 0;
      const totalAmount =
        order.totalAmount || subtotal + (subtotal * taxAmount) / 100;

      html += `
<div class='total-section'>
<div class='total-row'><span>Tổng tiền hàng:</span><span>${formatCurrency(
        subtotal
      )}</span></div>`;
      if (taxAmount > 0) {
        const taxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
        html += `<div class='total-row'><span>Thuế (${taxRate.toFixed(
          1
        )}%):</span><span>${formatCurrency(taxAmount)}</span></div>`;
      }
      html += `
<div class='total-row'><span class='total-amount'>Tổng cộng:</span><span class='total-amount'>${formatCurrency(
        totalAmount
      )}</span></div>
</div>`;
    });

    html += `
<div class='footer'>
<p>Cảm ơn quý khách đã hợp tác với chúng tôi!</p>
<p>Email này được gửi tự động từ hệ thống quản lý kho SnapBuy.</p>
</div>
</div>
</body>
</html>`;

    return html;
  };

  const handleSendEmail = async () => {
    try {
      const checkboxes = document.querySelectorAll(
        '.table-list-card input[type="checkbox"]:checked'
      );
      const selectedIds = [];

      checkboxes.forEach((cb) => {
        const id = cb.dataset.id;
        if (id && id !== "select-all") selectedIds.push(id);
      });

      if (selectedIds.length === 0) {
        message.warning("Vui lòng chọn ít nhất một đơn hàng để gửi email!");
        return;
      }

      // Kiểm tra các đơn hàng có ở trạng thái "Đã duyệt" không
      const validOrders = [];
      const invalidOrders = [];

      for (const id of selectedIds) {
        const order = listData.find((o) => o.purchaseOrderId === id);
        if (!order) {
          invalidOrders.push(id);
          continue;
        }
        const status = order.status?.toLowerCase();
        if (status === "đã duyệt") {
          validOrders.push(id);
        } else {
          invalidOrders.push(`${order.purchaseOrderNumber} (${order.status})`);
        }
      }

      if (invalidOrders.length > 0) {
        message.warning({
          content: (
            <div>
              <p>
                Chỉ có thể gửi email cho các đơn hàng ở trạng thái "Đã duyệt".
                Các đơn sau không thể gửi:
              </p>
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
        message.error(
          "Không có đơn hàng nào ở trạng thái 'Đã duyệt' để gửi email!"
        );
        return;
      }

      setLoading(true);

      try {
        // Tạo template HTML
        const htmlContent = await generateEmailTemplate(validOrders);
        const subject =
          validOrders.length === 1
            ? "Phiếu nhập kho"
            : `Phiếu nhập kho - ${validOrders.length} đơn hàng`;

        // Gửi email
        await sendPurchaseOrderEmail({
          purchaseOrderIds: validOrders,
          subject,
          htmlContent,
          forceResend: false,
        });

        message.success(
          `Đã gửi email thành công cho ${validOrders.length} đơn hàng!`
        );

        // Uncheck tất cả checkbox
        document
          .querySelectorAll('.table-list-card input[type="checkbox"]:checked')
          .forEach((cb) => {
            cb.checked = false;
          });

        // Refresh data để cập nhật emailSentAt
        fetchPurchaseOrders();
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || err.message || "Lỗi không xác định";

        // Kiểm tra xem có phải lỗi đơn đã được gửi không
        if (
          errorMsg.includes("đã được gửi email") &&
          errorMsg.includes("Bạn có muốn gửi lại không")
        ) {
          Modal.confirm({
            title: "Xác nhận gửi lại email",
            content: errorMsg,
            okText: "Gửi lại",
            cancelText: "Hủy",
            onOk: async () => {
              try {
                setLoading(true);
                const htmlContent = await generateEmailTemplate(validOrders);
                const subject =
                  validOrders.length === 1
                    ? "Phiếu nhập kho"
                    : `Phiếu nhập kho - ${validOrders.length} đơn hàng`;

                await sendPurchaseOrderEmail({
                  purchaseOrderIds: validOrders,
                  subject,
                  htmlContent,
                  forceResend: true,
                });

                message.success(
                  `Đã gửi lại email thành công cho ${validOrders.length} đơn hàng!`
                );

                // Uncheck tất cả checkbox
                document
                  .querySelectorAll(
                    '.table-list-card input[type="checkbox"]:checked'
                  )
                  .forEach((cb) => {
                    cb.checked = false;
                  });

                // Refresh data
                fetchPurchaseOrders();
              } catch (retryErr) {
                const retryErrorMsg =
                  retryErr.response?.data?.message ||
                  retryErr.message ||
                  "Lỗi không xác định";
                message.error(`Không thể gửi lại email: ${retryErrorMsg}`);
              } finally {
                setLoading(false);
              }
            },
          });
        } else {
          message.error(`Không thể gửi email: ${errorMsg}`);
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      message.error("Có lỗi xảy ra khi gửi email!");
      setLoading(false);
    }
  };

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: (row) => (
        <label className="checkboxs">
          <input type="checkbox" data-id={row.purchaseOrderId} />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "select",
    },

    {
      header: "Mã tạo đơn",
      field: "purchaseOrderNumber",
      key: "purchaseOrderNumber",
      sortable: true,
      body: (row) => (
        <button
          type="button"
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => {
            setSelectedOrderId(row.purchaseOrderId);
            setDetailModalOpen(true);
          }}
          style={{ cursor: "pointer" }}
        >
          {row.purchaseOrderNumber}
        </button>
      ),
    },
    {
      header: "Nhà cung cấp",
      field: "supplierName",
      key: "supplierName",
      sortable: true,
    },
    {
      header: "Người tạo đơn",
      field: "fullName",
      key: "fullName",
      sortable: true,
    },
    {
      header: "Ngày tạo phiếu",
      body: (row) => formatDateTime(row.orderDate),
      field: "orderDate",
      key: "orderDate",
      sortable: true,
    },
    {
      header: "Ngày nhận phiếu",
      body: (row) => formatDateTime(row.receivedDate),
      field: "receivedDate",
      key: "receivedDate",
      sortable: true,
    },
    {
      header: "Tổng tiền",
      body: (row) => formatCurrency(row.totalAmount),
      field: "totalAmount",
      key: "totalAmount",
      sortable: true,
    },
    {
      header: "Trạng thái",
      body: (row) => renderStatusBadge(row.status),
      field: "status",
      key: "status",
      sortable: true,
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => {
        const status = row.status?.toLowerCase();
        const isReceived = status === "đã nhận hàng";
        const isCancelled = status === "đã hủy";
        const isWaitingConfirmation = status === "chờ xác nhận";

        // Không hiện nút Edit và Delete khi đã nhận hàng hoặc đã hủy
        // Chỉ cho phép edit khi ở trạng thái Chờ duyệt hoặc Đã duyệt
        if (isReceived || isCancelled || isWaitingConfirmation) {
          return null;
        }

        return (
          <div className="edit-delete-action d-flex align-items-center">
            <Link
              to={route.editpurchaseorder?.replace(":id", row.purchaseOrderId)}
              className="me-2 p-2 border rounded bg-transparent"
            >
              <i className="feather icon-edit"></i>
            </Link>
            <button
              className="p-2 d-flex align-items-center border rounded bg-transparent"
              onClick={() => handleDeleteClick(row)}
            >
              <i className="feather icon-trash-2"></i>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Đơn đặt hàng</h4>
                <h6>Quản lý danh sách đơn đặt hàng về kho</h6>
              </div>
            </div>
            <TableTopHead
              onRefresh={fetchPurchaseOrders}
              onSendEmail={handleSendEmail}
              showExcel={false}
              showMail={true}
            />
            <div className="page-btn d-flex align-items-center gap-2">
              {canApprove() && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleBulkAction("approve")}
                >
                  <i className="ti ti-check me-1"></i>
                  Duyệt
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleBulkAction("cancel")}
              >
                <i className="ti ti-x me-1"></i>
                Huỷ
              </button>

              {canApprove() && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleBulkAction("receive")}
                >
                  <i className="ti ti-package me-1"></i>
                  Xác nhận nhận hàng
                </button>
              )}
              {canApprove() && (
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleBulkAction("revert")}
                >
                  <i className="ti ti-x me-1"></i>
                  Huỷ xác nhận
                </button>
              )}

              <Link to={route.addpurchaseorder} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Tạo đơn đặt hàng
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
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
                    dataKey="purchaseOrderId"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    serverSidePagination={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal xác nhận xoá */}
        <DeleteModal
          itemId={selectedItem?.purchaseOrderId}
          itemName={selectedItem?.purchaseOrderNumber}
          onDelete={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Modal chi tiết đơn hàng */}
        <PurchaseOrderDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
          purchaseOrderId={selectedOrderId}
        />

        <CommonFooter />
      </div>
    </>
  );
};

export default PurchaseOrder;
