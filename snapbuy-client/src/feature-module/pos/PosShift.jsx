import { useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  openShift,
  closeShift,
  getCurrentShift,
} from "../../services/ShiftService";

const PosShift = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [initialCash, setInitialCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCurrentShift();
      setCurrentShift(data);
    } catch (e) {
      setCurrentShift(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      } catch {}
      const res = await openShift(Number(initialCash));
      setCurrentShift(res);
      message.success("Đã mở ca");
    } catch (e) {
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
          })
        );
      } catch {}
      const res = await closeShift(Number(closingCash));
      setCurrentShift(res);
      message.success("Đã đóng ca");
    } catch (e) {
      message.error("Không thể đóng ca");
    } finally {
      setLoading(false);
    }
  };

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
                      Trạng thái:{" "}
                      <span className="badge badge-success">Đang mở</span>
                    </div>
                    <div className="mb-2">
                      Bắt đầu: {formatTime(currentShift.openedAt)}
                    </div>
                    <div className="mb-3">
                      Tiền mặt ban đầu:{" "}
                      {Number(currentShift.initialCash || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VND
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tiền mặt hiện tại</label>
                      <input
                        type="number"
                        className="form-control"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
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
                      Trạng thái:{" "}
                      <span className="badge badge-secondary">Đang đóng</span>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tiền mặt ban đầu</label>
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
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PosShift;
