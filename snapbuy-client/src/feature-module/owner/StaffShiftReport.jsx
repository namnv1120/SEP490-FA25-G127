import { useEffect, useMemo, useState } from "react";
import { message, Spin } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import { getAccountsByRoleName } from "../../services/AccountService";
import { getShiftsByAccountId } from "../../services/ShiftService";
import { getOrdersByAccountAndRange } from "../../services/OrderService";

const StaffShiftReport = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shifts, setShifts] = useState([]);
  const [rows, setRows] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadStaff = async () => {
    try {
      const sales = await getAccountsByRoleName("Nhân viên bán hàng");
      const warehouse = await getAccountsByRoleName("Nhân viên kho");
      const map = new Map();
      for (const a of [...(sales || []), ...(warehouse || [])]) {
        const id = a.id || a.accountId || a.account_id;
        if (!map.has(id)) map.set(id, a);
      }
      const list = Array.from(map.values())
        .map((acc) => ({
          id: acc.id || acc.accountId,
          name: acc.fullName || acc.username,
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setStaffList(list);
    } catch (e) {
      message.error(e.message || "Không thể tải danh sách nhân viên");
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const fetchShifts = async () => {
    if (!selectedStaffId) {
      setShifts([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getShiftsByAccountId(
        selectedStaffId,
        statusFilter || undefined
      );
      const enriched = [];
      for (const s of list || []) {
        const fromISO = s.openedAt;
        const toISO = s.closedAt || new Date().toISOString();
        const orders = await getOrdersByAccountAndRange(
          selectedStaffId,
          fromISO,
          toISO
        );
        const paid = (st) =>
          (st || "").toString().toLowerCase().includes("đã thanh toán") ||
          (st || "").toString().toUpperCase() === "PAID" ||
          (st || "").toString().toUpperCase() === "PAYMENT_COMPLETED";
        const done = (st) =>
          (st || "").toString().toLowerCase().includes("hoàn tất") ||
          (st || "").toString().toUpperCase() === "COMPLETED";
        const methodStr = (o) =>
          (o.payment?.paymentMethod || o.paymentMethod || "")
            .toString()
            .toUpperCase();
        const isCash = (m) => m.includes("CASH") || m.includes("TIỀN MẶT");
        const completedPaid = (orders || []).filter(
          (o) => paid(o.paymentStatus) && done(o.orderStatus)
        );
        const revenueTotal = completedPaid.reduce(
          (sum, o) => sum + Number(o.totalAmount || 0),
          0
        );
        const cashCol = completedPaid
          .filter((o) => isCash(methodStr(o)))
          .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const nonCashCol = completedPaid
          .filter((o) => !isCash(methodStr(o)))
          .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const changeReturned = completedPaid.reduce(
          (sum, o) => sum + Number(o.payment?.changeAmount || 0),
          0
        );
        const expectedDrawer =
          Number(s.initialCash || 0) + cashCol - changeReturned;
        enriched.push({
          ...s,
          revenueTotal,
          cashTotal: cashCol,
          nonCashTotal: nonCashCol,
          expectedDrawer,
          orderCount: completedPaid.length,
        });
      }
      setShifts(enriched);
    } catch (e) {
      message.error(e.message || "Không thể tải ca nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaffId, statusFilter]);

  const columns = [
    { header: "Trạng thái", field: "status", key: "status" },
    {
      header: "Bắt đầu",
      field: "openedAt",
      key: "openedAt",
      body: (r) => new Date(r.openedAt).toLocaleString("vi-VN"),
    },
    {
      header: "Kết thúc",
      field: "closedAt",
      key: "closedAt",
      body: (r) =>
        r.closedAt ? new Date(r.closedAt).toLocaleString("vi-VN") : "",
    },
    {
      header: "Tiền két ban đầu",
      field: "initialCash",
      key: "initialCash",
      body: (r) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(r.initialCash || 0)),
    },
    {
      header: "Doanh thu",
      field: "revenueTotal",
      key: "revenueTotal",
      body: (r) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(r.revenueTotal || 0)),
    },
    {
      header: "Tiền mặt",
      field: "cashTotal",
      key: "cashTotal",
      body: (r) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(r.cashTotal || 0)),
    },
    {
      header: "Tiền khoản",
      field: "nonCashTotal",
      key: "nonCashTotal",
      body: (r) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(r.nonCashTotal || 0)),
    },
    {
      header: "Dự kiến trong két",
      field: "expectedDrawer",
      key: "expectedDrawer",
      body: (r) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(r.expectedDrawer || 0)),
    },
    { header: "Số đơn", field: "orderCount", key: "orderCount" },
  ];

  const summary = useMemo(() => {
    const totalRevenue = shifts.reduce(
      (sum, s) => sum + Number(s.revenueTotal || 0),
      0
    );
    const totalCash = shifts.reduce(
      (sum, s) => sum + Number(s.cashTotal || 0),
      0
    );
    const totalNonCash = shifts.reduce(
      (sum, s) => sum + Number(s.nonCashTotal || 0),
      0
    );
    const totalOrders = shifts.reduce(
      (sum, s) => sum + Number(s.orderCount || 0),
      0
    );
    return { totalRevenue, totalCash, totalNonCash, totalOrders };
  }, [shifts]);

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex justify-content-between align-items-center">
              <div className="page-title">
                <h4>Báo cáo nhân viên</h4>
                <h6>Theo dõi ca làm việc nhân viên</h6>
              </div>
            </div>
            <TableTopHead />
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Nhân viên</label>
                  <select
                    className="form-select"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Trạng thái ca</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="Mở">Mở</option>
                    <option value="Đóng">Đóng</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12">
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h4 className="fs-18 fw-bold">Danh sách ca</h4>
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      Tổng doanh thu:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(summary.totalRevenue || 0))}
                    </div>
                    <div>Số đơn: {summary.totalOrders || 0}</div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <PrimeDataTable
                        column={columns}
                        data={shifts}
                        rows={rows}
                        setRows={setRows}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalRecords={shifts.length}
                        dataKey="shiftId"
                        loading={false}
                        serverSidePagination={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffShiftReport;
