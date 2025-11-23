import { useState, useEffect, useCallback } from "react";
import { message, Modal, Table, Tag, Descriptions, Spin } from "antd";
import PrimeDataTable from "../../components/data-table";
import { getShiftsByAccountId } from "../../services/ShiftService";
import { searchStaffAccountsPaged } from "../../services/AccountService";
import { getAllOrders } from "../../services/OrderService";

const StaffShiftManagement = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);

  // Summary stats
  const [stats, setStats] = useState({
    activeShifts: 0,
    todayRevenue: 0,
    closedShifts: 0,
    workingStaff: [],
  });

  // Fetch staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log("Fetching sales staff...");

        // Only fetch sales staff (Nhân viên bán hàng)
        const response = await searchStaffAccountsPaged({
          keyword: "",
          active: true,
          role: "Nhân viên bán hàng",
          page: 0,
          size: 100,
          sortBy: "fullName",
          sortDir: "ASC",
        });

        const allStaff = response?.content || [];

        // CLIENT-SIDE FILTER: Only keep staff with "Nhân viên bán hàng" role
        const staff = allStaff.filter(
          (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
        );

        setStaffList(staff);

        if (staff.length === 0) {
          message.warning("Không tìm thấy nhân viên bán hàng nào");
          setLoading(false);
          return;
        }

        // Fetch shifts for each staff
        await fetchAllShifts(staff);
      } catch (error) {
        console.error("Error fetching staff:", error);
        message.error(
          "Không thể tải danh sách nhân viên: " + (error.message || "")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [fetchAllShifts]);

  // Calculate daily revenue separately
  useEffect(() => {
    const fetchDailyRevenue = async () => {
      if (staffList.length === 0) return;

      try {
        const today = new Date();
        const formatDate = (d) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;

        const resp = await getAllOrders({
          from: formatDate(today),
          to: formatDate(today),
          size: 1000,
        });

        const allOrders = resp?.content || resp || [];

        // Get list of sales staff IDs
        const staffIds = staffList.map((s) => s.id);

        // Filter orders by sales staff
        const salesOrders = allOrders.filter((o) => {
          const uid = o.accountId || o.account?.id || o.account?.accountId;
          // Loose comparison for ID
          return staffIds.some((id) => String(id) === String(uid));
        });

        const revenue = salesOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          todayRevenue: revenue,
        }));
      } catch (err) {
        console.error("Error fetching daily revenue:", err);
      }
    };

    fetchDailyRevenue();
  }, [staffList]);

  // Fetch all shifts
  const fetchAllShifts = useCallback(async (staff) => {
    try {
      const allShifts = [];

      for (const s of staff) {
        try {
          const shifts = await getShiftsByAccountId(s.id, null); // Get all statuses

          const shiftsWithStaffInfo = (shifts || []).map((shift) => ({
            ...shift,
            accountName: s.fullName,
            accountEmail: s.email,
          }));
          allShifts.push(...shiftsWithStaffInfo);
        } catch (err) {
          console.error(`Error fetching shifts for ${s.fullName}:`, err);
        }
      }

      // Sort by openedAt desc
      allShifts.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));

      setShiftsData(allShifts);
      setFilteredData(allShifts);
      calculateStats(allShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      message.error(
        "Không thể tải dữ liệu ca làm việc: " + (error.message || "")
      );
    }
  }, []);

  // Calculate summary stats (shifts only)
  const calculateStats = (shifts) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeShifts = shifts.filter((s) => s.status === "Mở");
    const todayShifts = shifts.filter((s) => {
      const shiftDate = new Date(s.openedAt);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === today.getTime();
    });

    const closedToday = todayShifts.filter((s) => s.status === "Đóng");
    const workingStaff = activeShifts.map((s) => s.accountName);

    setStats((prev) => ({
      ...prev,
      activeShifts: activeShifts.length,
      closedShifts: closedToday.length,
      workingStaff: workingStaff,
    }));
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...shiftsData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, shiftsData]);

  // View shift details
  const viewShiftDetails = async (shift) => {
    setSelectedShift(shift);
    setDetailModalOpen(true);
    setOrders([]); // Reset orders

    // Fetch orders for this shift
    if (shift.openedAt) {
      try {
        const fromISO = shift.openedAt;
        const toISO = shift.closedAt || new Date().toISOString();

        // Use getAllOrders with a slightly wider range
        const fromDate = new Date(fromISO);
        const toDate = new Date(toISO);

        const formatDate = (d) => {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const resp = await getAllOrders({
          from: formatDate(fromDate),
          to: formatDate(toDate),
          size: 1000,
        });

        const allOrders = resp?.content || resp || [];

        // Strict filtering
        const fromTime = new Date(fromISO).getTime();
        const toTime = new Date(toISO).getTime();

        const shiftOrders = allOrders.filter((o) => {
          const orderAccountId =
            o.accountId || o.account?.id || o.account?.accountId;
          const isAccountMatch =
            String(orderAccountId) === String(shift.accountId);

          const orderTime = new Date(
            o.orderDate || o.createdDate || o.createdAt
          ).getTime();
          const isTimeMatch = orderTime >= fromTime && orderTime <= toTime;

          return isAccountMatch && isTimeMatch;
        });

        setOrders(shiftOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Không thể tải đơn hàng: " + (error.message || ""));
      }
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Format datetime
  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("vi-VN");
  };

  // Table columns
  const columns = [
    {
      header: "Nhân viên",
      field: "accountName",
      key: "accountName",
      sortable: true,
    },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: true,
      body: (row) => (
        <span
          className={`badge ${
            row.status === "Mở" ? "badge-success" : "badge-secondary"
          }`}
        >
          {row.status === "Mở" ? "🟢 Đang mở" : "⚪ Đã đóng"}
        </span>
      ),
    },
    {
      header: "Mở ca",
      field: "openedAt",
      key: "openedAt",
      sortable: true,
      body: (row) => formatDateTime(row.openedAt),
    },
    {
      header: "Đóng ca",
      field: "closedAt",
      key: "closedAt",
      sortable: true,
      body: (row) => formatDateTime(row.closedAt),
    },
    {
      header: "Tiền ban đầu",
      field: "initialCash",
      key: "initialCash",
      sortable: true,
      body: (row) => formatCurrency(row.initialCash),
    },
    {
      header: "Tiền chốt ca",
      field: "closingCash",
      key: "closingCash",
      sortable: true,
      body: (row) => (row.closingCash ? formatCurrency(row.closingCash) : "-"),
    },
    {
      header: "Thao tác",
      field: "actions",
      key: "actions",
      body: (row) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => viewShiftDetails(row)}
        >
          <i className="feather icon-eye me-1"></i>
          Chi tiết
        </button>
      ),
    },
  ];

  // Orders table columns for modal
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text, record) => <strong>{text || record.orderId}</strong>,
    },
    {
      title: "Thời gian",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text, record) => (
        <small>{formatDateTime(text || record.createdDate)}</small>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (value) => (
        <strong className="text-success">{formatCurrency(value)}</strong>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text, record) => (
        <Tag color="default">
          {record.payment?.paymentMethod || text || "-"}
        </Tag>
      ),
    },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Quản lý ca làm việc</h4>
              <h6>Giám sát ca làm việc của nhân viên</h6>
            </div>
          </div>
        </div>

        {/* Summary Cards - Styled like Report Dashboard */}
        <div className="row mb-4">
          {/* Active Shifts */}
          <div className="col-xl-3 col-lg-6">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Ca đang mở</h6>
                    <h3 className="text-white mb-0">{stats.activeShifts}</h3>
                    <small className="text-white-50 d-block mt-1">
                      {stats.workingStaff.length > 0
                        ? stats.workingStaff.join(", ")
                        : "Không có"}
                    </small>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-success rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="feather icon-clock fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today Revenue */}
          <div className="col-xl-3 col-lg-6">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Doanh thu hôm nay</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(stats.todayRevenue)}
                    </h3>
                    <small className="text-white-50 d-block mt-1">
                      Tất cả nhân viên bán hàng
                    </small>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-primary rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="feather icon-dollar-sign fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Closed Shifts */}
          <div className="col-xl-3 col-lg-6">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Ca đã đóng hôm nay</h6>
                    <h3 className="text-white mb-0">{stats.closedShifts}</h3>
                    <small className="text-white-50 d-block mt-1">
                      Đã chốt ca
                    </small>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-warning rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="feather icon-check-circle fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Staff */}
          <div className="col-xl-3 col-lg-6">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng nhân viên</h6>
                    <h3 className="text-white mb-0">{staffList.length}</h3>
                    <small className="text-white-50 d-block mt-1">
                      Nhân viên bán hàng
                    </small>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-info rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="feather icon-users fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tìm kiếm nhân viên</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Mở">Đang mở</option>
                  <option value="Đóng">Đã đóng</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card">
          <div className="card-body">
            <PrimeDataTable
              data={filteredData}
              column={columns}
              loading={loading}
              emptyMessage="Không có dữ liệu ca làm việc"
              dataKey="shiftId"
            />
          </div>
        </div>

        {/* Detail Modal - Ant Design */}
        <Modal
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          title={<h5 className="mb-0">Chi tiết ca làm việc</h5>}
          width={900}
          centered
        >
          {selectedShift && (
            <div>
              {/* Shift Info */}
              <Descriptions
                title="Thông tin ca"
                bordered
                column={2}
                className="mb-4"
              >
                <Descriptions.Item label="Nhân viên">
                  {selectedShift.accountName}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={
                      selectedShift.status === "Mở" ? "success" : "default"
                    }
                  >
                    {selectedShift.status === "Mở"
                      ? "🟢 Đang mở"
                      : "⚪ Đã đóng"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mở ca">
                  {formatDateTime(selectedShift.openedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Đóng ca">
                  {formatDateTime(selectedShift.closedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền ban đầu">
                  <span className="text-success fw-bold">
                    {formatCurrency(selectedShift.initialCash)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền chốt ca">
                  <span className="text-primary fw-bold">
                    {selectedShift.closingCash
                      ? formatCurrency(selectedShift.closingCash)
                      : "-"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Chênh lệch" span={2}>
                  <span
                    className={
                      selectedShift.closingCash &&
                      selectedShift.closingCash - selectedShift.initialCash >= 0
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {selectedShift.closingCash
                      ? formatCurrency(
                          selectedShift.closingCash - selectedShift.initialCash
                        )
                      : "-"}
                  </span>
                </Descriptions.Item>
                {selectedShift.closingNote && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <em>{selectedShift.closingNote}</em>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Orders Summary Cards - Styled with solid colors for better visibility */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card bg-success text-white mb-0">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-1">Tổng doanh thu</h6>
                          <h4 className="text-white mb-0">
                            {formatCurrency(totalRevenue)}
                          </h4>
                        </div>
                        <i className="feather icon-dollar-sign fs-2 text-white-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-primary text-white mb-0">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-white mb-1">Số đơn hàng</h6>
                          <h4 className="text-white mb-0">{orders.length}</h4>
                        </div>
                        <i className="feather icon-shopping-cart fs-2 text-white-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <h6 className="fw-bold mb-3">
                Đơn hàng trong ca ({orders.length})
              </h6>
              <Table
                columns={orderColumns}
                dataSource={orders}
                rowKey={(record) => record.orderId || record.orderNumber}
                pagination={false}
                scroll={{ y: 300 }}
                size="small"
                locale={{
                  emptyText: (
                    <div className="text-center py-4">
                      <i className="feather icon-inbox fs-2 text-muted d-block mb-2"></i>
                      <span className="text-muted">
                        Không có đơn hàng trong ca này
                      </span>
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffShiftManagement;
