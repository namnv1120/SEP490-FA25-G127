import { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message } from "antd";
import { getSupplierById } from "../../../services/SupplierService";

const SupplierDetailModal = ({ isOpen, onClose, supplierId }) => {
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState(null);

  const fetchSupplierDetail = useCallback(async () => {
    if (!supplierId) return;
    try {
      setLoading(true);
      const data = await getSupplierById(supplierId);

      if (!data) {
        message.warning("Không tìm thấy dữ liệu nhà cung cấp!");
        onClose?.();
        return;
      }

      setSupplier(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết nhà cung cấp:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải chi tiết nhà cung cấp!";
      message.error(errorMessage);
      onClose?.();
    } finally {
      setLoading(false);
    }
  }, [supplierId, onClose]);

  useEffect(() => {
    if (isOpen && supplierId) {
      fetchSupplierDetail();
    }
  }, [isOpen, supplierId, fetchSupplierDetail]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      closable
      title={
        <div>
          <h4 className="mb-1">Chi tiết nhà cung cấp</h4>
          {supplier && (
            <span className="text-muted">{supplier.supplierCode}</span>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Spin size="large" />
        </div>
      ) : supplier ? (
        <div className="supplier-detail-modal">
          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Mã nhà cung cấp</h6>
                    <div>{supplier.supplierCode || "—"}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Tên nhà cung cấp</h6>
                    <div>{supplier.supplierName || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Số điện thoại</h6>
                    <div>{supplier.phone || "—"}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Email</h6>
                    <div>{supplier.email || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Thành phố</h6>
                    <div>{supplier.city || "—"}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">Xã/Phường</h6>
                    <div>{supplier.ward || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold mb-1">Địa chỉ</h6>
                <div>{supplier.address || "—"}</div>
              </div>

              <div className="mb-2">
                <h6 className="fw-bold mb-1">Trạng thái</h6>
                <span
                  className={`badge fw-medium fs-10 ${
                    supplier.active === true || supplier.active === 1
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {supplier.active === true || supplier.active === 1
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-5">
          <p className="text-muted">Không tìm thấy thông tin nhà cung cấp</p>
        </div>
      )}
    </Modal>
  );
};

export default SupplierDetailModal;


