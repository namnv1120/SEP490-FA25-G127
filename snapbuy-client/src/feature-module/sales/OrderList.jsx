import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PrimeDataTable from "../../components/data-table";
import {
  closeIcon,
  excel,
  pdf,
  qrCodeImage,
  scanners,
  stockImg02,
  stockImg03,
  stockImg05,
} from "../../utils/imagepath";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import TableTopHead from "../../components/table-top-head";
import CommonSelect from "../../components/select/common-select";

const OrderList = () => {
  // Main data state
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  
  // Filter states
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedSortDate, setSelectedSortDate] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);
  const [referenceFilter, setReferenceFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Date states for modals
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(new Date());

  // Form states for Add/Edit modals
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedStatusUpdate, setSelectedStatusUpdate] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [productCode, setProductCode] = useState("");
  const [products, setProducts] = useState([]);
  const [orderTax, setOrderTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState("");

  // Payment modal states
  const [paymentReference, setPaymentReference] = useState("");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [payingAmount, setPayingAmount] = useState(0);
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Fetch sales list
  const fetchSalesList = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: rows,
        search: searchText || undefined,
        customerName: selectedCustomerName || undefined,
        status: selectedStatus || undefined,
        paymentStatus: selectedPaymentStatus || undefined,
        reference: referenceFilter || undefined,
        sortBy: selectedSortDate || undefined
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      const data = await salesService.getAll(params);
      
      setSalesList(data.items || data.data || []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch sales list");
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchText, selectedCustomerName, selectedStatus, selectedPaymentStatus, referenceFilter, selectedSortDate]);

  // Fetch sale detail
  const fetchSaleDetail = async (id) => {
    try {
      const data = await salesService.getById(id);
      setSelectedSaleDetail(data);
    } catch (err) {
      console.error("Error fetching sale detail:", err);
      alert(err.message || "Failed to load sale details");
    }
  };

  // Fetch payments for a sale
  const fetchPayments = async (id) => {
    try {
      const data = await salesService.getPayments(id);
      setPayments(data.items || data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      alert(err.message || "Failed to load payments");
    }
  };

  // Handle view sale details
  const handleViewDetails = (id) => {
    setSelectedItemId(id);
    fetchSaleDetail(id);
  };

  // Handle show payments
  const handleShowPayments = (id) => {
    setSelectedItemId(id);
    fetchPayments(id);
  };

  // Handle create payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      alert("No sale selected");
      return;
    }

    try {
      const paymentData = {
        date: date3.toISOString(),
        reference: paymentReference,
        receivedAmount: parseFloat(receivedAmount),
        payingAmount: parseFloat(payingAmount),
        paymentType: selectedPaymentType,
        description: paymentDescription
      };

      await salesService.createPayment(selectedItemId, paymentData);
      
      alert("Payment created successfully");
      
      // Refresh payments list
      fetchPayments(selectedItemId);
      
      // Refresh sales list
      fetchSalesList();
      
      // Close modal
      const modalElement = document.getElementById('createpayment');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      // Reset form
      resetPaymentForm();
    } catch (err) {
      console.error("Error creating payment:", err);
      alert(err.message || "Failed to create payment");
    }
  };

  // Handle update payment
  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    
    if (!selectedItemId || !selectedPaymentId) {
      alert("No payment selected");
      return;
    }

    try {
      const paymentData = {
        date: date3.toISOString(),
        reference: paymentReference,
        receivedAmount: parseFloat(receivedAmount),
        payingAmount: parseFloat(payingAmount),
        paymentType: selectedPaymentType,
        description: paymentDescription
      };

      await salesService.updatePayment(selectedItemId, selectedPaymentId, paymentData);
      
      alert("Payment updated successfully");
      
      // Refresh payments list
      fetchPayments(selectedItemId);
      
      // Close modal
      const modalElement = document.getElementById('editpayment');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      // Reset form
      resetPaymentForm();
    } catch (err) {
      console.error("Error updating payment:", err);
      alert(err.message || "Failed to update payment");
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      await salesService.deletePayment(selectedItemId, paymentId);
      alert("Payment deleted successfully");
      fetchPayments(selectedItemId);
      fetchSalesList();
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert(err.message || "Failed to delete payment");
    }
  };

  // Handle edit payment click
  const handleEditPayment = (payment) => {
    setSelectedPaymentId(payment.id);
    setPaymentReference(payment.reference);
    setReceivedAmount(payment.amount);
    setPayingAmount(payment.amount);
    setSelectedPaymentType(payment.paidBy);
    setPaymentDescription(payment.description || "");
    setDate3(new Date(payment.date));
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentReference("");
    setReceivedAmount(0);
    setPayingAmount(0);
    setSelectedPaymentType(null);
    setPaymentDescription("");
    setDate3(new Date());
    setSelectedPaymentId(null);
  };

  // Handle delete sale
  const handleDeleteSale = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    try {
      await salesService.delete(id);
      alert("Sale deleted successfully");
      fetchSalesList();
    } catch (err) {
      console.error("Error deleting sale:", err);
      alert(err.message || "Failed to delete sale");
    }
  };

  // Toggle filter visibility
  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Handle filter search
  const handleFilterSearch = () => {
    setCurrentPage(1);
    fetchSalesList();
  };

  // Calculate totals
  const calculateGrandTotal = () => {
    const productsTotal = products.reduce((sum, product) => {
      const qty = parseFloat(product.qty) || 0;
      const price = parseFloat(product.price || product.purchasePrice) || 0;
      const discount = parseFloat(product.discount) || 0;
      const tax = parseFloat(product.tax) || 0;
      
      const subtotal = (qty * price) - discount;
      const taxAmount = (subtotal * tax) / 100;
      
      return sum + subtotal + taxAmount;
    }, 0);
    
    const taxAmount = parseFloat(orderTax) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const shippingAmount = parseFloat(shipping) || 0;
    
    return productsTotal + taxAmount - discountAmount + shippingAmount;
  };

  // Handle add product
  const handleAddProduct = async () => {
    if (!productCode.trim()) {
      alert("Please enter a product code");
      return;
    }
    
    try {
      const product = await salesService.getProductByCode(productCode);
      
      setProducts([...products, {
        id: product.id || Date.now().toString(),
        name: product.name,
        qty: 1,
        price: product.price || 0,
        purchasePrice: product.purchasePrice || 0,
        discount: 0,
        tax: 0,
        taxAmount: 0,
        unitCost: product.price || 0,
        totalCost: product.price || 0,
        image: product.image
      }]);
      
      setProductCode("");
    } catch (err) {
      console.error("Error adding product:", err);
      // Fallback: add dummy product
      setProducts([...products, {
        id: Date.now().toString(),
        name: productCode,
        qty: 1,
        price: 0,
        purchasePrice: 0,
        discount: 0,
        tax: 0,
        taxAmount: 0,
        unitCost: 0,
        totalCost: 0
      }]);
      setProductCode("");
    }
  };



  // Handle product quantity change
  const handleProductQtyChange = (productId, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const qty = parseFloat(value) || 0;
        const price = parseFloat(p.price || p.purchasePrice) || 0;
        const discount = parseFloat(p.discount) || 0;
        const tax = parseFloat(p.tax) || 0;
        
        const subtotal = (qty * price) - discount;
        const taxAmount = (subtotal * tax) / 100;
        const totalCost = subtotal + taxAmount;
        
        return { ...p, qty, taxAmount, totalCost };
      }
      return p;
    }));
  };

  // Fetch data on mount
  useEffect(() => {
    fetchSalesList();
  }, [fetchSalesList]);

  // Filter data locally
  const filteredData = salesList.filter((entry) => {
    if (!searchText) return true;
    return Object.keys(entry).some((key) => {
      return String(entry[key])
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
  });

  // Select options
  const oldandlatestvalue = [
    { value: "Sort by Date", label: "Sort by Date" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  const customername = [
    { value: "Choose Customer Name", label: "Choose Customer Name" },
    { value: "Macbook pro", label: "Macbook pro" },
    { value: "Orange", label: "Orange" },
  ];

  const status = [
    { value: "Choose Status", label: "Choose Status" },
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
  ];

  const paymentstatus = [
    { value: "Choose Payment Status", label: "Choose Payment Status" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Partial", label: "Partial" },
  ];

  const customer = [
    { value: "Choose Customer", label: "Choose Customer" },
    { value: "Customer Name", label: "Customer Name" },
  ];

  const suppliername = [
    { value: "Supplier", label: "Supplier" },
    { value: "Supplier Name", label: "Supplier Name" },
  ];

  const statusupdate = [
    { value: "Choose", label: "Choose" },
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
  ];

  const paymenttype = [
    { value: "Choose", label: "Choose" },
    { value: "Cash", label: "Cash" },
    { value: "Online", label: "Online" },
  ];

  // Table columns
  const columns = [
    {
      header: "CustomerName",
      field: "customerName",
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
      body: (text) => (
        <span
          className={`badge ${
            text?.status === "Completed" ? "badge-bgsuccess" : "badge-bgdanger"
          }`}
        >
          {text?.status}
        </span>
      ),
    },
    {
      header: "GrandTotal",
      field: "grandTotal",
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
      header: "PaymentStatus",
      field: "paymentStatus",
      body: (text) => {
        return (
          <span
            className={`badge ${
              text?.paymentStatus === "Paid"
                ? "badge-linesuccess"
                : "badge-linedanger"
            }`}
          >
            {text?.paymentStatus}
          </span>
        );
      },
    },
    {
      header: "Biller",
      field: "biller",
    },
    {
      header: "Actions",
      field: "actions",
      key: "actions",
      body: (rowData) => (
        <div className="text-center">
          <Link
            className="action-set"
            to="#"
            data-bs-toggle="dropdown"
            aria-expanded="true"
          >
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu">
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#sales-details-new"
                onClick={() => handleViewDetails(rowData.id)}
              >
                <i className="ti ti-eye" />
                Sale Detail
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#edit-sales-new"
                onClick={() => setSelectedItemId(rowData.id)}
              >
                <i className="ti ti-edit" />
                Edit Sale
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#showpayment"
                onClick={() => handleShowPayments(rowData.id)}
              >
                <i className="ti ti-currency-dollar" />
                Show Payments
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#createpayment"
                onClick={() => setSelectedItemId(rowData.id)}
              >
                <i className="ti ti-circle-plus me-2" />
                Create Payment
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item">
                <i className="ti ti-download me-2" />
                Download pdf
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="dropdown-item confirm-text mb-0"
                onClick={() => handleDeleteSale(rowData.id)}
              >
                <i className="ti ti-trash" />
                Delete Sale
              </Link>
            </li>
          </ul>
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
                <h4>Sales List</h4>
                <h6>Manage Your Sales</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-sales-new"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add New Sales
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

          {/* product list */}
          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search"
                      className="form-control form-control-sm formsearch"
                      aria-controls="DataTables_Table_0"
                      value={searchText}
                      onChange={handleSearch}
                    />
                    <Link to="#" className="btn btn-searchset">
                      <i className="ti ti-search" />
                    </Link>
                  </div>
                </div>
                <div className="search-path">
                  <div className="d-flex align-items-center">
                    <div className="search-path">
                      <Link
                        to="#"
                        className={`btn btn-filter ${
                          isFilterVisible ? "setclose" : ""
                        }`}
                        id="filter_search"
                      >
                        <i
                          className="feather icon-filter filter-icon"
                          onClick={toggleFilterVisibility}
                        />
                        <span onClick={toggleFilterVisibility}>
                          <img src={closeIcon} alt="img" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="form-sort">
                  <i className="info-img feather icon-sliders" />
                  <CommonSelect
                    className="img-select"
                    options={oldandlatestvalue}
                    value={selectedSortDate}
                    onChange={(e) => setSelectedSortDate(e.value)}
                    placeholder="Newest"
                    filter={false}
                  />
                </div>
              </div>

              {/* Filter */}
              <div
                className={`card${isFilterVisible ? " visible" : ""}`}
                id="filter_inputs"
                style={{ display: isFilterVisible ? "block" : "none" }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <i className="feather icon-user info-img"></i>
                        <CommonSelect
                          className="img-select"
                          options={customername}
                          value={selectedCustomerName}
                          onChange={(e) => setSelectedCustomerName(e.value)}
                          placeholder="Choose Customer"
                          filter={false}
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <i className="info-img feather icon-stop-circle" />
                        <CommonSelect
                          className="img-select"
                          options={status}
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.value)}
                          placeholder="Choose Status"
                          filter={false}
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <i className="info-img feather icon-file-text" />
                        <input
                          type="text"
                          placeholder="Enter Reference"
                          className="form-control"
                          value={referenceFilter}
                          onChange={(e) => setReferenceFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <i className="info-img feather icon-stop-circle" />
                        <CommonSelect
                          className="img-select"
                          options={paymentstatus}
                          value={selectedPaymentStatus}
                          onChange={(e) => setSelectedPaymentStatus(e.value)}
                          placeholder="Choose Payment Status"
                          filter={false}
                        />
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <button
                          type="button"
                          onClick={handleFilterSearch}
                          className="btn btn-filters ms-auto"
                        >
                          <i className="ti ti-search" /> Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Filter */}

              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={filteredData}
                  totalRecords={totalRecords}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </div>
          {/* /product list */}
        </div>
      </div>

      {/* MODALS START */}
      <>
        {/*add popup */}
        <div className="modal fade" id="add-sales-new">
          <div className="modal-dialog add-centered">
            <div className="modal-content">
              <div className="page-wrapper p-0 m-0">
                <div className="content p-0">
                  <div className="modal-header border-0 custom-modal-header">
                    <div className="page-title">
                      <h4> Add Sales</h4>
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
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Customer Name</label>
                              <div className="row">
                                <div className="col-lg-10 col-sm-10 col-10">
                                  <CommonSelect
                                    options={customer}
                                    value={selectedCustomer}
                                    onChange={(e) =>
                                      setSelectedCustomer(e.value)
                                    }
                                    placeholder="Choose Customer"
                                    filter={false}
                                  />
                                </div>
                                <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                  <div className="add-icon">
                                    <Link to="#" className="choose-add">
                                      <i className="feather icon-plus-circle plus" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Date</label>
                              <div className="input-groupicon calender-input">
                                <i className="feather icon-calendar info-img" />
                                <CommonDatePicker
                                  value={date1}
                                  onChange={setDate1}
                                  className="w-100"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Supplier</label>
                              <CommonSelect
                                options={suppliername}
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.value)}
                                placeholder="Choose Supplier"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Product Name</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  placeholder="Please type product code and select"
                                  value={productCode}
                                  onChange={(e) => setProductCode(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddProduct();
                                    }
                                  }}
                                />
                                <div className="addonset" onClick={handleAddProduct} style={{cursor: 'pointer'}}>
                                  <img src={qrCodeImage} alt="img" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive no-pagination">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Purchase Price($)</th>
                                <th>Discount($)</th>
                                <th>Tax(%)</th>
                                <th>Tax Amount($)</th>
                                <th>Unit Cost($)</th>
                                <th>Total Cost($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="text-center">No products added</td>
                                </tr>
                              ) : (
                                products.map((product) => (
                                  <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>
                                      <input
                                        type="number"
                                        value={product.qty}
                                        onChange={(e) => handleProductQtyChange(product.id, e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{width: '80px'}}
                                      />
                                    </td>
                                    <td>{product.price || product.purchasePrice}</td>
                                    <td>{product.discount}</td>
                                    <td>{product.tax}</td>
                                    <td>{product.taxAmount?.toFixed(2)}</td>
                                    <td>{product.unitCost}</td>
                                    <td>{product.totalCost?.toFixed(2)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 ms-auto">
                            <div className="total-order w-100 max-widthauto m-auto mb-4">
                              <ul>
                                <li>
                                  <h4>Order Tax</h4>
                                  <h5>$ {parseFloat(orderTax || 0).toFixed(2)}</h5>
                                </li>
                                <li>
                                  <h4>Discount</h4>
                                  <h5>$ {parseFloat(discount || 0).toFixed(2)}</h5>
                                </li>
                                <li>
                                  <h4>Shipping</h4>
                                  <h5>$ {parseFloat(shipping || 0).toFixed(2)}</h5>
                                </li>
                                <li>
                                  <h4>Grand Total</h4>
                                  <h5>$ {calculateGrandTotal().toFixed(2)}</h5>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Order Tax</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  value={orderTax}
                                  onChange={(e) => setOrderTax(e.target.value)}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Discount</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  value={discount}
                                  onChange={(e) => setDiscount(e.target.value)}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Shipping</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  value={shipping}
                                  onChange={(e) => setShipping(e.target.value)}
                                  className="p-2"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks mb-5">
                              <label>Status</label>
                              <CommonSelect
                                options={statusupdate}
                                value={selectedStatusUpdate}
                                onChange={(e) =>
                                  setSelectedStatusUpdate(e.value)
                                }
                                placeholder="Status"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 text-end">
                            <button
                              type="button"
                              className="btn btn-cancel add-cancel me-3"
                              data-bs-dismiss="modal"
                            >
                              Cancel
                            </button>
                            <Link to="#" className="btn btn-submit add-sale">
                              Submit
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /add popup */}

        {/* details popup */}
        <div className="modal fade" id="sales-details-new">
          <div className="modal-dialog sales-details-modal">
            <div className="modal-content">
              <div className="page-wrapper details-blk">
                <div className="content p-0">
                  <div className="page-header p-4 mb-0">
                    <div className="add-item d-flex">
                      <div className="page-title modal-datail">
                        <h4>Sales Detail : {selectedSaleDetail?.reference || 'SL0101'}</h4>
                      </div>
                      <div className="page-btn">
                        <Link
                          to="#"
                          className="btn btn-added"
                          data-bs-dismiss="modal"
                        >
                          <i className="ti ti-circle-plus me-1"></i>
                          Add New Sales
                        </Link>
                      </div>
                    </div>
                    <ul className="table-top-head">
                      <li>
                        <Link
                          to="#"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Edit"
                        >
                          <i className="ti ti-edit sales-action" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Pdf"
                        >
                          <img src={pdf} alt="img" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Excel"
                        >
                          <img src={excel} alt="img" />
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Print"
                        >
                          <i className="ti ti-printer" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="invoice-box table-height">
                          <div className="sales-details-items d-flex">
                            <div className="details-item">
                              <h6>Customer Info</h6>
                              <p>
                                {selectedSaleDetail?.customerName || 'walk-in-customer'}
                                <br />
                                {selectedSaleDetail?.customerEmail || 'walk-in-customer@example.com'}
                                <br />
                                {selectedSaleDetail?.customerPhone || '123456780'}
                                <br />
                                {selectedSaleDetail?.customerAddress || 'N45 , Dhaka'}
                              </p>
                            </div>
                            <div className="details-item">
                              <h6>Company Info</h6>
                              <p>
                                DGT
                                <br />
                                admin@example.com
                                <br />
                                6315996770
                                <br />
                                3618 Abia Martin Drive
                              </p>
                            </div>
                            <div className="details-item">
                              <h6>Invoice Info</h6>
                              <p>
                                Reference
                                <br />
                                Payment Status
                                <br />
                                Status
                              </p>
                            </div>
                            <div className="details-item">
                              <h5>
                                <span>{selectedSaleDetail?.reference || 'SL0101'}</span>
                                {selectedSaleDetail?.paymentStatus || 'Paid'}
                                <br /> {selectedSaleDetail?.status || 'Completed'}
                              </h5>
                            </div>
                          </div>
                          <h5 className="order-text">Order Summary</h5>
                          <div className="table-responsive no-pagination">
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Qty</th>
                                  <th>Purchase Price($)</th>
                                  <th>Discount($)</th>
                                  <th>Tax(%)</th>
                                  <th>Tax Amount($)</th>
                                  <th>Unit Cost($)</th>
                                  <th>Total Cost($)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedSaleDetail?.products?.map((product, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="productimgname">
                                        <Link
                                          to="#"
                                          className="product-img stock-img"
                                        >
                                          <img src={product.image || stockImg02} alt="product" />
                                        </Link>
                                        <Link to="#">{product.name}</Link>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="product-quantity">
                                        <span className="quantity-btn">
                                          +
                                          <i className="feather icon-plus-circle" />
                                        </span>
                                        <input
                                          type="text"
                                          className="quntity-input"
                                          value={product.qty}
                                          readOnly
                                        />
                                        <span className="quantity-btn">
                                          <i className="feather icon-minus-circle" />
                                        </span>
                                      </div>
                                    </td>
                                    <td>{product.price}</td>
                                    <td>{product.discount}</td>
                                    <td>{product.tax}</td>
                                    <td>{product.taxAmount}</td>
                                    <td>{product.unitCost}</td>
                                    <td>{product.totalCost}</td>
                                  </tr>
                                )) || (
                                  <>
                                    <tr>
                                      <td>
                                        <div className="productimgname">
                                          <Link
                                            to="#"
                                            className="product-img stock-img"
                                          >
                                            <img src={stockImg02} alt="product" />
                                          </Link>
                                          <Link to="#">Nike Jordan</Link>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="product-quantity">
                                          <span className="quantity-btn">
                                            +
                                            <i className="feather icon-plus-circle" />
                                          </span>
                                          <input
                                            type="text"
                                            className="quntity-input"
                                            defaultValue={2}
                                          />
                                          <span className="quantity-btn">
                                            <i className="feather icon-minus-circle" />
                                          </span>
                                        </div>
                                      </td>
                                      <td>2000</td>
                                      <td>500</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>1500</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <div className="productimgname">
                                          <Link
                                            to="#"
                                            className="product-img stock-img"
                                          >
                                            <img src={stockImg03} alt="product" />
                                          </Link>
                                          <Link to="#">Apple Series 5 Watch</Link>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="product-quantity">
                                          <span className="quantity-btn">
                                            +
                                            <i className="feather icon-plus-circle" />
                                          </span>
                                          <input
                                            type="text"
                                            className="quntity-input"
                                            defaultValue={2}
                                          />
                                          <span className="quantity-btn">
                                            <i className="feather icon-minus-circle" />
                                          </span>
                                        </div>
                                      </td>
                                      <td>3000</td>
                                      <td>400</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>1700</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <div className="productimgname">
                                          <Link
                                            to="#"
                                            className="product-img stock-img"
                                          >
                                            <img src={stockImg05} alt="product" />
                                          </Link>
                                          <Link to="#">Lobar Handy</Link>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="product-quantity">
                                          <span className="quantity-btn">
                                            +
                                            <i className="feather icon-plus-circle" />
                                          </span>
                                          <input
                                            type="text"
                                            className="quntity-input"
                                            defaultValue={2}
                                          />
                                          <span className="quantity-btn">
                                            <i className="feather icon-minus-circle" />
                                          </span>
                                        </div>
                                      </td>
                                      <td>2500</td>
                                      <td>500</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>0.00</td>
                                      <td>2000</td>
                                    </tr>
                                  </>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="row">
                          <div className="row">
                            <div className="col-lg-6 ms-auto">
                              <div className="total-order w-100 max-widthauto m-auto mb-4">
                                <ul>
                                  <li>
                                    <h4>Order Tax</h4>
                                    <h5>$ {selectedSaleDetail?.orderTax || '0.00'}</h5>
                                  </li>
                                  <li>
                                    <h4>Discount</h4>
                                    <h5>$ {selectedSaleDetail?.discount || '0.00'}</h5>
                                  </li>
                                  <li>
                                    <h4>Grand Total</h4>
                                    <h5>$ {selectedSaleDetail?.grandTotal || '5200.00'}</h5>
                                  </li>
                                  <li>
                                    <h4>Paid</h4>
                                    <h5>$ {selectedSaleDetail?.paid || '5200.00'}</h5>
                                  </li>
                                  <li>
                                    <h4>Due</h4>
                                    <h5>$ {selectedSaleDetail?.due || '0.00'}</h5>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /details popup */}

        {/* edit popup */}
        <div className="modal fade" id="edit-sales-new">
          <div className="modal-dialog edit-sales-modal">
            <div className="modal-content">
              <div className="page-wrapper p-0 m-0">
                <div className="content p-0">
                  <div className="page-header p-4 mb-0">
                    <div className="add-item new-sale-items d-flex">
                      <div className="page-title">
                        <h4>Edit Sales</h4>
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
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Customer</label>
                              <div className="row">
                                <div className="col-lg-10 col-sm-10 col-10">
                                  <CommonSelect
                                    options={customer}
                                    value={selectedCustomer}
                                    onChange={(e) =>
                                      setSelectedCustomer(e.value)
                                    }
                                    placeholder="Choose Customer"
                                    filter={false}
                                  />
                                </div>
                                <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                  <div className="add-icon">
                                    <Link to="#" className="choose-add">
                                      <i className="feather icon-plus-circle plus" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Purchase Date</label>
                              <div className="input-groupicon calender-input">
                                <i className="feather icon-calendar info-img" />
                                <CommonDatePicker
                                  value={date2}
                                  onChange={setDate2}
                                  className="w-100"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Supplier</label>
                              <CommonSelect
                                options={suppliername}
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.value)}
                                placeholder="Choose Supplier"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Product Name</label>
                              <div className="input-groupicon select-code">
                                <input
                                  type="text"
                                  placeholder="Please type product code and select"
                                />
                                <div className="addonset">
                                  <img src={scanners} alt="img" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive no-pagination">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Purchase Price($)</th>
                                <th>Discount($)</th>
                                <th>Tax(%)</th>
                                <th>Tax Amount($)</th>
                                <th>Unit Cost($)</th>
                                <th>Total Cost($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <img src={stockImg02} alt="product" />
                                    </Link>
                                    <Link to="#">Nike Jordan</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <i className="feather icon-plus-circle" />
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                      <i className="feather icon-minus-circle" />
                                    </span>
                                  </div>
                                </td>
                                <td>2000</td>
                                <td>500</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>1500</td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <img src={stockImg03} alt="product" />
                                    </Link>
                                    <Link to="#">Apple Series 5 Watch</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <i className="feather icon-plus-circle" />
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                      <i className="feather icon-minus-circle" />
                                    </span>
                                  </div>
                                </td>
                                <td>3000</td>
                                <td>400</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>1700</td>
                              </tr>
                              <tr>
                                <td>
                                  <div className="productimgname">
                                    <Link
                                      to="#"
                                      className="product-img stock-img"
                                    >
                                      <img src={stockImg05} alt="product" />
                                    </Link>
                                    <Link to="#">Lobar Handy</Link>
                                  </div>
                                </td>
                                <td>
                                  <div className="product-quantity">
                                    <span className="quantity-btn">
                                      +
                                      <i className="feather icon-plus-circle" />
                                    </span>
                                    <input
                                      type="text"
                                      className="quntity-input"
                                      defaultValue={2}
                                    />
                                    <span className="quantity-btn">
                                      <i className="feather icon-minus-circle" />
                                    </span>
                                  </div>
                                </td>
                                <td>2500</td>
                                <td>500</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>2000</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 ms-auto">
                            <div className="total-order w-100 max-widthauto m-auto mb-4">
                              <ul>
                                <li>
                                  <h4>Order Tax</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Discount</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Shipping</h4>
                                  <h5>$ 0.00</h5>
                                </li>
                                <li>
                                  <h4>Grand Total</h4>
                                  <h5>$5200.00</h5>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Order Tax</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={"0"} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Discount</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={"0"} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks">
                              <label>Shipping</label>
                              <div className="input-groupicon select-code">
                                <input type="text" placeholder={"0"} />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="input-blocks mb-5">
                              <label>Status</label>
                              <CommonSelect
                                options={statusupdate}
                                value={selectedStatusUpdate}
                                onChange={(e) =>
                                  setSelectedStatusUpdate(e.value)
                                }
                                placeholder="Status"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12">
                            <div className="input-blocks">
                              <label>Notes</label>
                              <textarea
                                className="form-control"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="col-lg-12 text-end">
                            <button
                              type="button"
                              className="btn btn-cancel add-cancel me-3"
                              data-bs-dismiss="modal"
                            >
                              Cancel
                            </button>
                            <Link to="#" className="btn btn-submit add-sale">
                              Submit
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /edit popup */}

        {/* show payment Modal */}
        <div
          className="modal fade"
          id="showpayment"
          tabIndex={-1}
          aria-labelledby="showpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header border-0 custom-modal-header">
                    <div className="page-title">
                      <h4>Show Payments</h4>
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
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="modal-body-table total-orders">
                          <div className="table-responsive">
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Reference</th>
                                  <th>Amount</th>
                                  <th>Paid By</th>
                                  <th className="no-sort">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {payments.length === 0 ? (
                                  <tr>
                                    <td colSpan="5" className="text-center">No payments found</td>
                                  </tr>
                                ) : (
                                  payments.map((payment) => (
                                    <tr key={payment.id}>
                                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                                      <td>{payment.reference}</td>
                                      <td>${payment.amount}</td>
                                      <td>{payment.paidBy}</td>
                                      <td className="action-table-data">
                                        <div className="edit-delete-action">
                                          <Link className="me-3 p-2" to="#">
                                            <i className="ti ti-printer" />
                                          </Link>
                                          <Link
                                            className="me-3 p-2"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editpayment"
                                            onClick={() => handleEditPayment(payment)}
                                          >
                                            <i className="ti ti-edit" />
                                          </Link>
                                          <Link 
                                            className="confirm-text p-2" 
                                            to="#"
                                            onClick={() => handleDeletePayment(payment.id)}
                                          >
                                            <i className="ti ti-trash" />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* show payment Modal */}

        {/* Create payment Modal */}
        <div
          className="modal fade"
          id="createpayment"
          tabIndex={-1}
          aria-labelledby="createpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Create Payments</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={resetPaymentForm}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form onSubmit={handleCreatePayment}>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>Date</label>
                        <div className="input-groupicon calender-input ">
                          <i className="feather icon-calendar info-img" />
                          <CommonDatePicker
                            value={date3}
                            onChange={setDate3}
                            className="w-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Reference</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Received Amount</label>
                        <div className="input-groupicon calender-input">
                          <i className="feather icon-dollar-sign info-img" />
                          <input 
                            type="number" 
                            value={receivedAmount}
                            onChange={(e) => setReceivedAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Paying Amount</label>
                        <div className="input-groupicon calender-input">
                          <i className="feather icon-dollar-sign info-img" />
                          <input 
                            type="number"
                            value={payingAmount}
                            onChange={(e) => setPayingAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Payment type</label>
                        <CommonSelect
                          options={paymenttype}
                          value={selectedPaymentType}
                          onChange={(e) => setSelectedPaymentType(e.value)}
                          placeholder="Choose Payment Type"
                          filter={false}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks">
                        <label>Description</label>
                        <textarea 
                          className="form-control"
                          value={paymentDescription}
                          onChange={(e) => setPaymentDescription(e.target.value)}
                        />
                        <p>Maximum 60 Characters</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={resetPaymentForm}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Create payment Modal */}

        {/* edit payment Modal */}
        <div
          className="modal fade"
          id="editpayment"
          tabIndex={-1}
          aria-labelledby="editpayment"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Edit Payments</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={resetPaymentForm}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                <form onSubmit={handleUpdatePayment}>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>Date</label>
                        <div className="input-groupicon calender-input">
                          <i className="feather icon-calendar info-img" />
                          <CommonDatePicker
                            value={date3}
                            onChange={setDate3}
                            className="w-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Reference</label>
                        <input 
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Received Amount</label>
                        <div className="input-groupicon calender-input">
                          <i className="feather icon-dollar-sign info-img" />
                          <input 
                            type="number"
                            value={receivedAmount}
                            onChange={(e) => setReceivedAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Paying Amount</label>
                        <div className="input-groupicon calender-input">
                          <i className="feather icon-dollar-sign info-img" />
                          <input 
                            type="number"
                            value={payingAmount}
                            onChange={(e) => setPayingAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks">
                        <label>Payment type</label>
                        <CommonSelect
                          options={paymenttype}
                          value={selectedPaymentType}
                          onChange={(e) => setSelectedPaymentType(e.value)}
                          placeholder="Choose Payment Type"
                          filter={false}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="input-blocks summer-description-box transfer">
                        <label>Description</label>
                        <textarea 
                          className="form-control"
                          value={paymentDescription}
                          onChange={(e) => setPaymentDescription(e.target.value)}
                        />
                      </div>
                      <p>Maximum 60 Characters</p>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="modal-footer-btn mb-3 me-3">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={resetPaymentForm}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* edit payment Modal */}

        <div className="customizer-links" id="setdata">
          <ul className="sticky-sidebar">
            <li className="sidebar-icons">
              <Link
                to="#"
                className="navigation-add"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                data-bs-original-title="Theme"
              >
                <i className="ti ti-settings" />
              </Link>
            </li>
          </ul>
        </div>
      </>
    </div>
  );
};

export default OrderList;