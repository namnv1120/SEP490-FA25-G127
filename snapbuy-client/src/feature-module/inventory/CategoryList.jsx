import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { 
  getAllCategories, 
  createCategory, 
  deleteCategory 
} from "../../services/CategoryService"; // 👈 Import service

const CategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [categories, setCategories] = useState([]); // 👈 State cho categories từ API
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ✅ Form state cho Add Category
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    categorySlug: "",
    status: true,
  });

  // ✅ Fetch categories từ API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response.categories || response);
      setTotalRecords(response.total || response.length || 0);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      alert("⚠️ Không thể tải danh sách categories!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load categories khi component mount
  useEffect(() => {
    fetchCategories();
  }, [currentPage, rows, searchQuery]);

  // ✅ Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // ✅ Handle Add Category Submit
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.categoryName || !categoryForm.categorySlug) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await createCategory({
        categoryName: categoryForm.categoryName,
        categorySlug: categoryForm.categorySlug,
        status: categoryForm.status ? "Active" : "Inactive",
      });

      alert("✅ Thêm category thành công!");
      
      // Reset form
      setCategoryForm({
        categoryName: "",
        categorySlug: "",
        status: true,
      });

      // Đóng modal
      const modalElement = document.getElementById("add-category");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();

      // Reload data
      fetchCategories();
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert("❌ Không thể thêm category!");
    }
  };

  // ✅ Handle Delete
  const handleDeleteClick = (id) => {
    setSelectedId(id);
  };

  const handleDeleteSuccess = async () => {
    if (selectedId) {
      try {
        await deleteCategory(selectedId);
        alert("✅ Xóa category thành công!");
        fetchCategories();
      } catch (error) {
        console.error("❌ Error deleting category:", error);
        alert("❌ Không thể xóa category!");
      } finally {
        setSelectedId(null);
      }
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
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
      field: "categoryName",
      key: "categoryName",
      sortable: true,
    },
    {
      header: "Category Slug",
      field: "categorySlug",
      key: "categorySlug",
      sortable: true,
    },
    {
      header: "Created On",
      field: "createdAt",
      key: "createdAt",
      sortable: true,
      body: (data) => new Date(data.createdAt).toLocaleDateString(),
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <span className={`badge ${data.status === 'Active' ? 'bg-success' : 'bg-danger'} fw-medium fs-10`}>
          {data.status}
        </span>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (rowData) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-customer"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <button
            className="p-2 d-flex align-items-center border rounded bg-transparent"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
            onClick={() => handleDeleteClick(rowData.id)}
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
                        Descending
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
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      {/* ✅ Add Category Modal với form handling */}
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
                        name="categoryName"
                        value={categoryForm.categoryName}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Category Slug<span className="text-danger ms-1">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control"
                        name="categorySlug"
                        value={categoryForm.categorySlug}
                        onChange={handleInputChange}
                        placeholder="e.g., electronics"
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
                          id="add-cat-status" 
                          className="check"
                          name="status"
                          checked={categoryForm.status}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="add-cat-status" className="checktoggle" />
                      </div>
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
                        className="btn btn-primary fs-13 fw-medium p-2 px-3"
                      >
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditCategoryList />
      <DeleteModal 
        categoryId={selectedId}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default CategoryList;