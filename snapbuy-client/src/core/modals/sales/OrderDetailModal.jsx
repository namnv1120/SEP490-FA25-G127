import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, Spin, message, Divider, Descriptions, Typography } from "antd";
import { getOrderById } from "../../../services/OrderService";

const { Title, Text } = Typography;

// OrderDetailModal.jsx
const OrderDetailModal = ({ show, onHide, order, accountNamesMap = {} }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [creatorName, setCreatorName] = useState("Đang tải...");

  useEffect(() => {
    if (!show || !order?.orderId) return;

    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(order.orderId);
        setOrderDetail(data);

        const accountId = data.accountId || data.createdById;
        if (accountId && accountNamesMap[accountId]) {
          setCreatorName(accountNamesMap[accountId]);
        } else if (accountId) {
          try {
            const account = await getAccountById(accountId);
            const name = account.fullName || account.username || account.email || "Không xác định";
            setCreatorName(name);
          } catch (err) {
            setCreatorName("Không tìm thấy");
          }
        } else {
          setCreatorName("Khách lẻ");
        }

        const keys = ["lineItems", "orderDetails", "items", "orderLines", "orderItems", "details"];
        let items = [];
        for (const key of keys) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            items = data[key];
            break;
          }
        }
        const formattedItems = items.map((item, idx) => ({
          key: idx,
          productName: item.productName || item.name || item.title || "Sản phẩm",
          quantity: Number(item.quantity || item.qty || 1),
          unitPrice: Number(item.price || item.unitPrice || 0),
          total: (Number(item.price || item.unitPrice || 0)) * (Number(item.quantity || item.qty || 1)),
        }));
        setLineItems(formattedItems);

      } catch (error) {
        message.error("Không thể tải chi tiết đơn hàng.");
        setCreatorName("Lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [show, order?.orderId, accountNamesMap]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderStatusTag = (status) => {
    const map = {
      "Chờ xác nhận": { color: "orange", text: "Chờ xác nhận" },
      "Hoàn tất": { color: "green", text: "Hoàn tất" },
      "Đã hủy": { color: "red", text: "Đã hủy" },
      "PENDING": { color: "orange", text: "Chờ xác nhận" },
      "COMPLETED": { color: "green", text: "Hoàn tất" },
      "CANCELLED": { color: "red", text: "Đã hủy" },
      "CANCELED": { color: "red", text: "Đã hủy" },
    };
    const key = Object.keys(map).find(k => k.toLowerCase() === status?.toLowerCase());
    const tag = map[key] || { color: "default", text: status || "Không rõ" };
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    const map = {
      "Đã thanh toán": { color: "green", text: "Đã thanh toán" },
      "Chưa thanh toán": { color: "orange", text: "Chưa thanh toán" },
      "PAID": { color: "green", text: "Đã thanh toán" },
      "PAYMENT_COMPLETED": { color: "green", text: "Đã thanh toán" },
      "UNPAID": { color: "orange", text: "Chưa thanh toán" },
      "PENDING": { color: "orange", text: "Chưa thanh toán" },
    };
    const key = Object.keys(map).find(k => k.toLowerCase() === status?.toLowerCase());
    const tag = map[key] || { color: "default", text: status || "Không rõ" };
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: "40%",
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: "15%",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      width: "20%",
      render: (price) => `${Number(price).toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: "25%",
      render: (total) => (
        <Text strong type="success">
          {Number(total).toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
  ];

  if (!order) return null;

  return (
    <Modal
      open={show}
      onCancel={onHide}
      footer={null}
      width={900}
      centered
      title={
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết đơn hàng: <Text type="primary">{order.orderNumber}</Text>
        </Title>
      }
    >
      <Spin spinning={loading}>
        {orderDetail ? (
          <div style={{ padding: "16px 0" }}>
            {/* Thông tin chính */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng" span={1}>
                <strong>{order.orderNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng" span={1}>
                {formatDate(order.orderDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" span={1}>
                <Text strong>{order.customerName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo đơn" span={1}>
                {order.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn" span={1}>
                {getOrderStatusTag(order.orderStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán" span={1}>
                {getPaymentStatusTag(order.paymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức thanh toán" span={2}>
                {order.paymentMethod || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Danh sách sản phẩm */}
            <Title level={5}>Sản phẩm</Title>
            {lineItems.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  dataSource={lineItems}
                  pagination={false}
                  size="small"
                  bordered
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3} align="right">
                        <Text strong>Tổng cộng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right">
                        <Text strong type="success">
                          {Number(order.totalAmount).toLocaleString("vi-VN")} ₫
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              </>
            ) : (
              <Text type="secondary" italic>
                Không có sản phẩm trong đơn hàng.
              </Text>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary">Không tìm thấy thông tin chi tiết đơn hàng.</Text>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailModal;