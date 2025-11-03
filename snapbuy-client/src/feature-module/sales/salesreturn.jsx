import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import EditSalesRetuens from "../../core/modals/sales/editsalesretuens";
import AddSalesReturns from "../../core/modals/sales/addsalesreturns";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { salesReturnService } from "../../services/salesReturnService";

const SalesReturn = () => {
  // State management
  const [salesReturns, setSalesReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    customer: null,
    status: null,
    paymentStatus: null,
    sortBy: "last7days"
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Fetch sales returns data
  const fetchSalesReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== null)
        )
      };
      
      const data = await salesReturnService.getAll(params);
      
      setSalesReturns(data.items || data.data || data);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / itemsPerPage));
      setTotalItems(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch sales returns");
      console.error("Error fetching sales returns:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Fetch customers for filter
  const fetchCustomers = async () => {
    try {
      const data = await salesReturnService.getCustomers();
      setCustomers(data.items || data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Delete single sales return
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales return?")) {
      return;
    }

    try {
      await salesReturnService.delete(id);
      
      alert("Sales return deleted successfully");
      fetchSalesReturns();
      setSelectedItems(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error("Error deleting sales return:", err);
      alert(err.message || "Failed to delete sales return");
    }
  };

  // Bulk delete selected items
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert("Please select items to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }

    try {
      await salesReturnService.bulkDelete(selectedItems);
      
      alert("Sales returns deleted successfully");
      fetchSalesReturns();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert(err.message || "Failed to delete sales returns");
    }
  };

  // Handle edit button click
  const handleEdit = (id) => {
    setSelectedItemId(id);
  };

  // Handle checkbox selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(salesReturns.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  // Handle export to PDF
  const handleExportPDF = async () => {
    try {
      await salesReturnService.exportToPDF(filters);
    } catch (err) {
      console.error("Error exporting to PDF:", err);
      alert("Failed to export PDF");
    }
  };

  // Handle export to Excel
  const handleExportExcel = async () => {
    try {
      await salesReturnService.exportToExcel(filters);
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("Failed to export Excel");
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchSalesReturns();
  }, [fetchSalesReturns]);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Get payment status badge class
  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      "Paid": "badge-soft-success",
      "Unpaid": "badge-soft-danger",
      "Overdue": "badge-soft-warning"
    };
    return statusMap[status] || "badge-soft-secondary";
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    return status === "Received" ? "badge-success" : "badge-cyan";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Sales Return</h4>
                <h6>Manage your returns</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Pdf"
                  onClick={handleExportPDF}
                >
                  <i className="ti ti-file-type-pdf" />
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Excel"
                  onClick={handleExportExcel}
                >
                  <i className="ti ti-file-type-xls" />
                </Link>
              </li>
              <RefreshIcon onClick={fetchSalesReturns} />
              <CollapesIcon />
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-sales-new"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Sales Return
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="ti ti-alert-circle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Product List */}
          <div className="card employee-table">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set">
                {selectedItems.length > 0 && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleBulkDelete}
                  >
                    <i className="ti ti-trash me-1"></i>
                    Delete Selected ({selectedItems.length})
                  </button>
                )}
              </div>
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                {/* Customer Filter */}
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    {filters.customer || "Customer"}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("customer", null)}
                      >
                        All Customers
                      </Link>
                    </li>
                    {customers.map((customer) => (
                      <li key={customer.id}>
                        <Link 
                          to="#" 
                          className="dropdown-item rounded-1"
                          onClick={() => handleFilterChange("customer", customer.name)}
                        >
                          {customer.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Filter */}
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    {filters.status || "Status"}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("status", null)}
                      >
                        All Status
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("status", "Received")}
                      >
                        Received
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("status", "Pending")}
                      >
                        Pending
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Payment Status Filter */}
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    {filters.paymentStatus || "Payment Status"}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("paymentStatus", null)}
                      >
                        All Payment Status
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("paymentStatus", "Paid")}
                      >
                        Paid
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("paymentStatus", "Unpaid")}
                      >
                        Unpaid
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("paymentStatus", "Overdue")}
                      >
                        Overdue
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Sort By Filter */}
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : {filters.sortBy === "last7days" ? "Last 7 Days" : filters.sortBy}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("sortBy", "recent")}
                      >
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("sortBy", "asc")}
                      >
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("sortBy", "desc")}
                      >
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("sortBy", "lastMonth")}
                      >
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange("sortBy", "last7days")}
                      >
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="custom-datatable-filter table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading sales returns...</p>
                  </div>
                ) : (
                  <>
                    <table className="table datatable">
                      <thead className="thead-light">
                        <tr>
                          <th className="no-sort">
                            <label className="checkboxs">
                              <input 
                                type="checkbox" 
                                id="select-all"
                                checked={selectedItems.length === salesReturns.length && salesReturns.length > 0}
                                onChange={handleSelectAll}
                              />
                              <span className="checkmarks" />
                            </label>
                          </th>
                          <th>Product</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Paid</th>
                          <th>Due</th>
                          <th>Payment Status</th>
                          <th className="no-sort">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReturns.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center p-5">
                              <div className="text-muted">
                                <i className="ti ti-inbox fs-1 mb-3 d-block"></i>
                                <p>No sales returns found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          salesReturns.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <label className="checkboxs">
                                  <input 
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                  />
                                  <span className="checkmarks" />
                                </label>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <a
                                    href="javascript:void(0);"
                                    className="avatar avatar-md me-2"
                                  >
                                    <img
                                      src={item.productImage || "/src/assets/img/products/default.png"}
                                      alt={item.productName}
                                      onError={(e) => {
                                        e.target.src = "/src/assets/img/products/default.png";
                                      }}
                                    />
                                  </a>
                                  <a href="javascript:void(0);">{item.productName}</a>
                                </div>
                              </td>
                              <td>{formatDate(item.date)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <a
                                    href="javascript:void(0);"
                                    className="avatar avatar-md me-2"
                                  >
                                    <img
                                      src={item.customerAvatar || "/src/assets/img/users/default-user.jpg"}
                                      alt={item.customerName}
                                      onError={(e) => {
                                        e.target.src = "/src/assets/img/users/default-user.jpg";
                                      }}
                                    />
                                  </a>
                                  <a href="javascript:void(0);">{item.customerName}</a>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(item.status)} shadow-none`}>
                                  {item.status}
                                </span>
                              </td>
                              <td>{formatCurrency(item.total)}</td>
                              <td>{formatCurrency(item.paid)}</td>
                              <td>{formatCurrency(item.due)}</td>
                              <td>
                                <span className={`badge ${getPaymentStatusBadge(item.paymentStatus)} badge-xs shadow-none`}>
                                  <i className="ti ti-point-filled me-1" />
                                  {item.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <div className="edit-delete-action d-flex align-items-center">
                                  <a
                                    className="me-2 p-2 d-flex align-items-center border rounded"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit-sales-new"
                                    onClick={() => handleEdit(item.id)}
                                    title="Edit"
                                  >
                                    <i className="ti ti-edit" />
                                  </a>
                                  <a
                                    className="p-2 d-flex align-items-center border rounded"
                                    href="javascript:void(0);"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                  >
                                    <i className="ti ti-trash" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <nav>
                          <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                <i className="ti ti-chevron-left"></i>
                              </button>
                            </li>
                            
                            {[...Array(totalPages)].map((_, index) => {
                              const pageNumber = index + 1;
                              if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                              ) {
                                return (
                                  <li 
                                    key={pageNumber} 
                                    className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                  >
                                    <button 
                                      className="page-link"
                                      onClick={() => setCurrentPage(pageNumber)}
                                    >
                                      {pageNumber}
                                    </button>
                                  </li>
                                );
                              } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
                              ) {
                                return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                              }
                              return null;
                            })}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                              >
                                <i className="ti ti-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014-2025 © DreamsPOS. All Right Reserved</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>

      {/* Modals */}
      <AddSalesReturns onSuccess={fetchSalesReturns} />
      <EditSalesRetuens onSuccess={fetchSalesReturns} selectedItemId={selectedItemId} />
    </div>
  );
};

export default SalesReturn;