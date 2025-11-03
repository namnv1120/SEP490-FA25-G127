import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { createCategory } from "../../../services/CategoryService";

const AddCategory = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        categoryName: "",
        description: "",
        active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  // Hàm kiểm tra hợp lệ dữ liệu
  const validateForm = () => {
    const newErrors = {};

    // Tên danh mục
    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Vui lòng nhập tên danh mục.";
    } else if (formData.categoryName.length < 3) {
      newErrors.categoryName = "Tên danh mục phải có ít nhất 3 ký tự.";
    } else if (formData.categoryName.length > 100) {
      newErrors.categoryName = "Tên danh mục không được vượt quá 100 ký tự.";
    }

    // Mô tả
    if (formData.description && formData.description.length > 255) {
      newErrors.description = "Mô tả không được vượt quá 255 ký tự.";
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

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const newCategory = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim(),
        active: formData.active ? 1 : 0,
        parentCategoryId: null,
      };

      await createCategory(newCategory);
      message.success("Thêm danh mục thành công!");

      // Reset form
      setFormData({
        categoryName: "",
        description: "",
        active: true,
      });
      setErrors({});

      // Đóng modal
      if (onClose) onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể thêm danh mục.";
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
          <h4 className="mb-0">Thêm danh mục</h4>
        </div>
      }

    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Tên danh mục */}
        <div className="mb-3">
          <label className="form-label">
            Tên danh mục<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="categoryName"
            className={`form-control ${errors.categoryName ? "is-invalid" : ""}`}
            value={formData.categoryName}
            onChange={handleInputChange}
            placeholder="Nhập tên danh mục"
            disabled={loading}
          />
          {errors.categoryName && (
            <div className="invalid-feedback">{errors.categoryName}</div>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3 input-blocks">
          <label className="form-label">Mô tả</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả (tùy chọn)"
            disabled={loading}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>

        {/* Trạng thái */}
        <div className="mb-0">
          <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
            <span className="status-label">Trạng thái</span>
            <input
              type="checkbox"
              id="add-cat-status"
              className="check"
              checked={formData.active}
              onChange={handleStatusChange}
              disabled={loading}
            />
            <label htmlFor="add-cat-status" className="checktoggle" />
          </div>
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
            {loading ? "Đang lưu..." : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategory;
