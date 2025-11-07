import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { createRole } from "../../../services/RoleService";

const AddRole = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        roleName: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Hàm kiểm tra hợp lệ dữ liệu dựa trên backend validation
  const validateForm = () => {
    const newErrors = {};

    // Tên vai trò
    if (!formData.roleName.trim()) {
      newErrors.roleName = "Vui lòng nhập tên vai trò.";
    } else if (formData.roleName.length > 50) {
      newErrors.roleName = "Tên vai trò không được vượt quá 50 ký tự.";
    }

    // Mô tả
    if (formData.description && formData.description.length > 4000) {
      newErrors.description = "Mô tả không được vượt quá 4000 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const newRole = {
        roleName: formData.roleName.trim(),
        description: formData.description.trim() || "",
        active: true,
      };

      await createRole(newRole);
      message.success("Thêm vai trò thành công!");

      // Reset form
      setFormData({
        roleName: "",
        description: "",
      });
      setErrors({});

      // Đóng modal
      if (onClose) onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Không thể thêm vai trò.";
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
      width={600}
      closable={true}
      title={
        <div>
          <h4 className="mb-0">Thêm vai trò</h4>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Tên vai trò */}
        <div className="mb-3">
          <label className="form-label">
            Tên vai trò<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="roleName"
            className={`form-control ${errors.roleName ? "is-invalid" : ""}`}
            value={formData.roleName}
            onChange={handleInputChange}
            placeholder="Nhập tên vai trò"
            disabled={loading}
            maxLength={50}
          />
          {errors.roleName && (
            <div className="invalid-feedback">{errors.roleName}</div>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3 input-blocks">
          <label className="form-label">Mô tả</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả (tùy chọn)"
            disabled={loading}
            maxLength={4000}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="modal-footer-btn mt-4 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-cancel me-2"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Thêm vai trò"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRole;
