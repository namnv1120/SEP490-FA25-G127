import { useState, useEffect } from "react";
import { getCategoryById, updateCategory } from "../../../services/CategoryService";
import { Modal, message, Spin } from "antd";

const EditSubCategory = ({ isOpen, categoryId, parentCategories, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: "",
    active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && categoryId) {
      loadCategoryData();
    }
  }, [isOpen, categoryId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(categoryId);
      setFormData({
        categoryName: category.categoryName || category.category_name || "",
        description: category.description || "",
        parentCategoryId: category.parentCategoryId || "",
        active: category.active === 1 || category.active === true,
      });
    } catch (error) {
      console.error("Không thể tải dữ liệu danh mục con", error);
      message.error("Không thể tải dữ liệu danh mục con");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Validate dữ liệu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Vui lòng nhập tên danh mục con.";
    } else if (formData.categoryName.length < 3) {
      newErrors.categoryName = "Tên danh mục con phải có ít nhất 3 ký tự.";
    } else if (formData.categoryName.length > 100) {
      newErrors.categoryName = "Tên danh mục con không được vượt quá 100 ký tự.";
    }

    if (!formData.parentCategoryId) {
      newErrors.parentCategoryId = "Vui lòng chọn danh mục cha.";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự.";
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        categoryName: formData.categoryName,
        description: formData.description,
        parentCategoryId: formData.parentCategoryId,
        active: formData.active ? 1 : 0,
      };

      await updateCategory(categoryId, updateData);
      message.success("Cập nhật danh mục con thành công!");

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục con", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật danh mục con";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!categoryId) return null;

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
          <h4 className="mb-0">Cập nhật danh mục con</h4>
        </div>
      }

    >
      {loading && !formData.categoryName ? (
        <div className="d-flex justify-content-center p-4">
          <Spin size="large" />
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-3">
            <label className="form-label">
              Danh mục cha<span className="text-danger">*</span>
            </label>
            <select
              name="parentCategoryId"
              className={`form-select ${errors.parentCategoryId ? "is-invalid" : ""}`}
              value={formData.parentCategoryId}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Chọn danh mục cha</option>
              {(parentCategories || []).map((parent) => (
                <option key={parent.categoryId} value={parent.categoryId}>
                  {parent.name || parent.categoryName}
                </option>
              ))}
            </select>
            {errors.parentCategoryId && (
              <div className="invalid-feedback">
                {errors.parentCategoryId}
              </div>
            )}
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
              disabled={loading}
            />
            {errors.categoryName && (
              <div className="invalid-feedback">
                {errors.categoryName}
              </div>
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
              disabled={loading}
            />
            {errors.description && (
              <div className="invalid-feedback">
                {errors.description}
              </div>
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
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditSubCategory;
