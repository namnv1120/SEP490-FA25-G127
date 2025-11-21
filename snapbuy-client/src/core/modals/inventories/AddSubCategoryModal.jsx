import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { createCategory } from "../../../services/CategoryService";

const AddSubCategory = ({ isOpen, onClose, parentCategories, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        categoryName: "",
        description: "",
        parentCategoryId: "",
        active: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Vui lòng nhập tên danh mục.";
    } else if (formData.categoryName.length < 3) {
      newErrors.categoryName = "Tên danh mục phải có ít nhất 3 ký tự.";
    } else if (formData.categoryName.length > 100) {
      newErrors.categoryName = "Tên danh mục không được vượt quá 100 ký tự.";
    } else if (!/^[\p{L}\d ]+$/u.test(formData.categoryName)) {
      newErrors.categoryName = "Tên danh mục chỉ cho phép chữ, số và khoảng trắng.";
    }
    if (!formData.parentCategoryId) newErrors.parentCategoryId = "Vui lòng chọn danh mục cha.";
    if (formData.description && formData.description.length > 255) {
      newErrors.description = "Mô tả không được vượt quá 255 ký tự.";
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

      const newSubCategory = {
        categoryName: formData.categoryName,
        description: formData.description,
        parentCategoryId: formData.parentCategoryId,
        active: formData.active ? 1 : 0,
      };

      await createCategory(newSubCategory);
      message.success("Thêm danh mục con thành công!");

      // Reset form
      setFormData({
        categoryName: "",
        description: "",
        parentCategoryId: "",
        active: true,
      });
      setErrors({});

      // Đóng modal
      if (onClose) onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể thêm danh mục con";
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
          <h4 className="mb-0">Thêm danh mục con</h4>
        </div>
      }

    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="mb-3">
          <label className="form-label">Danh mục cha<span className="text-danger">*</span></label>
          <select
            name="parentCategoryId"
            value={formData.parentCategoryId}
            onChange={handleInputChange}
            className={`form-select ${errors.parentCategoryId ? "is-invalid" : ""}`}
            disabled={loading}
          >
            <option value="">Chọn danh mục cha</option>
            {(parentCategories || []).map((parent) => (
              <option key={parent.categoryId} value={parent.categoryId}>
                {parent.categoryName || parent.name}
              </option>
            ))}
          </select>
          {errors.parentCategoryId && <div className="invalid-feedback">{errors.parentCategoryId}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Tên danh mục con<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="categoryName"
            className={`form-control ${errors.categoryName ? "is-invalid" : ""}`}
            value={formData.categoryName}
            onChange={handleInputChange}
            placeholder="Nhập tên danh mục con"
            disabled={loading}
          />
          {errors.categoryName && (
            <div className="invalid-feedback">{errors.categoryName}</div>
          )}
        </div>

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
            {loading ? "Đang lưu..." : "Thêm danh mục con"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubCategory;
