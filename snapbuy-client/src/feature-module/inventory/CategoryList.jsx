import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";

// Interfaces removed as they are TypeScript specific

const CategoryList = () => { // Removed : React.FC
  const [currentPage, setCurrentPage] = useState(1); // Removed <number>
  const [totalRecords, _setTotalRecords] = useState(5); // Removed <any>, assuming 5 is a placeholder
  const [rows, setRows] = useState(10); // Removed <number>
  const [_searchQuery, setSearchQuery] = useState(undefined); // Removed <string | undefined>

  const handleSearch = (value) => { // Removed : any
    setSearchQuery(value);
  };

  // Data fetched from Redux store
  const dataSource = useSelector(
    (state) => state.rootReducer.categotylist_data // Removed : RootState and CategoryItem[] types
  );

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
      header: "Category Slug",
      field: "categoryslug",
      key: "categoryslug",
      sortable: true,
    },
    {
      header: "Created On",
      field: "createdon",
      key: "createdon",
      sortable: true,
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => ( // Removed : CategoryItem
        // Consider dynamic class based on status if needed:
        // className={`badge ${data.status === 'Active' ? 'bg-success' : 'bg-danger'} fw-medium fs-10`}
        <span className="badge bg-success fw-medium fs-10">{data.status}</span>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (rowData) => ( // Changed _row to rowData, removed : any
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-customer" // Target for Edit modal
            // onClick={() => handleEditClick(rowData)} // Optional: Pass data on click
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal" // Target for Delete modal
             // onClick={() => handleDeleteClick(rowData.id)} // Optional: Pass ID on click
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

   // Optional: Add handlers if needed
  // const handleEditClick = (categoryData) => {
  //   console.log("Editing:", categoryData);
  //   // You might want to set state here to pass data to the EditCategoryList modal
  // };
  // const handleDeleteClick = (categoryId) => {
  //   console.log("Deleting ID:", categoryId);
  //   // You might want to set state here to pass the ID to the DeleteModal
  // };

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
                data-bs-target="#add-category" // Target for Add modal
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Category
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                 {/* Filters remain the same */}
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                        Descending {/* Corrected typo */}
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
                  data={dataSource || []} // Ensure dataSource is an array
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  // Assuming totalRecords might come from Redux state or be dataSource.length
                  totalRecords={dataSource ? dataSource.length : 0} // Use dataSource length or placeholder
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <CommonFooter />
      </div>

      {/* Add Category Modal (Assuming separate component or static HTML) */}
      {/* Ensure this modal has id="add-category" */}
      <div className="modal fade" id="add-category">
         {/* ... content of Add Category Modal ... */}
         {/* Example structure - Replace with your actual Add Category Modal */}
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Add Category</h4>
                  </div>
                  <button type="button" className="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form> {/* Add form submission logic here */}
                    <div className="mb-3">
                      <label className="form-label">Category<span className="text-danger ms-1">*</span></label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category Slug<span className="text-danger ms-1">*</span></label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">Status<span className="text-danger ms-1">*</span></span>
                        <input type="checkbox" id="add-cat-status" className="check" defaultChecked />
                        <label htmlFor="add-cat-status" className="checktoggle" />
                      </div>
                    </div>
                     {/* Footer moved inside form */}
                    <div className="modal-footer">
                        <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary fs-13 fw-medium p-2 px-3"> {/* Use button type submit */}
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
      {/* /Add Category */}

      {/* Edit Category Modal Component */}
      <EditCategoryList /> {/* Ensure this component uses id="edit-customer" or update target */}

      {/* Delete Modal Component */}
      <DeleteModal />
    </div>
  );
};

export default CategoryList;