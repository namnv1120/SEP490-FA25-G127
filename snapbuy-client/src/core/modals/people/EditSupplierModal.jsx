import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { getSupplierById, updateSupplier } from "../../../services/SupplierService";

const EditSupplier = ({ isOpen, supplierId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    city: "",
    active: true,
  });

  useEffect(() => {
    if (isOpen && supplierId) {
      loadSupplierData();
    }
  }, [isOpen, supplierId]);

  const loadSupplierData = async () => {
    try {
      setLoading(true);
      const supplier = await getSupplierById(supplierId);

      setFormData({
        supplierCode: supplier.supplierCode || "",
        supplierName: supplier.supplierName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        ward: supplier.ward || "",
        city: supplier.city || "",
        active: supplier.active === 1 || supplier.active === true,
      });
    } catch (error) {
      message.error("Không thể tải dữ liệu nhà cung cấp");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplierCode.trim()) {
      message.warning("Hãy nhập mã nhà cung cấp");
      return;
    }
    if (!formData.supplierName.trim()) {
      message.warning("Hãy nhập tên nhà cung cấp");
      return;
    }
    if (!formData.email.trim()) {
      message.warning("Hãy nhập email");
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address,
        ward: formData.ward || "",
        city: formData.city || "",
        active: formData.active === true,
      };

      await updateSupplier(supplierId, submitData);
      message.success("Cập nhật nhà cung cấp thành công!");

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật nhà cung cấp";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!supplierId) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      footer={null}
      width={800}
      closable={true}
      title={
        <div>
          <h4 className="mb-0">Cập nhật nhà cung cấp</h4>
        </div>
      }
    >
      {loading && !formData.supplierCode ? (
        <div className="d-flex justify-content-center p-4">
          <Spin size="large" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Mã nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="supplierCode"
                  className="form-control"
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Tên nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="supplierName"
                  className="form-control"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-12">
              <div className="mb-3">
                <label className="form-label">
                  Địa chỉ <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Quận/Huyện</label>
                <input
                  type="text"
                  name="ward"
                  className="form-control"
                  value={formData.ward}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-lg-6 col-sm-10 col-10">
              <div className="mb-3">
                <label className="form-label">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Nhập thành phố"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-0">
                <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                  <span className="status-label">Trạng thái</span>
                  <input
                    type="checkbox"
                    id="edit-supplier-status"
                    className="check"
                    checked={formData.active}
                    onChange={handleStatusChange}
                    disabled={loading}
                  />
                  <label htmlFor="edit-supplier-status" className="checktoggle mb-0" />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer-btn mt-4 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-cancel me-2"
              onClick={onClose}
              disabled={loading}
            >
              Huỷ
            </button>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditSupplier;
