import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllCategories } from "../../services/categoryService";
import EditCategories from "../inventory/EditCategory";

const CategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();

      // Filter chỉ lấy category cha
      const parentCategories = data.filter(
        (category) =>
          category.parentCategoryId === null ||
          category.parent_category_id === null ||
          !category.parentCategoryId
      );

      // Transform data
      const transformedData = parentCategories.map((category) => ({
        id: category.id || category.categoryId || category.category_id,
        category: category.categoryName || category.category_name || category.name,
        description: category.description || "",
        createdon:
          category.createdDate || category.created_at
            ? new Date(category.createdDate || category.created_at).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
        updatedon:
          category.updatedDate || category.updated_at
            ? new Date(category.updatedDate || category.updated_at).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
        status: category.active === 1 || category.active === true ? "Active" : "Inactive",
      }));

      setCategories(transformedData);
      setTotalRecords(transformedData.length);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshKey]);


  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedCategoryId(null);
  };


  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Filter data based on search query
  const filteredData = searchQuery
    ? categories.filter((cat) =>
      (cat?.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat?.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categories;

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
      field: "createdon",
      key: "createdon",
      sortable: true,
    },
    {
      header: "Updated Date",
      field: "updatedon",
      key: "updatedon",
      sortable: true,
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
            data-bs-target="#edit-main-category"
            onClick={() => setSelectedCategoryId(rowData.id)}
          >
            <i className="feather icon-edit"></i>
          </Link>

          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      )
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

          {/* product list */}
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
              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải danh mục...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="alert alert-danger" role="alert">
                  <i className="feather icon-alert-circle me-2"></i>
                  {error}
                  <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Data Table */}
              {!loading && !error && (
                <div className="table-responsive category-table">
                  <PrimeDataTable
                    column={columns}
                    data={filteredData}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={filteredData.length}
                  />
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && categories.length === 0 && (
                <div className="text-center py-5">
                  <i className="feather icon-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">Chưa có danh mục cha nào</p>
                  <Link
                    to="#"
                    className="btn btn-primary mt-2"
                    data-bs-toggle="modal"
                    data-bs-target="#add-category"
                  >
                    Thêm danh mục đầu tiên
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* /product list */}
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
                  <form>
                    <div className="mb-3">
                      <label className="form-label">
                        Category<span className="text-danger ms-1">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Description<span className="text-danger ms-1">*</span>
                      </label>
                      <textarea className="form-control" rows="3"></textarea>
                    </div>
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">
                          Status<span className="text-danger ms-1">*</span>
                        </span>
                        <input
                          type="checkbox"
                          id="user2"
                          className="check"
                          defaultChecked
                        />
                        <label htmlFor="user2" className="checktoggle" />
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
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  >
                    Add Category
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Category Modal */}
      <EditCategories
        categoryId={selectedCategoryId}
        onSuccess={handleEditSuccess}
      />
      <DeleteModal />
    </div>
  );
};

export default CategoryList;
