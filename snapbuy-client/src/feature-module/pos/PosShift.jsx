import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
 
import {
  openShift,
  closeShift,
  getCurrentShift,
  getMyShifts,
} from "../../services/ShiftService";
import {
  getMyOrdersByDateTimeRange,
  getAllOrders,
} from "../../services/OrderService";
import { getMyInfo } from "../../services/AccountService";

const PosShift = () => {
  
  const [loading, setLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [initialCash, setInitialCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [orders, setOrders] = useState([]);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [selectedHistoryShift, setSelectedHistoryShift] = useState(null);
  const [polling, setPolling] = useState(null);
  const [myAccountId, setMyAccountId] = useState(null);
  const [closingNote, setClosingNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCurrentShift();
      setCurrentShift(data);
    } catch {
      setCurrentShift(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const loadHistory = async () => {
      try {
        const list = await getMyShifts("Đóng");
        setShiftHistory(list || []);
      } catch { void 0; }
    };
    loadHistory();
    const loadUser = async () => {
      try {
        const info = await getMyInfo();
        const u = info.result || info;
        setMyAccountId(u?.id || null);
      } catch { void 0; }
    };
    loadUser();
  }, []);

  const fetchOrdersForRange = useCallback(
    async (fromISO, toISO) => {
      try {
        const rows = await getMyOrdersByDateTimeRange(fromISO, toISO);
        let data = rows || [];
        if (!Array.isArray(data) || data.length === 0) {
          try {
            const fromDate = new Date(fromISO);
            const toDate = new Date(toISO);
            const formatDate = (d) =>
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(d.getDate()).padStart(2, "0")}`;
            const resp = await getAllOrders({
              from: formatDate(fromDate),
              to: formatDate(toDate),
            });
            const all = resp?.content || resp || [];
            const myId = myAccountId;
            const fromTs = fromDate.getTime();
            const toTs = toDate.getTime();
            data = (Array.isArray(all) ? all : []).filter((o) => {
              const uid =
                o.accountId || (o.account && o.account.accountId) || null;
              const dt = new Date(
                o.orderDate || o.createdDate || o.createdAt || Date.now()
              ).getTime();
              return (
                myId &&
                uid &&
                String(uid) === String(myId) &&
                dt >= fromTs &&
                dt <= toTs
              );
            });
        } catch { void 0; }
        }
        setOrders(data || []);
    } catch { void 0; }
    },
    [myAccountId]
  );

  useEffect(() => {
    if (currentShift && currentShift.status === "Mở" && currentShift.openedAt) {
      // start polling
      const startISO = currentShift.openedAt;
      const stop = setInterval(async () => {
        const nowISO = new Date().toISOString();
        await fetchOrdersForRange(startISO, nowISO);
      }, 3000);
      setPolling(stop);
      // initial fetch
      fetchOrdersForRange(startISO, new Date().toISOString());
      return () => {
        if (stop) clearInterval(stop);
      };
    } else {
      if (polling) {
        clearInterval(polling);
        setPolling(null);
      }
    }
  }, [currentShift, fetchOrdersForRange]);

  const handleOpen = async () => {
    try {
      if (!initialCash || Number(initialCash) < 0) {
        message.error("Nhập số tiền mặt hợp lệ");
        return;
      }
      setLoading(true);
      try {
        localStorage.setItem(
          "posShiftState",
          JSON.stringify({
            initialCash: Number(initialCash),
            openedAt: new Date().toISOString(),
            status: "Mở",
          })
        );
      } catch { void 0; }
      const res = await openShift(Number(initialCash));
      setCurrentShift(res);
      setSelectedHistoryShift(null);
      setInitialCash("");
      message.success("Đã mở ca");
      // Immediately start fetching orders for current open shift
      await fetchOrdersForRange(res.openedAt, new Date().toISOString());
    } catch {
      message.error("Không thể mở ca");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      if (closingCash === undefined || Number(closingCash) < 0) {
        message.error("Nhập số tiền mặt hiện tại hợp lệ");
        return;
      }
      setLoading(true);
      try {
        const data = localStorage.getItem("posShiftState");
        const parsed = data ? JSON.parse(data) : {};
        localStorage.setItem(
          "posShiftState",
          JSON.stringify({
            ...parsed,
            closingCash: Number(closingCash),
            closedAt: new Date().toISOString(),
            status: "Đóng",
            closingNote: closingNote,
            closing_note: closingNote,
            note: closingNote,
          })
        );
      } catch { void 0; }
      const res = await closeShift(Number(closingCash), closingNote);
      setCurrentShift(res);
      setClosingCash("");
      setClosingNote("");
      try {
        const list = await getMyShifts("Đóng");
        setShiftHistory(list || []);
      } catch { void 0; }
      setSelectedHistoryShift(res);
      if (res && res.openedAt && res.closedAt) {
        await fetchOrdersForRange(res.openedAt, res.closedAt);
      }
      message.success("Đã đóng ca");
    } catch {
      message.error("Không thể đóng ca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentShift?.status === "Mở") {
      setSelectedHistoryShift(null);
    }
  }, [currentShift?.status]);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex justify-content-between align-items-center">
              <div className="page-title">
                <h4 className="fw-bold">Đóng/Mở ca</h4>
                <h6>Quản lý ca làm việc POS</h6>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h4 className="fs-18 fw-bold">Trạng thái ca</h4>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      />
                    </div>
                  ) : currentShift && currentShift.status === "Mở" ? (
                    <div className="">
                      <div className="mb-2">
                        {" "}
                        <span className="badge badge-success">Đang mở</span>
                      </div>
                      <div className="mb-2">
                        Bắt đầu: {formatTime(currentShift.openedAt)}
                      </div>
                      <div className="mb-3">
                        Tiền trong két ban đầu:{" "}
                        {Number(currentShift.initialCash || 0).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Tiền thực tế trong két
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={closingCash}
                          onChange={(e) => setClosingCash(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Ghi chú chốt ca</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={closingNote}
                          onChange={(e) => setClosingNote(e.target.value)}
                        />
                      </div>
                      <button
                        disabled={loading}
                        className="btn btn-purple"
                        onClick={handleClose}
                      >
                        Đóng ca
                      </button>
                    </div>
                  ) : (
                    <div className="">
                      <div className="mb-2">
                        {" "}
                        <span className="badge badge-secondary">Đang đóng</span>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Tiền trong két ban đầu
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={initialCash}
                          onChange={(e) => setInitialCash(e.target.value)}
                        />
                      </div>
                      <button
                        disabled={loading}
                        className="btn btn-teal"
                        onClick={handleOpen}
                      >
                        Mở ca
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Bảng tóm tắt ca */}
              <div className="card mt-3">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h4 className="fs-18 fw-bold">Tổng hợp ca</h4>
                </div>
                <div className="card-body">
                  {(() => {
                    const paid = (s) =>
                      (s || "")
                        .toString()
                        .toLowerCase()
                        .includes("đã thanh toán") ||
                      (s || "").toString().toUpperCase() === "PAID" ||
                      (s || "").toString().toUpperCase() ===
                        "PAYMENT_COMPLETED";
                    const done = (s) =>
                      (s || "").toString().toLowerCase().includes("hoàn tất") ||
                      (s || "").toString().toUpperCase() === "COMPLETED";
                    const methodStr = (o) =>
                      (o.payment?.paymentMethod || o.paymentMethod || "")
                        .toString()
                        .toUpperCase();
                    const isCash = (m) =>
                      m.includes("CASH") || m.includes("TIỀN MẶT");
                    const refShift =
                      selectedHistoryShift &&
                      selectedHistoryShift.status === "Đóng"
                        ? selectedHistoryShift
                        : currentShift?.status === "Mở"
                        ? currentShift
                        : null;
                    if (!refShift) {
                      return (
                        <div className="">
                          <p className="text-muted mb-0">
                            Chưa có ca được chọn. Vui lòng mở ca hoặc chọn từ
                            lịch sử.
                          </p>
                        </div>
                      );
                    }
                    const from = refShift?.openedAt
                      ? new Date(refShift.openedAt).getTime()
                      : 0;
                    const to = refShift?.closedAt
                      ? new Date(refShift.closedAt).getTime()
                      : new Date().getTime();
                    const rows = orders.filter((o) => {
                      const dt = new Date(
                        o.orderDate ||
                          o.createdDate ||
                          o.createdAt ||
                          Date.now()
                      ).getTime();
                      return dt >= from && dt <= to;
                    });
                    const completedPaid = rows.filter(
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
                      Number(refShift?.initialCash || 0) +
                      cashCol -
                      changeReturned;
                    return (
                      <div className="">
                        <p className="mb-1">
                          Doanh thu ca:{" "}
                          <strong>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(revenueTotal)}
                          </strong>
                        </p>
                        <p className="mb-1">
                          Tiền mặt thu được:{" "}
                          <strong>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(cashCol)}
                          </strong>
                        </p>
                        <p className="mb-1">
                          Tiền khoản thu được:{" "}
                          <strong>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(nonCashCol)}
                          </strong>
                        </p>
                        <p className="mb-1">
                          Tiền dự kiến trong két:{" "}
                          <strong>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(expectedDrawer)}
                          </strong>
                        </p>
                        {refShift?.status === "Đóng" && (
                          <>
                            <p className="mb-1">
                              Tiền thực tế trong két:{" "}
                              <strong>
                                {Number(
                                  refShift?.closingCash || 0
                                ).toLocaleString("vi-VN")}{" "}
                                VND
                              </strong>
                            </p>
                            <p className="mb-1">
                              Ghi chú chốt ca:{" "}
                              <span className="text-muted">
                                {refShift?.note || "-"}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h4 className="fs-18 fw-bold">Đơn trong ca</h4>
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select"
                      style={{ maxWidth: "280px" }}
                      value={selectedHistoryShift?.shiftId || ""}
                      disabled={currentShift?.status === "Mở"}
                      onChange={(e) => {
                        const id = e.target.value;
                        const s = shiftHistory.find((x) => x.shiftId === id);
                        setSelectedHistoryShift(s || null);
                        if (!id) {
                          setOrders([]);
                        }
                        if (
                          s &&
                          s.status === "Đóng" &&
                          s.openedAt &&
                          s.closedAt
                        ) {
                          fetchOrdersForRange(s.openedAt, s.closedAt);
                        }
                      }}
                    >
                      <option value="">Xem ca hiện tại</option>
                      {shiftHistory.map((s) => (
                        <option key={s.shiftId} value={s.shiftId}>
                          Ca: {new Date(s.openedAt).toLocaleString("vi-VN")}{" "}
                          {s.closedAt
                            ? `→ ${new Date(s.closedAt).toLocaleString(
                                "vi-VN"
                              )}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  className="card-body"
                  style={{ maxHeight: "420px", overflowY: "auto" }}
                >
                  {(() => {
                    const refShift =
                      selectedHistoryShift &&
                      selectedHistoryShift.status === "Đóng"
                        ? selectedHistoryShift
                        : currentShift?.status === "Mở"
                        ? currentShift
                        : null;
                    const from = refShift?.openedAt
                      ? new Date(refShift.openedAt).getTime()
                      : 0;
                    const to = refShift?.closedAt
                      ? new Date(refShift.closedAt).getTime()
                      : new Date().getTime();
                    const rows = refShift
                      ? orders.filter((o) => {
                          const dt = new Date(
                            o.orderDate ||
                              o.createdDate ||
                              o.createdAt ||
                              Date.now()
                          ).getTime();
                          return dt >= from && dt <= to;
                        })
                      : [];
                    return (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Mã đơn</th>
                            <th>Hình thức</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center text-muted"
                              >
                                Không có đơn nào
                              </td>
                            </tr>
                          ) : (
                            rows.map((o, idx) => (
                              <tr key={o.orderId || idx}>
                                <td>{o.orderNumber || o.orderId}</td>
                                <td>
                                  {(
                                    o.payment?.paymentMethod ||
                                    o.paymentMethod ||
                                    ""
                                  ).toString()}
                                </td>
                                <td>
                                  {Number(o.totalAmount || 0).toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </td>
                                <td>{o.orderStatus || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PosShift;
