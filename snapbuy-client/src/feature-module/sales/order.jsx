import React, { useState, useEffect } from "react"; // Import useEffect
import axios from "axios"; // Import axios
import PrimeDataTable from "../../../components/data-table";
// import { onlineOrderData } from "../../../core/json/onlineOrderData"; // No longer needed for static data
import { Link } from "react-router-dom";
import OnlineorderModal from "../online-order/onlineorderModal";
import CommonFooter from "../../../components/footer/commonFooter";
import TableTopHead from "../../../components/table-top-head";
import DeleteModal from "../../../components/delete-modal";
import SearchFromApi from "../../../components/data-table/search";

const PosOrder = () => {
  // --- State for API data, loading, and errors ---
  const [dataSource, setDataSource] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState(null); // State for API errors
  // -----------------------------------------------

  const columns = [
    {
      header: "Customer Name",
      field: "customer",
      body: (rowData) => ( // Changed 'text' to 'rowData' for clarity
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            {/* Make sure 'rowData.image' exists in your API response */}
            <img src={rowData.image} alt="product" />
          </Link>
          {/* Optional chaining is good practice if data might be missing */}
          <Link to="#">{rowData?.customer}</Link>
        </div>
      ),
    },
    {
      header: "Reference",
      field: "reference",
    },
    {
      header: "Date",
      field: "date",
    },
    {
      header: "Status",
      field: "status",
      body: (rowData) => (
        <span
          className={`badge ${
            rowData?.status === "Pending"
              ? "badge-cyan"
              : rowData?.status === "Completed"
              ? "badge-success"
              : ""
          } `}
        >
          {rowData?.status}
        </span>
      ),
    },
    {
      header: "Grand Total",
      field: "total",
    },
    {
      header: "Paid",
      field: "paid",
    },
    {
      header: "Due",
      field: "due",
    },
    {
      header: "Payment Status",
      field: "paymentstatus",
      body: (rowData) => (
        <span
          className={`badge badge-xs shadow-none ${
            rowData?.paymentstatus === "Unpaid"
              ? "badge-soft-danger"
              : rowData?.paymentstatus === "Paid"
              ? "badge-soft-success"
              : "badge-soft-warning" // Assuming a default/other status
          } `}
        >
          <i className="ti ti-point-filled me-1"></i>
          {rowData?.paymentstatus}
        </span>
      ),
    },
    {
      header: "Biller",
      field: "biller",
    },
    {
      header: "",
      field: "action",
      body: (rowData) => ( // Pass rowData if actions depend on specific item data
        <>
          <Link
            className="action-set"
            to="#"
            data-bs-toggle="dropdown"
            aria-expanded="true"
          >
            <i className="fa fa-ellipsis-v" aria-hidden="true" />
          </Link>
          {/* You might pass rowData.id or other info to modal triggers if needed */}
          <ul className="dropdown-menu">
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#sales-details-new"
                // onClick={() => handleViewDetails(rowData.id)} // Example handler
              >
                <i className="feather icon-eye info-img" />
                Sale Detail
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#edit-sales-new"
                 // onClick={() => handleEditSale(rowData.id)} // Example handler
              >
                <i className="feather icon-edit info-img" />
                Edit Sale
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#showpayment"
                 // onClick={() => handleShowPayments(rowData.id)} // Example handler
              >
                <i className="feather icon-dollar-sign info-img" />
                Show Payments
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#createpayment"
                 // onClick={() => handleCreatePayment(rowData.id)} // Example handler
              >
                <i className="feather icon-plus-circle info-img" />
                Create Payment
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item" /* onClick={() => handleDownloadPdf(rowData.id)} */>
                <i className="feather icon-download info-img" />
                Download pdf
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item mb-0"
                data-bs-toggle="modal"
                data-bs-target="#delete-modal"
                 // onClick={() => handleDeleteSale(rowData.id)} // Example handler
              >
                <i className="feather icon-trash-2 info-img" />
                Delete Sale
              </Link>
            </li>
          </ul>
        </>
      ),
    },
  ];

  const [rows, setRows] = useState(10); // State for pagination/rows per page
  const [_searchQuery, setSearchQuery] = useState(undefined); // State for search
  const handleSearch = (value) => {
    setSearchQuery(value);
    // You might want to trigger a new API call here with the search query
    // fetchData(value); // Example: Refetch data with search term
  };

  // --- Function to fetch data ---
  const fetchData = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint
      // Append search query if it exists
      const url = searchTerm
        ? `/api/pos-orders?search=${searchTerm}`
        : "/api/pos-orders";
      const response = await axios.get(url);
      setDataSource(response.data); // Assuming the API returns an array of orders
      // You might need to set totalRecords for pagination based on API response
      // setTotalRecords(response.data.totalCount);
    } catch (err) {
      console.error("Error fetching POS orders:", err);
      setError("Failed to load orders. Please try again.");
      setDataSource([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };
  // -----------------------------

  // --- useEffect to fetch data on component mount ---
  useEffect(() => {
    fetchData(); // Fetch initial data when component mounts
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount
  // --------------------------------------------------

  // --- Placeholder handlers for actions (Implement actual logic) ---
  // const handleViewDetails = (id) => console.log("View Details:", id);
  // const handleEditSale = (id) => console.log("Edit Sale:", id);
  // const handleShowPayments = (id) => console.log("Show Payments:", id);
  // const handleCreatePayment = (id) => console.log("Create Payment for:", id);
  // const handleDownloadPdf = (id) => console.log("Download PDF:", id);
  // const handleDeleteSale = (id) => console.log("Delete Sale:", id);
  // -----------------------------------------------------------------


  // --- Render loading/error states ---
  if (loading) {
    return <div>Loading orders...</div>; // Or a spinner component
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  // ------------------------------------


  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>POS Orders</h4>
                <h6>Manage Your pos orders</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-sales-new"
              >
                <i className="ti ti-circle-plus me-1"></i> Add Sales
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card manage-stock">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              {/* --- Dropdowns (Keep as is, or fetch options from API too) --- */}
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                 <div className="dropdown me-2">
                   <Link
                     to="#"
                     className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                     data-bs-toggle="dropdown"
                   >
                     Customer
                   </Link>
                   <ul className="dropdown-menu  dropdown-menu-end p-3">
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Carl Evans
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Minerva Rameriz
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Robert Lamon
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Patricia Lewis
                       </Link>
                     </li>
                   </ul>
                 </div>
                 <div className="dropdown me-2">
                   <Link
                     to="#"
                     className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                     data-bs-toggle="dropdown"
                   >
                     Status {/* Corrected typo: Staus -> Status */}
                   </Link>
                   <ul className="dropdown-menu  dropdown-menu-end p-3">
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Completed
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Pending
                       </Link>
                     </li>
                   </ul>
                 </div>
                 <div className="dropdown me-2">
                   <Link
                     to="#"
                     className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                     data-bs-toggle="dropdown"
                   >
                     Payment Status
                   </Link>
                   <ul className="dropdown-menu  dropdown-menu-end p-3">
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Paid
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Unpaid
                       </Link>
                     </li>
                     <li>
                       <Link to="#" className="dropdown-item rounded-1">
                         Overdue
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
                         Descending {/* Corrected typo: Desending -> Descending */}
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
              {/* --- End Dropdowns --- */}
            </div>
            <div className="card-body">
              <div className="custom-datatable-filter table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={dataSource} // Use fetched data
                  rows={rows} // Controlled by state
                  setRows={setRows} // Function to update rows per page
                  // --- Pagination (Assuming PrimeDataTable handles it) ---
                  // You might need to adjust props based on PrimeDataTable's API
                  // If your API handles pagination, pass relevant props like:
                  // first={(currentPage - 1) * rows}
                  // totalRecords={totalRecords} // Get this from API response
                  // onPage={(e) => setCurrentPage(e.page + 1)}
                  // ------------------------------------------------------
                   currentPage={1} // These might not be needed if PrimeDataTable handles pagination internally based on rows/totalRecords
                   setCurrentPage={() => {}} // Remove if Prime handles pagination
                   totalRecords={dataSource.length} // Example if not server-side paginated
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
        <CommonFooter />
      </div>
      {/* Modals remain the same */}
      <OnlineorderModal />
      <DeleteModal />
    </div>
  );
};

export default PosOrder;