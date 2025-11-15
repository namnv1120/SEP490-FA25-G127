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
  const [errors, setErrors] = useState({});

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

  // 🧩 Validate dữ liệu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierCode.trim()) {
      newErrors.supplierCode = "Vui lòng nhập mã nhà cung cấp.";
    } else if (formData.supplierCode.length > 20) {
      newErrors.supplierCode = "Mã nhà cung cấp không được vượt quá 20 ký tự.";
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = "Vui lòng nhập tên nhà cung cấp.";
    } else if (formData.supplierName.length > 100) {
      newErrors.supplierName = "Tên nhà cung cấp không được vượt quá 100 ký tự.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email không được vượt quá 100 ký tự.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng. Vui lòng kiểm tra lại.";
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = "Số điện thoại không được vượt quá 20 ký tự.";
    } else if (formData.phone && !/^[0-9+\-()\s]{6,20}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng.";
    }

    if (formData.address && formData.address.length > 100) {
      newErrors.address = "Địa chỉ không được vượt quá 100 ký tự.";
    }

    if (formData.city && formData.city.length > 50) {
      newErrors.city = "Thành phố không được vượt quá 50 ký tự.";
    }

    if (formData.ward && formData.ward.length > 50) {
      newErrors.ward = "Phường/Xã không được vượt quá 50 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
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
                  className={`form-control ${errors.supplierCode ? "is-invalid" : ""}`}
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.supplierCode && (
                  <div className="invalid-feedback">
                    {errors.supplierCode}
                  </div>
                )}
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
                  className={`form-control ${errors.supplierName ? "is-invalid" : ""}`}
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.supplierName && (
                  <div className="invalid-feedback">
                    {errors.supplierName}
                  </div>
                )}
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
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.email && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
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
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.phone && (
                  <div className="invalid-feedback">
                    {errors.phone}
                  </div>
                )}
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
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.address && (
                  <div className="invalid-feedback">
                    {errors.address}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Quận/Huyện</label>
                <input
                  type="text"
                  name="ward"
                  className={`form-control ${errors.ward ? "is-invalid" : ""}`}
                  value={formData.ward}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.ward && (
                  <div className="invalid-feedback">
                    {errors.ward}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-10 col-10">
              <div className="mb-3">
                <label className="form-label">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Nhập thành phố"
                  disabled={loading}
                />
                {errors.city && (
                  <div className="invalid-feedback">
                    {errors.city}
                  </div>
                )}
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
