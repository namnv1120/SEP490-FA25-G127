import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Modal,
  message,
  Spin,
  Tag,
  Typography,
  Space,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { closeShift, getCurrentShift } from "../../services/ShiftService";
import { getAllOrders } from "../../services/OrderService";
import { getMyInfo } from "../../services/AccountService";
import CloseShiftModal from "../../components/shift/CloseShiftModal";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";

const { Title, Text } = Typography;

const PosShift = () => {
  const [loading, setLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [orders, setOrders] = useState([]);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [closingNote, setClosingNote] = useState("");
  const [cashDenominations, setCashDenominations] = useState([]);
  const [showInitialCashModal, setShowInitialCashModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftData, userInfo] = await Promise.all([
        getCurrentShift(),
        getMyInfo(),
      ]);

      setCurrentShift(shiftData);

      if (shiftData && shiftData.status === "Mở" && shiftData.openedAt) {
        try {
          const fromISO = shiftData.openedAt;
          const toISO = new Date().toISOString();

          // Format dates as YYYY-MM-DD for API
          const formatDate = (isoString) => {
            const d = new Date(isoString);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;
          };

          const fromDate = formatDate(fromISO);
          const toDate = formatDate(toISO);

          // Call getAllOrders with date range parameters
          const resp = await getAllOrders({
            from: fromDate,
            to: toDate,
            size: 1000,
          });

          const allOrders = resp?.content || resp?.result || resp || [];

          console.log("📊 Fetching orders for shift:", {
            fromDate,
            toDate,
            totalOrders: allOrders.length,
            shiftId: shiftData?.shiftId,
          });

          const myAccountId =
            userInfo?.result?.accountId || userInfo?.accountId || userInfo?.id;
          const fromTime = new Date(fromISO).getTime();
          const toTime = new Date(toISO).getTime();

          console.log("🔍 Filter criteria:", {
            myAccountId,
            fromTime: new Date(fromTime).toLocaleString("vi-VN"),
            toTime: new Date(toTime).toLocaleString("vi-VN"),
          });

          const shiftOrders = allOrders.filter((o) => {
            const orderAccountId =
              o.accountId || o.account?.id || o.account?.accountId;
            const isAccountMatch =
              String(orderAccountId) === String(myAccountId);

            const orderTime = new Date(
              o.orderDate || o.createdDate || o.createdAt
            ).getTime();
            const isTimeMatch = orderTime >= fromTime && orderTime <= toTime;

            if (!isAccountMatch && !isTimeMatch) {
              console.log("❌ Order filtered out:", {
                orderId: o.orderId,
                orderAccountId,
                myAccountId,
                isAccountMatch,
                orderTime: new Date(orderTime).toLocaleString("vi-VN"),
                isTimeMatch,
              });
            }

            return isAccountMatch && isTimeMatch;
          });

          setOrders(shiftOrders || []);
        } catch (error) {
          console.error("❌ Error loading orders:", error);
          setOrders([]);
        }
      } else {
        console.log("⚠️ No active shift or shift not open");
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading shift data:", error);
      setCurrentShift(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleCloseShift = async () => {
    try {
      setLoading(true);
      const total = cashDenominations.reduce(
        (sum, d) => sum + d.denomination * d.quantity,
        0
      );
      await closeShift(total, closingNote, cashDenominations);
      message.success("Đã đóng ca thành công!");
      setCloseModalVisible(false);
      setClosingNote("");
      setCashDenominations([]);
      await loadData();
    } catch (error) {
      console.error("Error closing shift:", error);
      message.error(error.response?.data?.message || "Không thể đóng ca");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "0 ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const calculateStats = () => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        cashRevenue: 0,
        nonCashRevenue: 0,
      };
    }
    const completedOrders = orders.filter(
      (o) =>
        o.orderStatus?.toLowerCase().includes("hoàn tất") ||
        o.orderStatus?.toUpperCase() === "COMPLETED"
    );
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );
    const cashRevenue = completedOrders
      .filter((o) => {
        const method = (
          o.payment?.paymentMethod ||
          o.paymentMethod ||
          ""
        ).toUpperCase();
        return method.includes("CASH") || method.includes("TIỀN MẶT");
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const nonCashRevenue = totalRevenue - cashRevenue;
    return {
      totalOrders: completedOrders.length,
      totalRevenue,
      cashRevenue,
      nonCashRevenue,
    };
  };

  const stats = calculateStats();
  const expectedDrawer = (currentShift?.initialCash || 0) + stats.cashRevenue;

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <Title level={3}>Quản lý ca làm việc</Title>
            <Text type="secondary">Xem thông tin ca và đơn hàng trong ca</Text>
          </div>
          <TableTopHead
            showExcel={false}
            onRefresh={(e) => {
              if (e) e.preventDefault();
              loadData();
              message.success("Đã làm mới dữ liệu!");
            }}
          />
        </div>
        <Spin spinning={loading}>
          {currentShift && currentShift.status === "Mở" ? (
            <>
              <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size="small">
                      <Space>
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Ca đang mở
                        </Tag>
                        {currentShift.openedByAccountName && (
                          <Text type="secondary">
                            Mở bởi: {currentShift.openedByAccountName}
                          </Text>
                        )}
                      </Space>
                      <Text>
                        <ClockCircleOutlined /> Bắt đầu:{" "}
                        {formatDateTime(currentShift.openedAt)}
                      </Text>
                      <Text>
                        <DollarOutlined /> Tiền ban đầu:{" "}
                        <Text
                          strong
                          style={{
                            color: "#1890ff",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => setShowInitialCashModal(true)}
                        >
                          {formatCurrency(currentShift.initialCash)}
                        </Text>
                        {currentShift.initialCashDenominations &&
                          currentShift.initialCashDenominations.length > 0 && (
                            <Text
                              type="secondary"
                              style={{ marginLeft: "8px" }}
                            >
                              (Click để xem chi tiết)
                            </Text>
                          )}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      danger
                      size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={() => setCloseModalVisible(true)}
                    >
                      Đóng ca
                    </Button>
                  </Col>
                </Row>
              </Card>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng đơn hàng"
                      value={stats.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng doanh thu"
                      value={stats.totalRevenue}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatCurrency(value)}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Thu tiền mặt"
                      value={stats.cashRevenue}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatCurrency(value)}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Thu chuyển khoản"
                      value={stats.nonCashRevenue}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatCurrency(value)}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Card
                title={
                  <Title level={4}>
                    Danh sách đơn hàng ({orders.length} đơn)
                  </Title>
                }
              >
                <Table
                  columns={[
                    {
                      title: "Mã đơn",
                      dataIndex: "orderNumber",
                      key: "orderNumber",
                      width: 150,
                      render: (text, record) => (
                        <Text strong style={{ color: "#E67E22" }}>
                          {text || record.orderId || "-"}
                        </Text>
                      ),
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: "customerName",
                      key: "customerName",
                      width: 150,
                      render: (text, record) =>
                        text || record.customer?.fullName || "Khách lẻ",
                    },
                    {
                      title: "Người tạo đơn",
                      dataIndex: "accountName",
                      key: "accountName",
                      width: 150,
                      render: (text, record) =>
                        text || record.account?.fullName || "N/A",
                    },
                    {
                      title: "Ngày đặt hàng",
                      dataIndex: "orderDate",
                      key: "orderDate",
                      width: 150,
                      render: (text) => formatDateTime(text),
                    },
                    {
                      title: "Trạng thái đơn",
                      dataIndex: "orderStatus",
                      key: "orderStatus",
                      width: 130,
                      align: "center",
                      render: (status) => status || "-",
                    },
                    {
                      title: "Trạng thái thanh toán",
                      dataIndex: "paymentStatus",
                      key: "paymentStatus",
                      width: 150,
                      align: "center",
                      render: (status, record) =>
                        status || record.payment?.status || "-",
                    },
                    {
                      title: "Hình thức",
                      dataIndex: "paymentMethod",
                      key: "paymentMethod",
                      width: 120,
                      align: "center",
                      render: (_, record) => {
                        const method =
                          record.payment?.paymentMethod ||
                          record.paymentMethod ||
                          "-";
                        const isCash =
                          method.toUpperCase().includes("CASH") ||
                          method.includes("Tiền mặt");
                        return isCash ? "Tiền mặt" : method;
                      },
                    },
                    {
                      title: "Tổng tiền",
                      dataIndex: "totalAmount",
                      key: "totalAmount",
                      width: 130,
                      align: "right",
                      render: (amount) => (
                        <Text strong style={{ color: "#E67E22" }}>
                          {formatCurrency(amount)}
                        </Text>
                      ),
                    },
                  ]}
                  dataSource={orders}
                  rowKey="orderId"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} đơn`,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                  }}
                  size="small"
                  bordered
                  expandable={{
                    expandedRowRender: (record) => {
                      const orderDetails = record.orderDetails || [];
                      return (
                        <div
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Row gutter={[16, 12]}>
                            <Col span={24}>
                              <Text
                                strong
                                style={{
                                  fontSize: "15px",
                                  display: "block",
                                  marginBottom: "12px",
                                }}
                              >
                                Chi tiết đơn hàng{" "}
                                {record.orderNumber || `#${record.orderId}`}
                              </Text>
                            </Col>
                            {orderDetails.length > 0 ? (
                              <Col span={24}>
                                <Table
                                  columns={[
                                    {
                                      title: "Sản phẩm",
                                      dataIndex: "productName",
                                      key: "productName",
                                      render: (text, detail) => (
                                        <div>
                                          <div>
                                            {text ||
                                              detail.product?.productName ||
                                              "N/A"}
                                          </div>
                                          {detail.productCode && (
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: "12px" }}
                                            >
                                              Mã: {detail.productCode}
                                            </Text>
                                          )}
                                        </div>
                                      ),
                                    },
                                    {
                                      title: "Số lượng",
                                      dataIndex: "quantity",
                                      key: "quantity",
                                      width: 100,
                                      align: "center",
                                      render: (qty) => <Text>{qty || 0}</Text>,
                                    },
                                    {
                                      title: "Đơn giá",
                                      dataIndex: "unitPrice",
                                      key: "unitPrice",
                                      width: 140,
                                      align: "right",
                                      render: (price) => (
                                        <Text>{formatCurrency(price)}</Text>
                                      ),
                                    },
                                    {
                                      title: "Thành tiền",
                                      dataIndex: "totalPrice",
                                      key: "totalPrice",
                                      width: 150,
                                      align: "right",
                                      render: (total, detail) => (
                                        <Text>
                                          {formatCurrency(
                                            total ||
                                              detail.quantity * detail.unitPrice
                                          )}
                                        </Text>
                                      ),
                                    },
                                  ]}
                                  dataSource={orderDetails}
                                  rowKey={(detail, index) =>
                                    detail.orderDetailId || index
                                  }
                                  pagination={false}
                                  size="small"
                                  bordered
                                  summary={() => (
                                    <Table.Summary fixed>
                                      <Table.Summary.Row
                                        style={{ backgroundColor: "#fafafa" }}
                                      >
                                        <Table.Summary.Cell
                                          index={0}
                                          colSpan={3}
                                        >
                                          <Text strong>Tổng cộng đơn hàng</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell
                                          index={1}
                                          align="right"
                                        >
                                          <Text strong>
                                            {formatCurrency(record.totalAmount)}
                                          </Text>
                                        </Table.Summary.Cell>
                                      </Table.Summary.Row>
                                    </Table.Summary>
                                  )}
                                />
                              </Col>
                            ) : (
                              <Col span={24}>
                                <div
                                  style={{
                                    padding: "20px",
                                    textAlign: "center",
                                    backgroundColor: "#fafafa",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <Text type="secondary">
                                    Không có chi tiết sản phẩm
                                  </Text>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      );
                    },
                    rowExpandable: () => true,
                  }}
                  locale={{
                    emptyText: (
                      <div style={{ padding: "40px 0", textAlign: "center" }}>
                        <ShoppingCartOutlined
                          style={{
                            fontSize: 48,
                            color: "#d9d9d9",
                            marginBottom: 16,
                          }}
                        />
                        <div>
                          <Text type="secondary">
                            Chưa có đơn hàng nào trong ca này
                          </Text>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Vào trang POS để tạo đơn hàng mới
                          </Text>
                        </div>
                      </div>
                    ),
                  }}
                  summary={(pageData) => {
                    if (!pageData || pageData.length === 0) return null;
                    const totalCompleted = pageData.filter(
                      (o) =>
                        o.orderStatus?.toLowerCase().includes("hoàn tất") ||
                        o.orderStatus?.toUpperCase() === "COMPLETED"
                    ).length;
                    const total = pageData.reduce((sum, record) => {
                      const isCompleted =
                        record.orderStatus
                          ?.toLowerCase()
                          .includes("hoàn tất") ||
                        record.orderStatus?.toUpperCase() === "COMPLETED";
                      return (
                        sum +
                        (isCompleted ? Number(record.totalAmount || 0) : 0)
                      );
                    }, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <Table.Summary.Cell index={0} colSpan={8}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <Text strong>Tổng cộng</Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "13px" }}
                              >
                                ({totalCompleted} đơn hoàn tất / Trang hiện tại)
                              </Text>
                            </div>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text strong style={{ color: "#E67E22" }}>
                              {formatCurrency(total)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <CloseCircleOutlined
                  style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
                />
                <Title level={4}>Chưa có ca làm việc</Title>
                <Text type="secondary">
                  Vui lòng liên hệ quản lý để mở ca làm việc
                </Text>
              </div>
            </Card>
          )}
        </Spin>

        <CloseShiftModal
          visible={closeModalVisible}
          onCancel={() => {
            setCloseModalVisible(false);
            setClosingNote("");
            setCashDenominations([]);
          }}
          onConfirm={handleCloseShift}
          loading={loading}
          currentShift={currentShift}
          expectedDrawer={expectedDrawer}
          closingNote={closingNote}
          setClosingNote={setClosingNote}
          cashDenominations={cashDenominations}
          setCashDenominations={setCashDenominations}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
        />

        {/* Modal hiển thị chi tiết tiền ban đầu */}
        <Modal
          title={
            <Text strong style={{ fontSize: "16px" }}>
              Chi tiết tiền ban đầu
            </Text>
          }
          open={showInitialCashModal}
          onCancel={() => setShowInitialCashModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowInitialCashModal(false)}>
              Đóng
            </Button>,
          ]}
          width={480}
        >
          {currentShift?.initialCashDenominations &&
          currentShift.initialCashDenominations.length > 0 ? (
            <div>
              <Table
                dataSource={[...currentShift.initialCashDenominations].sort(
                  (a, b) => a.denomination - b.denomination
                )}
                rowKey={(_, index) => index}
                pagination={false}
                size="small"
                showHeader={true}
                columns={[
                  {
                    title: "Mệnh giá",
                    dataIndex: "denomination",
                    key: "denomination",
                    align: "left",
                    render: (value) => (
                      <span style={{ fontWeight: 500 }}>
                        {formatCurrency(value)}
                      </span>
                    ),
                  },
                  {
                    title: "SL",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 80,
                    align: "left",
                    render: (value) => (
                      <span style={{ fontWeight: 500 }}>{value}</span>
                    ),
                  },
                  {
                    title: "Thành tiền",
                    dataIndex: "totalValue",
                    key: "totalValue",
                    width: 140,
                    align: "right",
                    render: (value, record) => (
                      <span style={{ fontWeight: 500 }}>
                        {formatCurrency(
                          value || record.denomination * record.quantity
                        )}
                      </span>
                    ),
                  },
                ]}
                summary={() => {
                  const total = currentShift.initialCashDenominations.reduce(
                    (sum, item) =>
                      sum +
                      (item.totalValue || item.denomination * item.quantity),
                    0
                  );
                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <Text strong>Tổng cộng</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong style={{ fontSize: "15px" }}>
                            {formatCurrency(total)}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                backgroundColor: "#fafafa",
                borderRadius: "6px",
              }}
            >
              <div>
                <Text type="secondary">
                  Không có thông tin chi tiết mệnh giá
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>
                  Tổng tiền: {formatCurrency(currentShift?.initialCash || 0)}
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
      <CommonFooter />
    </div>
  );
};

export default PosShift;
