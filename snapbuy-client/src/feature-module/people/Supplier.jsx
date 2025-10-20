import { suppliersData } from "../../core/json/suppliers-data.js";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import { editSupplier } from "../../utils/imagepath";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supplierService from "../../services/SupplierService";

const Suppliers = () => {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Fetch suppliers data
  const fetchSuppliers = async () => {
    setLoading(true);
    const result = await supplierService.getSuppliers({
      page: currentPage,
      limit: rows,
      search: searchQuery,
    });

    if (result.success) {
      setListData(result.data);
      setTotalRecords(result.total);
    } else {
      console.error(result.message);
      // Fallback to local data
      setListData(suppliersData);
      setTotalRecords(suppliersData.length);
    }
    setLoading(false);
  };

  // Load data khi component mount và khi dependencies thay đổi
  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, rows, searchQuery]);

  // Add new supplier
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await supplierService.createSupplier(formData);

    if (result.success) {
      alert(result.message);
      fetchSuppliers();
      // Close modal
      document.querySelector('#add-supplier [data-bs-dismiss="modal"]')?.click();
      e.target.reset();
      // Reset select states
      setSelectedCity("");
      setSelectedState("");
      setSelectedCountry("");
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  // Edit supplier
  const handleEditSupplier = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setLoading(true);
    const formData = new FormData(e.target);
    const result = await supplierService.updateSupplier(selectedSupplier.id, formData);

    if (result.success) {
      alert(result.message);
      fetchSuppliers();
      // Close modal
      document.querySelector('#edit-supplier [data-bs-dismiss="modal"]')?.click();
      setSelectedSupplier(null);
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  // Delete supplier
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    setLoading(true);
    const result = await supplierService.deleteSupplier(id);

    if (result.success) {
      alert(result.message);
      fetchSuppliers();
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  // Open edit modal with supplier data
  const handleEditClick = async (supplier) => {
    setSelectedSupplier(supplier);
    setSelectedCity(supplier.city || "");
    setSelectedState(supplier.state || "");
    setSelectedCountry(supplier.country || "");
  };

  const cityOptions = [
    { label: "Select", value: "" },
    { label: "Los Angles", value: "los-angles" },
    { label: "New York City", value: "new-york-city" },
    { label: "Houston", value: "houston" },
  ];

  const stateOptions = [
    { label: "Select", value: "" },
    { label: "California", value: "california" },
    { label: "New York", value: "new-york" },
    { label: "Texas", value: "texas" },
  ];

  const countryOptions = [
    { label: "Select", value: "" },
    { label: "United States", value: "united-states" },
    { label: "Canada", value: "canada" },
    { label: "Germany", value: "germany" },
  ];

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
    { header: "Code", field: "code", key: "code" },
    {
      header: "Supplier",
      field: "supplier",
      key: "supplier",
      body: (data) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md">
            <img src={data.avatar} className="img-fluid rounded-2" alt="img" />
          </Link>
          <div className="ms-2">
            <p className="text-gray-9 mb-0">
              <Link to="#">{data.supplier}</Link>
            </p>
          </div>
        </div>
      ),
    },
    { header: "Email", field: "email", key: "email" },
    { header: "Phone", field: "phone", key: "phone" },
    { header: "Country", field: "country", key: "country" },
    {
      header: "Status",
      field: "status",
      key: "status",
      body: (data) => (
        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1"></i>
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
        <div className="edit-delete-action">
          <Link className="me-2 p-2" to="#">
            <i className="feather icon-eye"></i>
          </Link>
          <Link
            className="me-2 p-2"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-supplier"
            onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2"
            to="#"
            onClick={() => handleDeleteSupplier(row.id)}
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Suppliers</h4>
                <h6>Manage your suppliers</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-supplier"
              >
                <i className="ti ti-circle-plus me-1" />
                Add Supplier
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown">
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
              </div>
            </div>
            <div className="card-body p-0">
              {loading && (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={listData}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        { <CommonFooter /> }
      </div>

      {/* Add Supplier Modal */}
      <div className="modal fade" id="add-supplier">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Supplier</h4>
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
            <form onSubmit={handleAddSupplier}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="new-employee-field">
                      <div className="profile-pic-upload mb-2">
                        <div className="profile-pic">
                          <span>
                            <i className="feather icon-plus-circle plus-down-add" />
                            Add Image
                          </span>
                        </div>
                        <div className="mb-0">
                          <div className="image-upload mb-2">
                            <input type="file" name="avatar" />
                            <div className="image-uploads">
                              <h4>Upload Image</h4>
                            </div>
                          </div>
                          <p>JPEG, PNG up to 2 MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" name="firstName" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" name="lastName" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input type="email" name="email" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input type="text" name="phone" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Address <span className="text-danger">*</span>
                      </label>
                      <input type="text" name="address" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-10 col-10">
                    <div className="mb-3">
                      <label className="form-label">
                        City <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={cityOptions}
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.value)}
                        placeholder="Select City"
                        filter={false}
                      />
                      <input type="hidden" name="city" value={selectedCity} />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-10 col-10">
                    <div className="mb-3">
                      <label className="form-label">
                        State <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={stateOptions}
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.value)}
                        placeholder="Select State"
                        filter={false}
                      />
                      <input type="hidden" name="state" value={selectedState} />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-10 col-10">
                    <div className="mb-3">
                      <label className="form-label">
                        Country <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.value)}
                        placeholder="Select Country"
                        filter={false}
                      />
                      <input type="hidden" name="country" value={selectedCountry} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Postal Code <span className="text-danger">*</span>
                      </label>
                      <input type="text" name="postalCode" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">Status</span>
                        <input
                          type="checkbox"
                          id="users5"
                          name="status"
                          className="check"
                          defaultChecked
                        />
                        <label htmlFor="users5" className="checktoggle mb-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Adding..." : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      <div className="modal fade" id="edit-supplier">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Edit Supplier</h4>
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
              <form onSubmit={handleEditSupplier}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="new-employee-field">
                        <div className="profile-pic-upload edit-pic">
                          <div className="profile-pic">
                            <span>
                              <img src={selectedSupplier?.avatar || editSupplier} alt="Img" />
                            </span>
                            <div className="close-img">
                              <i className="feather icon-x info-img" />
                            </div>
                          </div>
                          <div className="mb-0">
                            <div className="image-upload mb-0">
                              <input type="file" name="avatar" />
                              <div className="image-uploads">
                                <h4>Change Image</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control"
                          defaultValue={selectedSupplier?.firstName}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          defaultValue={selectedSupplier?.lastName}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          defaultValue={selectedSupplier?.email}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Phone <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          className="form-control"
                          defaultValue={selectedSupplier?.phone}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          defaultValue={selectedSupplier?.address}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-10 col-10">
                      <div className="mb-3">
                        <label className="form-label">
                          City <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={cityOptions}
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.value)}
                          placeholder="Select City"
                          filter={false}
                        />
                        <input type="hidden" name="city" value={selectedCity} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-10 col-10">
                      <div className="mb-3">
                        <label className="form-label">
                          State <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={stateOptions}
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.value)}
                          placeholder="Select State"
                          filter={false}
                        />
                        <input type="hidden" name="state" value={selectedState} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-10 col-10">
                      <div className="mb-3">
                        <label className="form-label">
                          Country <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={countryOptions}
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.value)}
                          placeholder="Select Country"
                          filter={false}
                        />
                        <input type="hidden" name="country" value={selectedCountry} />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Postal Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          className="form-control"
                          defaultValue={selectedSupplier?.postalCode}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-0">
                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                          <span className="status-label">Status</span>
                          <input
                            type="checkbox"
                            id="users6"
                            name="status"
                            className="check"
                            defaultChecked={selectedSupplier?.status === "active"}
                          />
                          <label htmlFor="users6" className="checktoggle mb-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal />
    </>
  );
};

export default Suppliers;