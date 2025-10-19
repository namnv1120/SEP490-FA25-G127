import { useState, useEffect } from "react";
import CommonSelect from "../../components/select/common-select";
import {
  getCategoryById,
  updateCategory,
  getAllCategories,
} from "../../services/CategoryService";
import { Modal } from "bootstrap";
import { message } from "antd";

const EditSubcategory = ({ subcategoryId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: "",
    active: true,
  });

  // Load parent categories cho dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const categories = await getAllCategories();
        const parents = categories.filter(
          (cat) => !cat.parentCategoryId && !cat.parent_category_id
        );
        const categoryOptions = parents.map((cat) => ({
          value: cat.id || cat.categoryId || cat.category_id,
          label: cat.categoryName || cat.category_name || cat.name,
        }));
        setParentCategories(categoryOptions);
      } catch (error) {
        console.error("Error loading parent categories:", error);
        message.error("Không thể tải danh mục cha");
      }
    };
    fetchParentCategories();
  }, []);

  // Load dữ liệu subcategory khi modal mở
  useEffect(() => {
    const loadSubcategoryData = async () => {
      if (!subcategoryId) return;

      try {
        setLoading(true);
        const subcategory = await getCategoryById(subcategoryId);

        setFormData({
          categoryName:
            subcategory.categoryName || subcategory.category_name || "",
          description: subcategory.description || "",
          parentCategoryId:
            subcategory.parentCategoryId || subcategory.parent_category_id || "",
          active: subcategory.active === 1 || subcategory.active === true,
        });

        const parentId =
          subcategory.parentCategoryId || subcategory.parent_category_id;
        setSelectedCategory(parentId);
      } catch (error) {
        console.error("Error loading subcategory:", error);
        message.error("Không thể tải dữ liệu subcategory");
      } finally {
        setLoading(false);
      }
    };

    loadSubcategoryData();
  }, [subcategoryId]);

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

  // Handle parent category selection
  const handleCategoryChange = (selected) => {
    setSelectedCategory(selected);
    setFormData((prev) => ({
      ...prev,
      parentCategoryId: selected,
    }));
  };

  // Submit form để update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.categoryName.trim()) {
      message.warning("Vui lòng nhập tên subcategory");
      return;
    }

    if (!formData.parentCategoryId) {
      message.warning("Vui lòng chọn parent category");
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

      await updateCategory(subcategoryId, updateData);
      message.success("Cập nhật subcategory thành công!");

      // Đóng modal và dọn backdrop
      const modalElement = document.getElementById("edit-category");
      let modal = Modal.getInstance(modalElement);
      if (!modal) modal = new Modal(modalElement);
      modal.hide();

      // Dọn nền bị kẹt (backdrop)
      setTimeout(() => {
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      }, 100);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật subcategory";
      message.error(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Edit Category */}
      <div className="modal fade" id="edit-category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Edit Sub Category</h4>
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
                      Parent Category<span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      className="w-100"
                      options={parentCategories}
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      placeholder="Choose Category"
                      filter={false}
                    />
                  </div>

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
                        id="user3"
                        className="check"
                        checked={formData.active}
                        onChange={handleStatusChange}
                      />
                      <label htmlFor="user3" className="checktoggle" />
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

      {/* /Edit Category */}
    </div>
  );
};

export default EditSubcategory;
