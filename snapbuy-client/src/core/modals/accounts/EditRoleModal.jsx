import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { getRoleById, updateRole } from "../../../services/RoleService";

const EditRole = ({ isOpen, roleId, onSuccess, onUpdated, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && roleId) {
      loadRoleData();
    } else if (!isOpen) {
      // Reset form khi modal đóng
      setFormData({
        roleName: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen, roleId]);

  const loadRoleData = async () => {
    try {
      setLoading(true);
      const role = await getRoleById(roleId);
      const roleData = role.result || role;
      
      setFormData({
        roleName: roleData.roleName || "",
        description: roleData.description || "",
      });
    } catch (error) {
      console.error("Không thể tải dữ liệu vai trò", error);
      message.error("Không thể tải dữ liệu vai trò");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra hợp lệ dữ liệu dựa trên backend validation
  const validateForm = () => {
    const newErrors = {};

    // Tên vai trò
    if (formData.roleName && formData.roleName.length > 50) {
      newErrors.roleName = "Tên vai trò không được vượt quá 50 ký tự.";
    }

    // Mô tả
    if (formData.description && formData.description.length > 4000) {
      newErrors.description = "Mô tả không được vượt quá 4000 ký tự.";
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        roleName: formData.roleName.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      await updateRole(roleId, updateData);
      message.success("Cập nhật vai trò thành công!");

      if (onUpdated) onUpdated();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Không thể cập nhật vai trò. Vui lòng thử lại.";
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
          <h4 className="mb-0">Sửa vai trò</h4>
        </div>
      }
    >
      {!roleId ? (
        <div className="d-flex justify-content-center p-4">
          <p className="text-danger">Không tìm thấy ID vai trò. Vui lòng thử lại.</p>
        </div>
      ) : loading && !formData.roleName ? (
        <div className="d-flex justify-content-center p-4">
          <Spin size="large" />
        </div>
      ) : (
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
              required
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
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditRole;
