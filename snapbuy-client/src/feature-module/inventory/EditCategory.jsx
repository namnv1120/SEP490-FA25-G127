import { useState, useEffect } from "react";
import { getCategoryById, updateCategory } from "../../services/CategoryService";
import { Modal } from "bootstrap";
import { message } from "antd";

const EditCategory = ({ categoryId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    active: true,
  });

  // Load dữ liệu category khi modal mở
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const category = await getCategoryById(categoryId);

        setFormData({
          categoryName:
            category.categoryName || category.category_name || "",
          description: category.description || "",
          active: category.active === 1 || category.active === true,
        });
      } catch (error) {
        console.error("Error loading category:", error);
        message.error("Không thể tải dữ liệu category");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox change
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };

  // Submit form để update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      };

      await updateCategory(categoryId, updateData);
      message.success("Cập nhật category thành công!");

      // Đóng modal và dọn backdrop
      const modalElement = document.getElementById("edit-main-category");
      let modal = Modal.getInstance(modalElement);
      if (!modal) modal = new Modal(modalElement);
      modal.hide();

      setTimeout(() => {
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      }, 100);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật category";
      message.error(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Edit Main Category Modal */}
      <div className="modal fade" id="edit-main-category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Edit Category</h4>
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
                        id="cat-status"
                        className="check"
                        checked={formData.active}
                        onChange={handleStatusChange}
                      />
                      <label htmlFor="cat-status" className="checktoggle" />
                    </div>
                  </div>

                  <div className="modal-footer-btn mt-4 d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-cancel me-2"
                      data-bs-dismiss="modal"
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
      {/* /Edit Main Category Modal */}
    </div>
  );
};

export default EditCategory;
