import { useState, useEffect, useCallback } from "react";
import { message, Modal, Table, Tag, Spin, Input, InputNumber, Button } from "antd";
import PrimeDataTable from "../../components/data-table";
import { getShiftsByAccountId, openShiftForEmployee, getAllActiveShifts } from "../../services/ShiftService";
import { searchStaffAccountsPaged } from "../../services/AccountService";
import { getAllOrders } from "../../services/OrderService";
import CashDenominationInput from "../../components/cash-denomination/CashDenominationInput";
import CashDenominationComparison from "../../components/cash-denomination/CashDenominationComparison";

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

  // Open shift modal states
  const [openShiftModalVisible, setOpenShiftModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [initialCash, setInitialCash] = useState(0);
  const [openCashDenominations, setOpenCashDenominations] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);

  // Summary stats
  const [stats, setStats] = useState({
    activeShifts: 0,
    todayRevenue: 0,
    closedShifts: 0,
    workingStaff: [],
  });

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
      message.error(
        "Không thể tải dữ liệu ca làm việc: " + (error.message || "")
      );
    }
  }, []);

  // Load active shifts
  const loadActiveShifts = useCallback(async () => {
    try {
      const shifts = await getAllActiveShifts();
      setActiveShifts(shifts || []);
    } catch (error) {
      console.error("Error loading active shifts:", error);
    }
  }, []);

  // Fetch staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);

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

        const staff = allStaff.filter(
          (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
        );

        setStaffList(staff);

        if (staff.length === 0) {
          message.warning("Không tìm thấy nhân viên bán hàng nào");
          setLoading(false);
          return;
        }

        await Promise.all([fetchAllShifts(staff), loadActiveShifts()]);
      } catch (error) {
        message.error(
          "Không thể tải danh sách nhân viên: " + (error.message || "")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [fetchAllShifts, loadActiveShifts]);

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

        const staffIds = staffList.map((s) => s.id);

        const salesOrders = allOrders.filter((o) => {
          const uid = o.accountId || o.account?.id || o.account?.accountId;
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
        message.error("Không thể tải doanh thu: " + (err.message || ""));
      }
    };

    fetchDailyRevenue();
  }, [staffList]);

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

  useEffect(() => {
    let filtered = [...shiftsData];

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, shiftsData]);

  const viewShiftDetails = async (shift) => {
    setSelectedShift(shift);
    setDetailModalOpen(true);
    setOrders([]);
    if (shift.openedAt) {
      try {
        const fromISO = shift.openedAt;
        const toISO = shift.closedAt || new Date().toISOString();

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
        message.error("Không thể tải đơn hàng: " + (error.message || ""));
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("vi-VN");
  };

  // Calculate shift duration in hours and minutes
  const calculateShiftDuration = (openedAt, closedAt) => {
    if (!openedAt) return "-";
    const startTime = new Date(openedAt).getTime();
    const endTime = closedAt ? new Date(closedAt).getTime() : new Date().getTime();
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  // Open shift for employee
  const handleOpenShiftForEmployee = (employee) => {
    setSelectedEmployee(employee);
    setInitialCash(0);
    setOpenShiftModalVisible(true);
  };

  const confirmOpenShift = async () => {
    if (!selectedEmployee) return;
    if (initialCash < 0) {
      message.error("Số tiền ban đầu không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      // Calculate total from cash denominations if provided
      const cashDenominationsData = openCashDenominations.map(d => ({
        denomination: d.denomination,
        quantity: d.quantity,
        totalValue: d.denomination * d.quantity
      }));

      await openShiftForEmployee(selectedEmployee.id, initialCash, cashDenominationsData);
      message.success(`Đã mở ca cho ${selectedEmployee.fullName}`);
      setOpenShiftModalVisible(false);
      setSelectedEmployee(null);
      setInitialCash(0);
      setOpenCashDenominations([]);

      // Reload data
      await Promise.all([fetchAllShifts(staffList), loadActiveShifts()]);
    } catch (error) {
      console.error("Error opening shift:", error);
      message.error(error.response?.data?.message || "Không thể mở ca");
    } finally {
      setLoading(false);
    }
  };

  // Check if employee has active shift
  const hasActiveShift = (employeeId) => {
    return activeShifts.some(shift => shift.accountId === employeeId);
  };

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
          className={`badge ${row.status === "Mở" ? "badge-success" : "badge-secondary"
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
      header: "Thời gian ca",
      field: "shiftDuration",
      key: "shiftDuration",
      sortable: false,
      body: (row) => calculateShiftDuration(row.openedAt, row.closedAt),
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
      render: (text, record) => (
        <span style={{ color: '#E67E22', fontWeight: 600 }}>
          {text || record.orderId}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text, record) => formatDateTime(text || record.createdDate),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status, record) => {
        const paymentStatus = status || record.payment?.status || "-";
        const isPaid = paymentStatus?.toLowerCase().includes('đã thanh toán') ||
                       paymentStatus?.toLowerCase().includes('paid');
        return (
          <Tag color={isPaid ? "success" : "warning"}>
            {paymentStatus}
          </Tag>
        );
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text, record) => record.payment?.paymentMethod || text || "-",
    },
  ];

  // Calculate total revenue only from successfully paid orders
  const totalRevenue = orders
    .filter((o) => {
      const status = o.paymentStatus || o.payment?.status || "";
      return status.toLowerCase().includes('đã thanh toán') ||
             status.toLowerCase().includes('paid');
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const paidOrdersCount = orders.filter((o) => {
    const status = o.paymentStatus || o.payment?.status || "";
    return status.toLowerCase().includes('đã thanh toán') ||
           status.toLowerCase().includes('paid');
  }).length;

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

        {/* Staff List with Open Shift Button */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Danh sách nhân viên</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Email</th>
                    <th>Trạng thái ca</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => {
                    const hasShift = hasActiveShift(staff.id);
                    return (
                      <tr key={staff.id}>
                        <td>
                          <strong>{staff.fullName}</strong>
                        </td>
                        <td>{staff.email}</td>
                        <td>
                          {hasShift ? (
                            <Tag color="success">🟢 Đang có ca</Tag>
                          ) : (
                            <Tag color="default">⚪ Chưa có ca</Tag>
                          )}
                        </td>
                        <td className="text-center">
                          {!hasShift && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleOpenShiftForEmployee(staff)}
                            >
                              <i className="feather icon-plus-circle me-1"></i>
                              Mở ca
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              loading={false}
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
              {/* Cash Denominations Comparison - So sánh mệnh giá tiền */}
              {((selectedShift.initialCashDenominations && selectedShift.initialCashDenominations.length > 0) ||
                (selectedShift.cashDenominations && selectedShift.cashDenominations.length > 0)) && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">
                      <i className="ti ti-cash me-2"></i>
                      So sánh chi tiết mệnh giá tiền
                    </h6>
                    <div className="table-responsive">
                      <CashDenominationComparison
                        openingDenominations={selectedShift.initialCashDenominations || []}
                        closingDenominations={selectedShift.cashDenominations || []}
                        showClosing={selectedShift.status === 'Đóng' && selectedShift.cashDenominations && selectedShift.cashDenominations.length > 0}
                      />
                    </div>
                  </div>
                )}

              {/* Orders Summary Cards - Styled with solid colors for better visibility */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card bg-success text-white mb-0" style={{ height: '100%' }}>
                    <div className="card-body p-3 d-flex align-items-center">
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                          <h6 className="text-white mb-1">Tổng doanh thu</h6>
                          <h4 className="text-white mb-0">
                            {formatCurrency(totalRevenue)}
                          </h4>
                          <small className="text-white-50">({paidOrdersCount} đơn thanh toán thành công)</small>
                        </div>
                        <i className="feather icon-dollar-sign fs-2 text-white-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-primary text-white mb-0" style={{ height: '100%' }}>
                    <div className="card-body p-3 d-flex align-items-center">
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                          <h6 className="text-white mb-1">Tổng số đơn hàng</h6>
                          <h4 className="text-white mb-0">{orders.length}</h4>
                          <small className="text-white-50">&nbsp;</small>
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

        {/* Open Shift Modal - Cần thêm component nhập mệnh giá tiền */}
        <Modal
          open={openShiftModalVisible}
          onCancel={() => {
            setOpenShiftModalVisible(false);
            setSelectedEmployee(null);
            setInitialCash(0);
            setOpenCashDenominations([]);
          }}
          onOk={confirmOpenShift}
          title="Mở ca cho nhân viên"
          okText="Mở ca"
          cancelText="Hủy"
          confirmLoading={loading}
          centered
          width={500}
        >
          {selectedEmployee && (
            <div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>Nhân viên:</label>
                <div className="p-2 bg-light rounded">
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedEmployee.fullName}</div>
                  <small className="text-muted" style={{ fontSize: '12px' }}>{selectedEmployee.email}</small>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ fontSize: '13px', marginBottom: '4px' }}>
                  <i className="ti ti-cash me-1"></i>
                  Số tiền ban đầu trong két:
                </label>
                <InputNumber
                  style={{ width: '100%' }}
                  value={initialCash}
                  onChange={(value) => setInitialCash(value || 0)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  step={10000}
                  placeholder="Nhập số tiền ban đầu"
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  Số tiền hiện có trong két trước khi bắt đầu ca
                </small>

                {/* Component nhập chi tiết mệnh giá tiền */}
                <div className="mt-3">
                  <label className="form-label fw-bold" style={{ fontSize: '13px', marginBottom: '4px' }}>
                    <i className="ti ti-coins me-1"></i>
                    Chi tiết mệnh giá tiền (tùy chọn):
                  </label>
                  <small className="text-muted d-block mb-2" style={{ fontSize: '11px' }}>
                    Nhập số lượng từng loại tờ tiền để theo dõi chi tiết
                  </small>
                  <CashDenominationInput
                    value={openCashDenominations}
                    onChange={(denoms) => {
                      setOpenCashDenominations(denoms);
                      const total = denoms.reduce((sum, d) => sum + d.denomination * d.quantity, 0);
                      setInitialCash(total);
                    }}
                    expectedTotal={initialCash}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffShiftManagement;



