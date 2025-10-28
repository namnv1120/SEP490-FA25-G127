import { useState } from "react";
import { Modal } from "bootstrap";
import { message } from "antd";
import { createCategory } from "../../services/CategoryService";

const AddSubCategory = ({ parentCategories, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: "",
    active: true,
  });

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

    if (!formData.categoryName.trim()) {
      message.warning("Vui lòng nhập tên danh mục con");
      return;
    }

    if (!formData.parentCategoryId) {
      message.warning("Vui lòng chọn danh mục cha");
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

      const modalElement = document.getElementById("add-sub-category");
      let modal = Modal.getInstance(modalElement);
      if (!modal) modal = new Modal(modalElement);
      modal.hide();

      setTimeout(() => {
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 300);

      setFormData({
        categoryName: "",
        description: "",
        parentCategoryId: "",
        active: true,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi tại thêm danh mục con", error);
      const errorMessage =
        error.response?.data?.message || "Không thể thêm danh mục con";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal fade" id="add-sub-category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Thêm danh mục con</h4>
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
                    Danh mục cha<span className="text-danger">*</span>
                  </label>
                  <select
                    name="parentCategoryId"
                    className="form-select"
                    value={formData.parentCategoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn danh mục cha</option>
                    {parentCategories.map((parent) => (
                      <option key={parent.categoryId} value={parent.categoryId}>
                        {parent.name || parent.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Tên danh mục con<span className="text-danger">*</span>
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
                      id="add-subcat-status"
                      className="check"
                      checked={formData.active}
                      onChange={handleStatusChange}
                    />
                    <label htmlFor="add-subcat-status" className="checktoggle" />
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
                    {loading ? "Saving..." : "Add Sub Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubCategory;
