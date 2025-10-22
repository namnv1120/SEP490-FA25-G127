import { useState, useEffect } from "react";
import { getCategoryById, updateCategory } from "../../services/CategoryService";
import { Modal } from "bootstrap";
import { message } from "antd";

const EditCategory = ({ categoryId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    active: true,
  });
  
  useEffect(() => {
    if (!categoryId) return;

    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const category = await getCategoryById(categoryId);
        setFormData({
          categoryName: category.categoryName || category.category_name || "",
          description: category.description || "",
          active: category.active === 1 || category.active === true,
        });

        // ✅ Mở modal sau khi load xong
        const modalElement = document.getElementById("edit-main-category");
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      } catch (error) {
        console.error("Error loading category:", error);
        message.error("Không thể tải dữ liệu category");
        if (onClose) onClose(); // ✅ Đóng nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]); 

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
      message.success("Cập nhật category thành công!");

      const modalElement = document.getElementById("edit-main-category");
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // ✅ Cleanup backdrop
      setTimeout(() => {
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 100);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật category";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    const modalElement = document.getElementById("edit-main-category");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }, 0);

    if (onClose) onClose();
  };

  if (!categoryId) return null;

  return (
    <div>
      <div className="modal fade" id="edit-main-category" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Edit Category</h4>
              </div>
              <button
                type="button"
                className="close"
                onClick={handleModalClose}
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body custom-modal-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Category Name<span className="text-danger">*</span>
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
                    <label className="form-label">Description</label>
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
                      <span className="status-label">Status</span>
                      <input
                        type="checkbox"
                        id="edit-cat-status"
                        className="check"
                        checked={formData.active}
                        onChange={handleStatusChange}
                      />
                      <label htmlFor="edit-cat-status" className="checktoggle" />
                    </div>
                  </div>

                  <div className="modal-footer-btn mt-4 d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-cancel me-2"
                      onClick={handleModalClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-submit"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;
