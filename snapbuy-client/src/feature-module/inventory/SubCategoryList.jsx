import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllCategories } from "../../services/CategoryService";
import EditSubcategories from "./EditSubCategory";

const SubCategories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);

  // State cho API data
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function để refresh danh sách sau khi edit
  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger reload
    setSelectedSubcategoryId(null);
  };

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllCategories();

        // Tách parent categories và sub categories
        const parents = data.filter(
          (cat) => cat.parentCategoryId === null ||
            cat.parent_category_id === null ||
            !cat.parentCategoryId
        );

        // Filter chỉ lấy sub categories (có parent_category_id)
        const children = data.filter(
          (cat) => cat.parentCategoryId !== null &&
            cat.parentCategoryId !== undefined &&
            cat.parentCategoryId !== '' ||
            (cat.parent_category_id !== null &&
              cat.parent_category_id !== undefined &&
              cat.parent_category_id !== '')
        );

        // Tạo map để lookup parent name
        const parentMap = {};
        parents.forEach(parent => {
          const id = parent.id || parent.categoryId || parent.category_id;
          parentMap[id] = parent.categoryName || parent.category_name || parent.name;
        });

        // Transform sub categories data
        const transformedData = children.map((subCat) => {
          const parentId = subCat.parentCategoryId || subCat.parent_category_id;
          const parentName = parentMap[parentId] || 'N/A';

          return {
            id: subCat.id || subCat.categoryId || subCat.category_id,
            subcategory: subCat.categoryName || subCat.category_name || subCat.name,
            parentcategory: parentName,
            description: subCat.description || '',
            createdon: subCat.created_date || subCat.createdDate
              ? new Date(subCat.created_date || subCat.createdDate).toLocaleDateString('vi-VN')
              : new Date().toLocaleDateString('vi-VN'),
            updatedon: subCat.updatedDate || subCat.updatedDate
              ? new Date(subCat.updatedDate || subCat.updatedDate).toLocaleDateString('vi-VN')
              : new Date().toLocaleDateString('vi-VN'),
            status: (subCat.active === 1 || subCat.active === true) ? "Active" : "Inactive",
          };
        });

        setSubCategories(transformedData);
        setParentCategories(parents);
        setTotalRecords(transformedData.length);
      } catch (err) {
        console.error("Error fetching sub categories:", err);
        setError(err.message || "Failed to load sub categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshKey]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Filter data based on search query
  const filteredData = searchQuery
    ? subCategories.filter((cat) =>
      (cat?.subcategory || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat?.parentcategory || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : subCategories;


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
      field: "subcategory",
      header: "Sub Category",
      key: "subcategory",
      sortable: true,
    },
    {
      field: "parentcategory",
      header: "Parent Category",
      key: "parentcategory",
      sortable: true,
    },
    {
      field: "description",
      header: "Description",
      key: "description",
      sortable: true,
    },
    {
      field: "createdon",
      header: "Created On",
      key: "createdon",
      sortable: true,
    },
    {
      field: "updatedon",
      header: "Updated On",
      key: "updatedon",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      key: "status",
      sortable: true,
      body: (rowData) => (
        <span className={`badge ${rowData.status === 'Active' ? 'bg-success' : 'bg-danger'} fw-medium fs-10`}>
          {rowData.status}
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
            data-bs-target="#edit-category"
            onClick={() => setSelectedSubcategoryId(rowData.id)}
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
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Sub Categories</h4>
              <h6>Manage your sub categories</h6>
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
              Add Sub Category
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
                <p className="mt-2">Đang tải danh mục con...</p>
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
            {!loading && !error && subCategories.length === 0 && (
              <div className="text-center py-5">
                <i className="feather icon-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-2">Chưa có danh mục con nào</p>
                <Link
                  to="#"
                  className="btn btn-primary mt-2"
                  data-bs-toggle="modal"
                  data-bs-target="#add-category"
                >
                  Thêm danh mục con đầu tiên
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <CommonFooter />

      {/* Add Sub Category Modal */}
      <div className="modal fade" id="add-category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Sub Category</h4>
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
                    Parent Category<span className="text-danger ms-1">*</span>
                  </label>
                  <select className="form-control">
                    <option value="">Choose Parent Category</option>
                    {parentCategories.map((parent) => (
                      <option
                        key={parent.id || parent.categoryId}
                        value={parent.id || parent.categoryId}
                      >
                        {parent.categoryName || parent.category_name || parent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Sub Category Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3"></textarea>
                </div>
                <div className="mb-0">
                  <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                    <span className="status-label">
                      Status<span className="text-danger ms-1">*</span>
                    </span>
                    <input
                      type="checkbox"
                      id="subcategory-status"
                      className="check"
                      defaultChecked
                    />
                    <label htmlFor="subcategory-status" className="checktoggle" />
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
                Add Sub Category
              </Link>
            </div>
          </div>

        </div>
      </div>
      <EditSubcategories
        subcategoryId={selectedSubcategoryId}
        onSuccess={handleEditSuccess}
      />
      <DeleteModal />
    </div>
  );
};

export default SubCategories;
