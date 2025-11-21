import { useState, useEffect, useRef } from "react";
import { Modal, Input, message } from "antd";
import { getPurchaseOrderById } from "../../../services/PurchaseOrderService";

const SendEmailModal = ({ isOpen, onClose, purchaseOrderIds, onSend }) => {
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const previewRef = useRef(null);

    useEffect(() => {
        if (isOpen && purchaseOrderIds && purchaseOrderIds.length > 0) {
            // Tạo subject mặc định
            const defaultSubject = purchaseOrderIds.length === 1
                ? "Phiếu nhập kho"
                : `Phiếu nhập kho - ${purchaseOrderIds.length} đơn hàng`;
            setSubject(defaultSubject);

            // Tạo template HTML mặc định
            generateDefaultTemplate();
        } else {
            setSubject("");
            setHtmlContent("");
            
        }
    }, [isOpen, purchaseOrderIds]);

    // Cập nhật preview khi htmlContent thay đổi
    useEffect(() => {
        if (previewRef.current && htmlContent) {
            previewRef.current.srcDoc = htmlContent;
        }
    }, [htmlContent]);


    const generateDefaultTemplate = async () => {
        try {
            const orders = await Promise.all(
                purchaseOrderIds.map(id => getPurchaseOrderById(id))
            );

            let html = `<!DOCTYPE html>
<html lang='vi'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Phiếu nhập kho</title>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
.container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
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
<h1>Phiếu Nhập Kho</h1>`;

            // Lấy thông tin nhà cung cấp từ đơn hàng đầu tiên
            const firstOrder = orders[0];
            if (firstOrder && firstOrder.supplierName) {
                html += `
<div class='header-info'>
<p><strong>Nhà cung cấp:</strong> ${escapeHtml(firstOrder.supplierName)}</p>`;
                if (firstOrder.supplierCode) {
                    html += `<p><strong>Mã nhà cung cấp:</strong> ${escapeHtml(firstOrder.supplierCode)}</p>`;
                }
                html += `</div>`;
            }

            // Thêm thông tin từng đơn hàng
            orders.forEach((order, index) => {
                if (index > 0) {
                    html += `<div class='order-separator'></div>`;
                }

                html += `
<h2>Đơn hàng: ${escapeHtml(order.purchaseOrderNumber || "")}</h2>
<div class='header-info'>
<p><strong>Ngày tạo:</strong> ${formatDateTime(order.orderDate || order.createdAt)}</p>
<p><strong>Người tạo:</strong> ${escapeHtml(order.fullName || "")}</p>
<p><strong>Trạng thái:</strong> ${escapeHtml(order.status || "")}</p>`;
                if (order.notes) {
                    html += `<p><strong>Ghi chú:</strong> ${escapeHtml(order.notes)}</p>`;
                }
                html += `</div>`;

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
<td>${escapeHtml(detail.productName || "")}${detail.productCode ? `<br><small style='color: #7f8c8d;'>Mã: ${escapeHtml(detail.productCode)}</small>` : ""}</td>
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
                const totalAmount = order.totalAmount || subtotal + (subtotal * taxAmount / 100);

                html += `
<div class='total-section'>
<div class='total-row'><span>Tổng tiền hàng:</span><span>${formatCurrency(subtotal)}</span></div>`;
                if (taxAmount > 0) {
                    const taxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
                    html += `<div class='total-row'><span>Thuế (${taxRate.toFixed(1)}%):</span><span>${formatCurrency(taxAmount)}</span></div>`;
                }
                html += `
<div class='total-row'><span class='total-amount'>Tổng cộng:</span><span class='total-amount'>${formatCurrency(totalAmount)}</span></div>
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

            setHtmlContent(html);
        } catch {
            message.error("Không thể tạo template email");
        }
    };

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

    const handleSend = () => {
        if (!subject.trim()) {
            message.warning("Vui lòng nhập tiêu đề email");
            return;
        }
        if (!htmlContent.trim()) {
            message.warning("Vui lòng nhập nội dung email");
            return;
        }
        if (onSend) {
            onSend({
                purchaseOrderIds,
                subject: subject.trim(),
                htmlContent: htmlContent.trim(),
            });
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            onOk={handleSend}
            okText="Gửi email"
            cancelText="Hủy"
            title="Gửi email phiếu nhập kho đến nhà cung cấp"
            width={900}
            confirmLoading={false}
        >
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                    Tiêu đề email:
                </label>
                <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Nhập tiêu đề email"
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                    Nội dung email:
                </label>
                <div
                    style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        minHeight: "400px",
                        maxHeight: "500px",
                        overflow: "auto",
                        backgroundColor: "#f4f4f4",
                        padding: "10px",
                    }}
                >
                    {htmlContent ? (
                        <iframe
                            ref={previewRef}
                            srcDoc={htmlContent}
                            style={{
                                width: "100%",
                                height: "450px",
                                border: "none",
                                backgroundColor: "#fff",
                            }}
                            title="Email Preview"
                        />
                    ) : (
                        <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
                            <p>Đang tải nội dung email...</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SendEmailModal;
