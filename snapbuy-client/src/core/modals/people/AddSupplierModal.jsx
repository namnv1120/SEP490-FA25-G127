import { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { createSupplier } from "../../../services/SupplierService";

const AddSupplier = ({ isOpen, onClose, onSuccess }) => {
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

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        supplierCode: "",
        supplierName: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        city: "",
        active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

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

    if (formData.email && formData.email.length > 100) {
      newErrors.email = "Email không được vượt quá 100 ký tự.";
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
        phone: formData.phone,
        address: formData.address,
        ward: formData.ward || "",
        city: formData.city || "",
        active: formData.active === true,
      };

      await createSupplier(submitData);
      message.success("Thêm nhà cung cấp thành công!");

      // Reset form
      setFormData({
        supplierCode: "",
        supplierName: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        city: "",
        active: true,
      });
      setErrors({});

      // Đóng modal
      if (onClose) onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi thêm nhà cung cấp";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <h4 className="mb-0">Thêm nhà cung cấp</h4>
        </div>
      }
    >
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
                placeholder="Nhập mã nhà cung cấp"
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
                placeholder="Nhập tên nhà cung cấp"
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
                Email <span className="text-danger"></span>
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
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
                Số điện thoại <span className="text-danger"></span>
              </label>
              <input
                type="text"
                name="phone"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
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
                Địa chỉ <span className="text-danger"></span>
              </label>
              <input
                type="text"
                name="address"
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
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
              <label className="form-label">Quận/Phường</label>
              <input
                type="text"
                name="ward"
                className={`form-control ${errors.ward ? "is-invalid" : ""}`}
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="Nhập quận/phường"
                disabled={loading}
              />
              {errors.ward && (
                <div className="invalid-feedback">
                  {errors.ward}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
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
            {loading ? "Đang lưu ..." : "Thêm nhà cung cấp"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSupplier;
