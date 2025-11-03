import { useState, useEffect } from "react";
import { getCategoryById, updateCategory } from "../../../services/CategoryService";
import { Modal, message, Spin } from "antd";

const EditCategory = ({ isOpen, categoryId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    active: true,
  });

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
        active: category.active === 1 || category.active === true,
      });
    } catch (error) {
      console.error("Không thể tải dữ liệu danh mục", error);
      message.error("Không thể tải dữ liệu danh mục");
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

  const handleSubmit = async () => {
    if (!formData.categoryName.trim()) {
      message.warning("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        categoryName: formData.categoryName,
        description: formData.description,
        active: formData.active ? 1 : 0,
        parentCategoryId: null,
      };

      await updateCategory(categoryId, updateData);
      message.success("Cập nhật danh mục thành công!");

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật danh mục. Vui lòng thử lại.";
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
          <h4 className="mb-0">Sửa danh mục</h4>
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
              Tên danh mục<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="categoryName"
              className="form-control"
              value={formData.categoryName}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3 input-blocks">
            <label className="form-label">Mô tả</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="mb-0">
            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
              <span className="status-label">Trạng thái</span>
              <input
                type="checkbox"
                id="edit-cat-status"
                className="check"
                checked={formData.active}
                onChange={handleStatusChange}
                disabled={loading}
              />
              <label htmlFor="edit-cat-status" className="checktoggle" />
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

export default EditCategory;
