import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  message,
  Tag,
  Typography,
  Space,
  DatePicker,
  Select,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getMyShifts } from "../../services/ShiftService";
import { getAllOrders } from "../../services/OrderService";
import CommonFooter from "../../components/footer/CommonFooter";
import TableTopHead from "../../components/table-top-head";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ShiftHistory = () => {
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyShifts();
      // Sort by openedAt descending (newest first)
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.openedAt);
        const dateB = new Date(b.openedAt);
        return dateB - dateA;
      });
      setShifts(sortedData);
      setFilteredShifts(sortedData);
    } catch (error) {
      console.error("Error loading shifts:", error);
      message.error("Không thể tải lịch sử ca làm việc");
      setShifts([]);
      setFilteredShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  useEffect(() => {
    let filtered = [...shifts];

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      filtered = filtered.filter((shift) => {
        const shiftDate = dayjs(shift.openedAt);
        return shiftDate.isAfter(startDate) && shiftDate.isBefore(endDate);
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((shift) => shift.status === statusFilter);
    }

    setFilteredShifts(filtered);
  }, [shifts, dateRange, statusFilter]);

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateShiftRevenue = (orders) => {
    if (!orders || orders.length === 0) return 0;
    const completedOrders = orders.filter(
      (o) =>
        o.orderStatus?.toLowerCase().includes("hoàn tất") ||
        o.orderStatus?.toUpperCase() === "COMPLETED"
    );
    return completedOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "openedAt",
      key: "date",
      width: 120,
      render: (date) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: "Giờ mở ca",
      dataIndex: "openedAt",
      key: "openTime",
      width: 100,
      render: (date) => <Text>{formatTime(date)}</Text>,
    },
    {
      title: "Giờ đóng ca",
      dataIndex: "closedAt",
      key: "closeTime",
      width: 100,
      render: (date) =>
        date ? (
          <Text>{formatTime(date)}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Tiền ban đầu",
      dataIndex: "initialCash",
      key: "initialCash",
      width: 140,
      align: "right",
      render: (amount) => <Text>{formatCurrency(amount)}</Text>,
    },
    {
      title: "Tiền cuối ca",
      dataIndex: "closingCash",
      key: "closingCash",
      width: 140,
      align: "right",
      render: (amount) =>
        amount !== null && amount !== undefined ? (
          <Text>{formatCurrency(amount)}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Doanh thu dự kiến",
      key: "expectedRevenue",
      width: 150,
      align: "right",
      render: (_, record) => {
        const revenue = record.orders
          ? calculateShiftRevenue(record.orders)
          : 0;
        return (
          <Text strong style={{ color: "#1890ff" }}>
            {formatCurrency(revenue)}
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) =>
        status === "Mở" ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đang mở
          </Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />}>
            Đã đóng
          </Tag>
        ),
    },
  ];

  const expandedRowRender = (record) => {
    const orders = record.orders || [];
    const revenue = calculateShiftRevenue(orders);
    const completedOrderCount = orders.filter(
      (o) =>
        o.orderStatus?.toLowerCase().includes("hoàn tất") ||
        o.orderStatus?.toUpperCase() === "COMPLETED"
    ).length;

    return (
      <div style={{ padding: "16px 24px", backgroundColor: "#fafafa" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>Chi tiết ca làm việc</Title>
          </Col>

          <Col xs={24} md={12}>
            <Card size="small" style={{ height: "100%" }}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Mở bởi: </Text>
                  <Text>{record.openedByAccountName || "N/A"}</Text>
                </div>
                <div>
                  <Text strong>Thời gian mở: </Text>
                  <Text>{formatDateTime(record.openedAt)}</Text>
                </div>
                {record.closedAt && (
                  <>
                    <div>
                      <Text strong>Đóng bởi: </Text>
                      <Text>{record.closedByAccountName || "N/A"}</Text>
                    </div>
                    <div>
                      <Text strong>Thời gian đóng: </Text>
                      <Text>{formatDateTime(record.closedAt)}</Text>
                    </div>
                  </>
                )}
                <div>
                  <Text strong>Tiền ban đầu: </Text>
                  <Text style={{ color: "#1890ff" }}>
                    {formatCurrency(record.initialCash)}
                  </Text>
                </div>
                {record.closingCash !== null &&
                  record.closingCash !== undefined && (
                    <div>
                      <Text strong>Tiền cuối ca: </Text>
                      <Text style={{ color: "#52c41a" }}>
                        {formatCurrency(record.closingCash)}
                      </Text>
                    </div>
                  )}
                {record.note && (
                  <div>
                    <Text strong>Ghi chú: </Text>
                    <Text italic>{record.note}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card size="small" style={{ height: "100%" }}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Tổng đơn hàng: </Text>
                  <Text>{orders.length}</Text>
                </div>
                <div>
                  <Text strong>Đơn hoàn tất: </Text>
                  <Text style={{ color: "#52c41a" }}>
                    {completedOrderCount}
                  </Text>
                </div>
                <div>
                  <Text strong>Doanh thu: </Text>
                  <Text style={{ color: "#1890ff", fontSize: "16px" }} strong>
                    {formatCurrency(revenue)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          {orders.length > 0 && (
            <Col span={24}>
              <Title level={5} style={{ marginTop: 8 }}>
                Danh sách đơn hàng ({orders.length})
              </Title>
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
                    title: "Khách hàng",
                    dataIndex: "customerName",
                    key: "customerName",
                    render: (text, record) =>
                      text || record.customer?.fullName || "Khách lẻ",
                  },
                  {
                    title: "Ngày đặt",
                    dataIndex: "orderDate",
                    key: "orderDate",
                    width: 150,
                    render: (text) => formatDateTime(text),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "orderStatus",
                    key: "orderStatus",
                    width: 120,
                    render: (status) => status || "-",
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
                pagination={false}
                size="small"
                bordered
              />
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const handleExpand = async (expanded, record) => {
    if (expanded && (!record.orders || record.orders.length === 0)) {
      // Load orders for this shift
      try {
        const fromISO = record.openedAt;
        const toISO = record.closedAt || new Date().toISOString();

        const formatDate = (isoString) => {
          const d = new Date(isoString);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const fromDate = formatDate(fromISO);
        const toDate = formatDate(toISO);

        const resp = await getAllOrders({
          from: fromDate,
          to: toDate,
          size: 1000,
        });

        const allOrders = resp?.content || resp?.result || resp || [];
        const fromTime = new Date(fromISO).getTime();
        const toTime = new Date(toISO).getTime();

        const shiftOrders = allOrders.filter((o) => {
          const orderTime = new Date(
            o.orderDate || o.createdDate || o.createdAt
          ).getTime();
          return orderTime >= fromTime && orderTime <= toTime;
        });

        // Update the shift record with orders
        setShifts((prevShifts) =>
          prevShifts.map((s) =>
            s.shiftId === record.shiftId ? { ...s, orders: shiftOrders } : s
          )
        );
      } catch (error) {
        console.error("Error loading orders:", error);
        message.error("Không thể tải đơn hàng cho ca này");
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <Title level={3}>Lịch sử ca làm việc</Title>
            <Text type="secondary">Xem lại các ca làm việc đã qua</Text>
          </div>
          <TableTopHead
            showExcel={false}
            onRefresh={(e) => {
              if (e) e.preventDefault();
              loadShifts();
              message.success("Đã làm mới dữ liệu!");
            }}
          />
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={10}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong>Chọn khoảng thời gian:</Text>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong>Trạng thái:</Text>
                <Select
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Đang mở", value: "Mở" },
                    { label: "Đã đóng", value: "Đóng" },
                  ]}
                />
              </Space>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Space style={{ marginTop: 24 }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setDateRange(null);
                    setStatusFilter("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Danh sách ca làm việc ({filteredShifts.length})</span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredShifts}
            rowKey="shiftId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} ca`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            size="small"
            bordered
            expandable={{
              expandedRowRender,
              onExpand: handleExpand,
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
            }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <ClockCircleOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <div>
                    <Text type="secondary">Chưa có lịch sử ca làm việc</Text>
                  </div>
                </div>
              ),
            }}
          />
        </Card>
      </div>
      <CommonFooter />
    </div>
  );
};

export default ShiftHistory;
