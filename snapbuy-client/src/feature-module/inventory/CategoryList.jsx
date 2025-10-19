import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditCategory from "./EditCategory";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/CategoryService";
import { message } from "antd";

const CategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state for Add Category
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: true,
  });

  // Form state for Edit Category
  const [editCategory, setEditCategory] = useState({
    name: "",
    description: "",
    status: true,
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();

      // Map API data to match table structure
      const mappedCategories = data.map((cat) => ({
        id: cat.id,
        category: cat.name || cat.categoryName || "N/A",
        description: cat.description || cat.description || "N/A",
        createddate: cat.createdDate
          ? new Date(cat.createdDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "N/A",
        updateddate: cat.updatedDate
          ? new Date(cat.updatedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "N/A",
        status: (cat.active === 1 || cat.active === true) ? "Active" : "Inactive",
      }));

      setCategories(mappedCategories);
      setTotalRecords(mappedCategories.length);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.name || !newCategory.description) {
      message.warning("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await createCategory({
        name: newCategory.name,
        description: newCategory.description,
        status: newCategory.status,
      });

      // Reset form
      setNewCategory({ name: "", description: "", status: true });

      // Close modal
      const modalElement = document.getElementById("add-category");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Refresh list
      fetchCategories();
      message.success("Category added successfully!");
    } catch (err) {
      console.error("❌ Error adding category:", err);
      message.error("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Category
  const handleEditClick = (category) => {
    setEditCategory({
      id: category.id,
      name: category.category,
      description: category.description,
      status: category.status,
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editCategory.name || !editCategory.description) {
      message.warning("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await updateCategory(editCategory.id, {
        name: editCategory.name,
        description: editCategory.description,
        status: editCategory.status,
      });

      // Close modal
      const modalElement = document.getElementById("edit-category");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      // Refresh list
      fetchCategories();
      message.success("Category updated successfully!");
    } catch (err) {
      console.error("❌ Error updating category:", err);
      message.error("Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Category
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    const modalElement = document.getElementById("delete-modal");
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  };

  const handleDeleteConfirm = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchCategories();
      setSelectedCategory(null);
      message.success("Category deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting category:", err);
      message.error("Failed to delete category. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setSelectedCategory(null);
  };

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Category",
      field: "category",
      key: "category",
      sortable: true,
    },
    {
      header: "Description",
      field: "description",
      key: "description",
      sortable: true,
    },
    {
      header: "Created Date",
      field: "createddate",
      key: "createddate",
      sortable: true,
    },
    {
      header: "Updated Date",
      field: "updateddate",
      key: "updateddate",
      sortable: true,
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <span
          className={`badge fw-medium fs-10 ${data.status === "Active" ? "bg-success" : "bg-danger"
            }`}
        >
          {data.status}
        </span>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <button
            className="me-2 p-2 d-flex align-items-center border rounded bg-transparent"
            data-bs-toggle="modal"
            data-bs-target="#edit-category"
            onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
          <button
            className="p-2 d-flex align-items-center border rounded bg-transparent"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="feather icon-trash-2"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Category</h4>
                <h6>Manage your categories</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-category"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Category
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Category List Table */}
          {!loading && (
            <div className="card table-list-card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
                <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Status
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Active
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Inactive
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Sort By : Last 7 Days
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Recently Added
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Ascending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Desending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Last Month
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Last 7 Days
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive category-table">
                  <PrimeDataTable
                    column={columns}
                    data={categories}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <CommonFooter />
      </div>

      {/* Add Category Modal */}
      <div className="modal fade" id="add-category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Add Category</h4>
                  </div>
                  <button
                    type="button"
                    className="close bg-danger text-white fs-16"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddCategory}>
                    <div className="mb-3">
                      <label className="form-label">
                        Category<span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newCategory.name}
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Description<span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        required
                      />
                    </div>
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">
                          Status<span className="text-danger ms-1">*</span>
                        </span>
                        <input
                          type="checkbox"
                          id="add-status-toggle"
                          className="check"
                          checked={newCategory.status}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              status: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="add-status-toggle"
                          className="checktoggle"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleAddCategory}
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      <div className="modal fade" id="edit-category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Edit Category</h4>
                  </div>
                  <button
                    type="button"
                    className="close bg-danger text-white fs-16"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdateCategory}>
                    <div className="mb-3">
                      <label className="form-label">
                        Category<span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCategory.name}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Description<span className="text-danger ms-1">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCategory.description}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">
                          Status<span className="text-danger ms-1">*</span>
                        </span>
                        <input
                          type="checkbox"
                          id="edit-status-toggle"
                          className="check"
                          checked={editCategory.status}
                          onChange={(e) =>
                            setEditCategory({
                              ...editCategory,
                              status: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="edit-status-toggle"
                          className="checktoggle"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleUpdateCategory}
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Category"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        itemId={selectedCategory?.id}
        itemName={selectedCategory?.category}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default CategoryList;
