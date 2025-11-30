import { useState, useEffect, useCallback, useMemo } from "react";
import { message, Modal, Table, Tag, InputNumber } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonSelect from "../../components/select/common-select";
import {
  getShiftsByAccountId,
  openShiftForEmployee,
  closeShiftForEmployee,
  getAllActiveShifts,
} from "../../services/ShiftService";
import { searchStaffAccountsPaged } from "../../services/AccountService";
import { getAllOrders } from "../../services/OrderService";
import CommonFooter from "../../components/footer/CommonFooter";
import CashDenominationInput from "../../components/cash-denomination/CashDenominationInput";
import CashDenominationComparison from "../../components/cash-denomination/CashDenominationComparison";

const StaffShiftManagement = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows] = useState(5); // Cố định 5 nhân viên mỗi trang
  const [totalRecords, setTotalRecords] = useState(0);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [shiftCurrentPage, setShiftCurrentPage] = useState(1);
  const [shiftRows, setShiftRows] = useState(10);

  // Status filter options
  const StatusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      { value: "Mở", label: "Đang mở" },
      { value: "Đóng", label: "Đã đóng" },
    ],
    []
  );

  // Open shift modal states
  const [openShiftModalVisible, setOpenShiftModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [initialCash, setInitialCash] = useState(0);
  const [openCashDenominations, setOpenCashDenominations] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [activeShiftsLoaded, setActiveShiftsLoaded] = useState(false);

  // Close shift modal states
  const [closeShiftModalVisible, setCloseShiftModalVisible] = useState(false);
  const [employeeToClose, setEmployeeToClose] = useState(null);
  const [closeNote, setCloseNote] = useState("");
  const [closingCash, setClosingCash] = useState(0);
  const [closeCashDenominations, setCloseCashDenominations] = useState([]);

  // Summary stats (currently not displayed but kept for future use)
  // eslint-disable-next-line no-unused-vars
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
      setActiveShiftsLoaded(true);
    } catch (error) {
      console.error("Error loading active shifts:", error);
      setActiveShiftsLoaded(true);
    }
  }, []);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);

      // Load active shifts FIRST để đảm bảo trạng thái ca hiển thị đúng
      await loadActiveShifts();

      const backendPage = currentPage - 1;

      const response = await searchStaffAccountsPaged({
        keyword: staffSearchQuery || "",
        active: true,
        role: "Nhân viên bán hàng",
        page: backendPage,
        size: rows,
        sortBy: "fullName",
        sortDir: "ASC",
      });

      const allStaff = response?.content || [];

      const staff = allStaff.filter(
        (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
      );

      setStaffList(staff);
      setTotalRecords(response?.totalElements || staff.length);

      if (staff.length === 0 && currentPage === 1) {
        setLoading(false);
        return;
      }

      if (currentPage === 1) {
        try {
          const allStaffResponse = await searchStaffAccountsPaged({
            keyword: staffSearchQuery || "",
            active: true,
            role: "Nhân viên bán hàng",
            page: 0,
            size: 1000, // Lấy tất cả để fetch shifts
            sortBy: "fullName",
            sortDir: "ASC",
          });
          const allStaff = (allStaffResponse?.content || []).filter(
            (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
          );
          await fetchAllShifts(allStaff);
        } catch (err) {
          console.error("Error fetching all shifts:", err);
        }
      }
    } catch (error) {
      message.error(
        "Không thể tải danh sách nhân viên: " + (error.message || "")
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, staffSearchQuery, fetchAllShifts, loadActiveShifts]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    setCurrentPage(1);
  }, [staffSearchQuery]);

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

    if (statusFilter && statusFilter !== "all") {
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
    const endTime = closedAt
      ? new Date(closedAt).getTime()
      : new Date().getTime();
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  // Open shift for employee
  const handleOpenShiftForEmployee = (employee) => {
    // Check if employee already has an active shift
    if (hasActiveShift(employee.id)) {
      message.error(`${employee.fullName} đang có ca làm việc, không thể mở ca mới!`);
      return;
    }
    setSelectedEmployee(employee);
    setInitialCash(0);
    setOpenShiftModalVisible(true);
  };

  const confirmOpenShift = async () => {
    if (!selectedEmployee) return;
    
    // Validation: kiểm tra số tiền không được âm
    if (initialCash < 0) {
      message.error("Số tiền ban đầu không được âm");
      return;
    }

    try {
      setLoading(true);
      // Calculate total from cash denominations if provided
      const cashDenominationsData = openCashDenominations.map((d) => ({
        denomination: d.denomination,
        quantity: d.quantity,
        totalValue: d.denomination * d.quantity,
      }));

      await openShiftForEmployee(
        selectedEmployee.id,
        initialCash,
        cashDenominationsData
      );
      message.success(`Đã mở ca cho ${selectedEmployee.fullName}`);
      setOpenShiftModalVisible(false);
      setSelectedEmployee(null);
      setInitialCash(0);
      setOpenCashDenominations([]);

      // Reload active shifts first to update status immediately
      await loadActiveShifts();

      // Fetch all staff to get complete list for shifts
      try {
        const allStaffResponse = await searchStaffAccountsPaged({
          keyword: staffSearchQuery || "",
          active: true,
          role: "Nhân viên bán hàng",
          page: 0,
          size: 1000, // Lấy tất cả để fetch shifts
          sortBy: "fullName",
          sortDir: "ASC",
        });
        const allStaff = (allStaffResponse?.content || []).filter(
          (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
        );
        // Fetch all shifts for all staff to update history
        await fetchAllShifts(allStaff);
      } catch (err) {
        console.error("Error fetching all shifts:", err);
      }

      // Reload current page staff list to update status
      await fetchStaff();
    } catch (error) {
      console.error("Error opening shift:", error);
      message.error(error.response?.data?.message || "Không thể mở ca");
    } finally {
      setLoading(false);
    }
  };

  // Check if employee has active shift
  const hasActiveShift = (employeeId) => {
    return activeShifts.some((shift) => String(shift.accountId) === String(employeeId));
  };

  // Close shift for employee
  const handleCloseShiftForEmployee = (employee) => {
    if (!hasActiveShift(employee.id)) {
      message.error(`${employee.fullName} không có ca đang mở!`);
      return;
    }
    setEmployeeToClose(employee);
    setCloseNote("");
    setClosingCash(0);
    setCloseCashDenominations([]);
    setCloseShiftModalVisible(true);
  };

  const confirmCloseShift = async () => {
    if (!employeeToClose) return;
    
    // Validation: kiểm tra số tiền không được âm
    if (closingCash < 0) {
      message.error("Số tiền cuối ca không được âm");
      return;
    }

    try {
      setLoading(true);
      // Chuẩn bị dữ liệu mệnh giá tiền
      const cashDenominationsData = closeCashDenominations.map((d) => ({
        denomination: d.denomination,
        quantity: d.quantity,
        totalValue: d.denomination * d.quantity,
      }));

      await closeShiftForEmployee(
        employeeToClose.id, 
        closingCash, 
        closeNote || "",
        cashDenominationsData
      );
      message.success(`Đã đóng ca cho ${employeeToClose.fullName}`);
      setCloseShiftModalVisible(false);
      setEmployeeToClose(null);
      setCloseNote("");
      setClosingCash(0);
      setCloseCashDenominations([]);

      // Reload active shifts first to update status immediately
      await loadActiveShifts();

      // Fetch all staff to get complete list for shifts
      try {
        const allStaffResponse = await searchStaffAccountsPaged({
          keyword: staffSearchQuery || "",
          active: true,
          role: "Nhân viên bán hàng",
          page: 0,
          size: 1000,
          sortBy: "fullName",
          sortDir: "ASC",
        });
        const allStaff = (allStaffResponse?.content || []).filter(
          (s) => s.roles && s.roles.includes("Nhân viên bán hàng")
        );
        await fetchAllShifts(allStaff);
      } catch (err) {
        console.error("Error fetching all shifts:", err);
      }

      await fetchStaff();
    } catch (error) {
      console.error("Error closing shift:", error);
      message.error(error.response?.data?.message || "Không thể đóng ca");
    } finally {
      setLoading(false);
    }
  };

  // Staff list columns
  const staffColumns = [
    {
      header: "Nhân viên",
      field: "fullName",
      key: "fullName",
      sortable: true,
      style: { paddingLeft: '60px' },
    },
    {
      header: "Tài khoản",
      field: "username",
      key: "username",
      sortable: true,
    },
    {
      header: "Email",
      field: "email",
      key: "email",
      sortable: true,
      style: { paddingRight: '100px' },
    },
    {
      header: "Trạng thái ca",
      field: "shiftStatus",
      key: "shiftStatus",
      sortable: false,
      alignHeader: "center",
      headerClassName: "text-center",
      className: "text-center",
      body: (row) => {
        const hasShift = hasActiveShift(row.id);
        return hasShift ? (
          <Tag color="success">🟢 Đang có ca</Tag>
        ) : (
          <Tag color="default">⚪ Chưa có ca</Tag>
        );
      },
    },
    {
      header: "Hành động",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => {
        const hasShift = hasActiveShift(row.id);
        return (
          <div className="action-table-data d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleOpenShiftForEmployee(row)}
              disabled={hasShift}
              style={{
                opacity: hasShift ? 0.5 : 1,
                cursor: hasShift ? 'not-allowed' : 'pointer',
              }}
            >
              <i className="feather icon-plus-circle me-1"></i>
              Mở ca
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleCloseShiftForEmployee(row)}
              disabled={!hasShift}
              style={{
                opacity: !hasShift ? 0.5 : 1,
                cursor: !hasShift ? 'not-allowed' : 'pointer',
              }}
            >
              <i className="feather icon-x-circle me-1"></i>
              Đóng ca
            </button>
          </div>
        );
      },
    },
  ];

  const columns = [
    {
      header: "Nhân viên",
      field: "accountName",
      key: "accountName",
      sortable: true,
      style: { paddingLeft: '60px' },
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
      header: "",
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
        <span style={{ color: "#E67E22", fontWeight: 600 }}>
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
        const isPaid =
          paymentStatus?.toLowerCase().includes("đã thanh toán") ||
          paymentStatus?.toLowerCase().includes("paid");
        return (
          <Tag color={isPaid ? "success" : "warning"}>{paymentStatus}</Tag>
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
      return (
        status.toLowerCase().includes("đã thanh toán") ||
        status.toLowerCase().includes("paid")
      );
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const paidOrdersCount = orders.filter((o) => {
    const status = o.paymentStatus || o.payment?.status || "";
    return (
      status.toLowerCase().includes("đã thanh toán") ||
      status.toLowerCase().includes("paid")
    );
  }).length;

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Quản lý ca làm việc</h4>
              <h6>Giám sát ca làm việc của nhân viên</h6>
            </div>
          </div>
          <TableTopHead
            showExcel={false}
            onRefresh={(e) => {
              if (e) e.preventDefault();
              fetchStaff();
              message.success("Đã làm mới danh sách!");
            }}
          />
        </div>

        {/* Staff List with Open Shift Button */}
        <div className="card table-list-card no-search shadow-sm mb-3">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách nhân viên{" "}
              <span className="text-muted small">
                ({totalRecords} nhân viên)
              </span>
            </h5>
            <div className="d-flex gap-2 align-items-end flex-wrap">
              <div style={{ minWidth: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên nhân viên, tài khoản..."
                  value={staffSearchQuery || ""}
                  onChange={(e) => {
                    setStaffSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive staff-table">
              <PrimeDataTable
                key={`staff-table-${activeShifts.length}-${activeShiftsLoaded}`}
                data={staffList}
                column={staffColumns}
                loading={false}
                emptyMessage="Không có nhân viên nào"
                dataKey="id"
                rows={rows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={totalRecords}
                serverSidePagination={true}

              />
            </div>
          </div>
        </div>

        {/* Lịch sử ca */}
        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Lịch sử ca{" "}
              <span className="text-muted small">
                ({filteredData.length} bản ghi)
              </span>
            </h5>
            <div className="d-flex gap-2 align-items-end flex-wrap">
              <div style={{ minWidth: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên nhân viên..."
                  value={searchTerm || ""}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShiftCurrentPage(1);
                  }}
                />
              </div>
              <div style={{ minWidth: "180px" }}>
                <CommonSelect
                  options={StatusOptions}
                  value={
                    statusFilter
                      ? StatusOptions.find((o) => o.value === statusFilter) || null
                      : null
                  }
                  onChange={(s) => {
                    const v = s?.value || null;
                    setStatusFilter(v);
                    setShiftCurrentPage(1);
                  }}
                  placeholder="Chọn trạng thái"
                  className="w-100"
                />
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <PrimeDataTable
                data={filteredData}
                column={columns}
                loading={false}
                emptyMessage="Không có dữ liệu ca làm việc"
                dataKey="shiftId"
                rows={shiftRows}
                setRows={setShiftRows}
                currentPage={shiftCurrentPage}
                setCurrentPage={setShiftCurrentPage}
                totalRecords={filteredData.length}
                serverSidePagination={false}
              />
            </div>
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
              {((selectedShift.initialCashDenominations &&
                selectedShift.initialCashDenominations.length > 0) ||
                (selectedShift.cashDenominations &&
                  selectedShift.cashDenominations.length > 0)) && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">
                      <i className="ti ti-cash me-2"></i>
                      So sánh chi tiết mệnh giá tiền
                    </h6>
                    <div className="table-responsive">
                      <CashDenominationComparison
                        openingDenominations={
                          selectedShift.initialCashDenominations || []
                        }
                        closingDenominations={
                          selectedShift.cashDenominations || []
                        }
                        showClosing={
                          selectedShift.status === "Đóng" &&
                          selectedShift.cashDenominations &&
                          selectedShift.cashDenominations.length > 0
                        }
                      />
                    </div>
                  </div>
                )}

              {/* Ghi chú đóng ca - hiển thị nếu có */}
              {selectedShift.note && (
                <div className="alert alert-info mb-4">
                  <h6 className="fw-bold mb-2">
                    <i className="ti ti-notes me-2"></i>
                    Ghi chú khi đóng ca:
                  </h6>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedShift.note}</p>
                </div>
              )}

              {/* Orders Summary Cards - Styled with solid colors for better visibility */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div
                    className="card bg-success text-white mb-0"
                    style={{ height: "100%" }}
                  >
                    <div className="card-body p-3 d-flex align-items-center">
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                          <h6 className="text-white mb-1">Tổng doanh thu</h6>
                          <h4 className="text-white mb-0">
                            {formatCurrency(totalRevenue)}
                          </h4>
                          <small className="text-white-50">
                            ({paidOrdersCount} đơn thanh toán thành công)
                          </small>
                        </div>
                        <i className="feather icon-dollar-sign fs-2 text-white-50"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="card bg-primary text-white mb-0"
                    style={{ height: "100%" }}
                  >
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
                <label
                  className="form-label"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  Nhân viên:
                </label>
                <div className="p-2 bg-light rounded">
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {selectedEmployee.fullName}
                  </div>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    {selectedEmployee.email}
                  </small>
                </div>
              </div>
              <div className="mb-3">
                <label
                  className="form-label fw-bold"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  <i className="ti ti-cash me-1"></i>
                  Số tiền ban đầu trong két:
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  value={initialCash}
                  onChange={(value) => setInitialCash(value || 0)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  step={10000}
                  placeholder="Nhập số tiền ban đầu"
                />
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: "11px" }}
                >
                  Số tiền hiện có trong két trước khi bắt đầu ca
                </small>

                {/* Component nhập chi tiết mệnh giá tiền */}
                <div className="mt-3">
                  <label
                    className="form-label fw-bold"
                    style={{ fontSize: "13px", marginBottom: "4px" }}
                  >
                    <i className="ti ti-coins me-1"></i>
                    Chi tiết mệnh giá tiền (tùy chọn):
                  </label>
                  <small
                    className="text-muted d-block mb-2"
                    style={{ fontSize: "11px" }}
                  >
                    Nhập số lượng từng loại tờ tiền để theo dõi chi tiết
                  </small>
                  <CashDenominationInput
                    value={openCashDenominations}
                    onChange={(denoms) => {
                      setOpenCashDenominations(denoms);
                      const total = denoms.reduce(
                        (sum, d) => sum + d.denomination * d.quantity,
                        0
                      );
                      setInitialCash(total);
                    }}
                    expectedTotal={initialCash}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Close Shift Modal */}
        <Modal
          open={closeShiftModalVisible}
          onCancel={() => {
            setCloseShiftModalVisible(false);
            setEmployeeToClose(null);
            setCloseNote("");
            setClosingCash(0);
            setCloseCashDenominations([]);
          }}
          onOk={confirmCloseShift}
          title="Đóng ca cho nhân viên"
          okText="Đóng ca"
          okButtonProps={{ danger: true }}
          cancelText="Hủy"
          confirmLoading={loading}
          centered
          width={500}
        >
          {employeeToClose && (
            <div>
              <div className="mb-3">
                <label
                  className="form-label"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  Nhân viên:
                </label>
                <div className="p-2 bg-light rounded">
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {employeeToClose.fullName}
                  </div>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    {employeeToClose.email}
                  </small>
                </div>
              </div>
              <div className="alert alert-warning mb-3">
                <i className="feather icon-alert-triangle me-2"></i>
                Bạn đang đóng ca thay cho nhân viên. Hành động này sẽ kết thúc ca làm việc hiện tại của nhân viên.
              </div>
              <div className="mb-3">
                <label
                  className="form-label fw-bold"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  <i className="ti ti-cash me-1"></i>
                  Số tiền cuối ca trong két:
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  value={closingCash}
                  onChange={(value) => setClosingCash(value || 0)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  min={0}
                  step={10000}
                  placeholder="Nhập số tiền cuối ca"
                />
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: "11px" }}
                >
                  Số tiền hiện có trong két khi kết thúc ca
                </small>

                {/* Component nhập chi tiết mệnh giá tiền */}
                <div className="mt-3">
                  <label
                    className="form-label fw-bold"
                    style={{ fontSize: "13px", marginBottom: "4px" }}
                  >
                    <i className="ti ti-coins me-1"></i>
                    Chi tiết mệnh giá tiền (tùy chọn):
                  </label>
                  <small
                    className="text-muted d-block mb-2"
                    style={{ fontSize: "11px" }}
                  >
                    Nhập số lượng từng loại tờ tiền để theo dõi chi tiết
                  </small>
                  <CashDenominationInput
                    value={closeCashDenominations}
                    onChange={(denoms) => {
                      setCloseCashDenominations(denoms);
                      const total = denoms.reduce(
                        (sum, d) => sum + d.denomination * d.quantity,
                        0
                      );
                      setClosingCash(total);
                    }}
                    expectedTotal={closingCash}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label
                  className="form-label fw-bold"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  <i className="ti ti-notes me-1"></i>
                  Ghi chú (tùy chọn):
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  placeholder="Nhập lý do đóng ca..."
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
      <CommonFooter />
    </div>
  );
};

export default StaffShiftManagement;
