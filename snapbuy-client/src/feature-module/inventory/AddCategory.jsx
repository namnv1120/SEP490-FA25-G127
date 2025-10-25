import { useState } from "react";
import { Modal } from "bootstrap";
import { message } from "antd";
import { createCategory } from "../../services/CategoryService";

const AddCategory = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    active: true,
  });

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý checkbox
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  // Submit thêm mới category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      message.warning("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const newCategory = {
        categoryName: formData.categoryName,
        description: formData.description,
        active: formData.active ? 1 : 0,
        parentCategoryId: null,
      };

      await createCategory(newCategory);
      message.success("Thêm category thành công!");

      // Đóng modal và dọn backdrop
      const modalElement = document.getElementById("add-main-category");
      let modal = Modal.getInstance(modalElement);
      if (!modal) modal = new Modal(modalElement);
      modal.hide();

      setTimeout(() => {
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      }, 100);

      // Reset form
      setFormData({
        categoryName: "",
        description: "",
        active: true,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding category:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể thêm category";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Category Modal */}
      <div className="modal fade" id="add-main-category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Thêm danh mục</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body custom-modal-body">
              <form onSubmit={handleSubmit}>
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
                  />
                </div>

                <div className="mb-0">
                  <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span className="status-label">Trạng thái</span>
                    <input
                      type="checkbox"
                      id="add-cat-status"
                      className="check"
                      checked={formData.active}
                      onChange={handleStatusChange}
                    />
                    <label htmlFor="add-cat-status" className="checktoggle" />
                  </div>
                </div>

                <div className="modal-footer-btn mt-4 d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-cancel me-2"
                    data-bs-dismiss="modal"
                    disabled={loading}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Add Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Category Modal */}
    </div>
  );
};

export default AddCategory;
