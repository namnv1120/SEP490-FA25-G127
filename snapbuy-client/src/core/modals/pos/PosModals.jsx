import { useState } from "react";
import { Link } from "react-router-dom";
import TableTopHead from "../../../components/table-top-head";
import CommonSelect from "../../../components/select/common-select";

const PosModals = () => {
  const [selectedTaxType, setSelectedTaxType] = useState(null);
  const [selectedDiscountType, setSelectedDiscountType] = useState(null);
  const [selectedWeightUnit, setSelectedWeightUnit] = useState(null);
  const [selectedTaxRate, setSelectedTaxRate] = useState(null);
  const [selectedCouponCode, setSelectedCouponCode] = useState(null);
  const [selectedDiscountMode, setSelectedDiscountMode] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [input, setInput] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [orders, setOrders] = useState([]);

  const handleButtonClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleSolve = () => {
    try {
      setInput(eval(input).toString());
    } catch (error) {
      setInput("Error");
    }
  };

  const handleKeyPress = (event) => {
    if (/[0-9+\-*/%.]/.test(event.key)) {
      setInput((prev) => prev + event.key);
    } else if (event.key === "Backspace") {
      handleBackspace();
    } else if (event.key === "Enter") {
      handleSolve();
    } else if (event.key === "c") {
      handleClear();
    }
  };

  const options = {
    taxType: [
      { value: "exclusive", label: "Exclusive" },
      { value: "inclusive", label: "Inclusive" },
    ],
    discountType: [
      { value: "percentage", label: "Percentage" },
      { value: "early_payment", label: "Early payment discounts" },
    ],
    weightUnits: [
      { value: "kg", label: "Kilogram" },
      { value: "g", label: "Grams" },
    ],
    taxRates: [
      { value: "select", label: "Select" },
      { value: "no_tax", label: "No Tax" },
      { value: "10", label: "@10" },
      { value: "15", label: "@15" },
      { value: "vat", label: "VAT" },
      { value: "sltax", label: "SLTAX" },
    ],
    couponCodes: [
      { value: "select", label: "Select" },
    ],
    discountMode: [
      { value: "select", label: "Select" },
      { value: "flat", label: "Flat" },
      { value: "percentage", label: "Percentage" },
    ],
    paymentMethods: [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
    ],
    paymentTypes: [
      { value: "credit", label: "Credit Card" },
      { value: "cash", label: "Cash" },
      { value: "cheque", label: "Cheque" },
      { value: "deposit", label: "Deposit" },
      { value: "points", label: "Points" },
    ],
  };

  // Load transactions and orders from API
  // useEffect(() => {
  //   // Fetch recent transactions
  //   // Fetch orders
  // }, []);

  return (
    <>
      {/* Payment Completed */}
      <div
        className="modal fade modal-default"
        id="payment-completed"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-success text-white mb-2">
                    <i className="ti ti-check" />
                  </div>
                  <h3 className="mb-2">Payment Completed</h3>
                  <p className="mb-3">
                    Do you want to Print Receipt for the Completed Order
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#print-receipt"
                    >
                      Print Receipt
                      <i className="feather-arrow-right-circle icon-me-5" />
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Next Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Payment Completed */}

      {/* Print Receipt */}
      <div
        className="modal fade modal-default"
        id="print-receipt"
        aria-labelledby="print-receipt"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="icon-head text-center">
                <Link to="#">
                  <div className="logo-placeholder">Logo</div>
                </Link>
              </div>
              <div className="text-center info text-center">
                <h6>Company Name</h6>
                <p className="mb-0">Phone Number: -</p>
                <p className="mb-0">
                  Email: <Link to="mailto:">-</Link>
                </p>
              </div>
              <div className="tax-invoice">
                <h6 className="text-center">Tax Invoice</h6>
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="invoice-user-name">
                      <span>Name: </span>-
                    </div>
                    <div className="invoice-user-name">
                      <span>Invoice No: </span>-
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="invoice-user-name">
                      <span>Customer Id: </span>-
                    </div>
                    <div className="invoice-user-name">
                      <span>Date: </span>{new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <table className="table-borderless w-100 table-fit">
                <thead>
                  <tr>
                    <th># Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="text-center py-3">
                      No items
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}>
                      <table className="table-borderless w-100 table-fit">
                        <tbody>
                          <tr>
                            <td className="fw-bold">Sub Total :</td>
                            <td className="text-end">$0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Discount :</td>
                            <td className="text-end">-$0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Shipping :</td>
                            <td className="text-end">0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Tax :</td>
                            <td className="text-end">$0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Total Bill :</td>
                            <td className="text-end">$0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Due :</td>
                            <td className="text-end">$0.00</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Total Payable :</td>
                            <td className="text-end">$0.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="text-center invoice-bar">
                <div className="border-bottom border-dashed">
                  <p>Thank you for your business!</p>
                </div>
                <div className="barcode-placeholder py-2">Barcode</div>
                <p className="text-dark fw-bold">Sale #</p>
                <p>Thank You For Shopping With Us. Please Come Again</p>
                <Link to="#" className="btn btn-md btn-primary">
                  Print Receipt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Print Receipt */}

      {/* Products */}
      <div
        className="modal fade modal-default pos-modal"
        id="products"
        aria-labelledby="products"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h5 className="me-4">Products</h5>
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
            <div className="modal-body">
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                    <span className="badge bg-dark fs-12">
                      Order ID : #-
                    </span>
                    <p className="fs-16">Number of Products : 0</p>
                  </div>
                  <div className="product-wrap h-auto">
                    <div className="text-center py-3">
                      <p>No products in this order</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Products */}

      {/* Create Customer */}
      <div
        className="modal fade"
        id="create"
        tabIndex={-1}
        aria-labelledby="create"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Customer Name <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Create Customer */}

      {/* Hold */}
      <div
        className="modal fade modal-default pos-modal"
        id="hold-order"
        aria-labelledby="hold-order"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Hold order</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="bg-light br-10 p-4 text-center mb-3">
                  <h2 className="display-1">0.00</h2>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Order Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter order reference"
                  />
                </div>
                <p>
                  The current order will be set on hold. You can retreive this
                  order from the pending order button. Providing a reference to
                  it might help you to identify the order more quickly.
                </p>
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Hold */}

      {/* Edit Product */}
      <div
        className="modal fade modal-default pos-modal"
        id="edit-product"
        aria-labelledby="edit-product"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Product Price <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.taxType}
                        value={selectedTaxType}
                        onChange={(e) => setSelectedTaxType(e.value)}
                        placeholder="Select Tax Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Tax <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-percentage" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.discountType}
                        value={selectedDiscountType}
                        onChange={(e) => setSelectedDiscountType(e.value)}
                        placeholder="Select Discount Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Discount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Sale Unit <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.weightUnits}
                        value={selectedWeightUnit}
                        onChange={(e) => setSelectedWeightUnit(e.value)}
                        placeholder="Select Sale Unit"
                        filter={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Product */}

      {/* Delete Product */}
      <div
        className="modal fade modal-default"
        id="delete"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-danger-transparent text-danger mb-2">
                    <i className="ti ti-trash" />
                  </div>
                  <h3 className="mb-2">Are you Sure!</h3>
                  <p className="fs-16 mb-3">
                    The current order will be deleted as no payment has been
                    made so far.
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      No, Cancel
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Product */}

      {/* Reset */}
      <div
        className="modal fade modal-default"
        id="reset"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap text-center">
                <form>
                  <div className="icon-success bg-purple-transparent text-purple mb-2">
                    <i className="ti ti-transition-top" />
                  </div>
                  <h3 className="mb-2">Confirm Your Action</h3>
                  <p className="fs-16 mb-3">
                    The current order will be cleared. But not deleted if
                    it&apos;s persistent. Would you like to proceed ?
                  </p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      No, Cancel
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Yes, Proceed
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Reset */}

      {/* Recent Transactions */}
      <div
        className="modal fade pos-modal"
        id="recents"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Recent Transactions</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="tabs-sets">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="purchase-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#purchase"
                      type="button"
                      role="tab"
                    >
                      Purchase
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="payment-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#payment"
                      type="button"
                      role="tab"
                    >
                      Payment
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="return-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#return"
                      type="button"
                      role="tab"
                    >
                      Return
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="purchase"
                    role="tabpanel"
                  >
                    <div className="card table-list-card mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set">
                          <div className="search-input">
                            <Link to="#" className="btn btn-searchset">
                              <i className="ti ti-search fs-14 feather-search" />
                            </Link>
                            <div className="dataTables_filter">
                              <label>
                                <input
                                  type="search"
                                  className="form-control form-control-sm"
                                  placeholder="Search"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        <TableTopHead />
                      </div>
                      <div className="card-body">
                        <div className="custom-datatable-filter table-responsive">
                          <table className="table datatable">
                            <thead>
                              <tr>
                                <th className="no-sort">
                                  <label className="checkboxs">
                                    <input
                                      type="checkbox"
                                      className="select-all"
                                    />
                                    <span className="checkmarks" />
                                  </label>
                                </th>
                                <th>Customer</th>
                                <th>Reference</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th className="no-sort">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-4">
                                    No transactions found
                                  </td>
                                </tr>
                              ) : (
                                recentTransactions.map((transaction) => (
                                  <tr key={transaction.id}>
                                    <td>
                                      <label className="checkboxs">
                                        <input type="checkbox" />
                                        <span className="checkmarks" />
                                      </label>
                                    </td>
                                    <td>{transaction.customerName}</td>
                                    <td>{transaction.reference}</td>
                                    <td>{transaction.date}</td>
                                    <td>${transaction.amount}</td>
                                    <td className="action-table-data">
                                      <div className="edit-delete-action">
                                        <Link className="me-2 edit-icon p-2" to="#">
                                          <i className="feather icon-eye" />
                                        </Link>
                                        <Link className="me-2 p-2" to="#">
                                          <i className="feather icon-edit"></i>
                                        </Link>
                                        <Link className="p-2" to="#">
                                          <i className="feather icon-trash-2"></i>
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
                  <div className="tab-pane fade" id="payment" role="tabpanel">
                    <div className="card table-list-card mb-0">
                      <div className="card-body">
                        <div className="text-center py-4">
                          <p>No payment data available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="return" role="tabpanel">
                    <div className="card table-list-card mb-0">
                      <div className="card-body">
                        <div className="text-center py-4">
                          <p>No return data available</p>
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
      {/* /Recent Transactions */}

      {/* Orders */}
      <div
        className="modal fade pos-modal"
        id="orders"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Orders</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="tabs-sets">
                <ul className="nav nav-tabs" id="myTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="onhold-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#onhold"
                      type="button"
                      role="tab"
                    >
                      Onhold
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="unpaid-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#unpaid"
                      type="button"
                      role="tab"
                    >
                      Unpaid
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="paid-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#paid"
                      type="button"
                      role="tab"
                    >
                      Paid
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="onhold"
                    role="tabpanel"
                  >
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Order"
                      />
                    </div>
                    <div className="order-body">
                      {orders.filter(o => o.status === 'onhold').length === 0 ? (
                        <div className="text-center py-4">
                          <p>No onhold orders</p>
                        </div>
                      ) : (
                        orders.filter(o => o.status === 'onhold').map((order) => (
                          <div key={order.id} className="card bg-light mb-3">
                            <div className="card-body">
                              <span className="badge bg-dark fs-12 mb-2">
                                Order ID : #{order.id}
                              </span>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Cashier :</span> {order.cashier}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Total :</span> ${order.total}
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fs-14 fw-bold text-gray-9">Customer :</span> {order.customer}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fs-14 fw-bold text-gray-9">Date :</span> {order.date}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-3">
                                <Link to="#" className="btn btn-md btn-orange">
                                  Open Order
                                </Link>
                                <Link
                                  to="#"
                                  className="btn btn-md btn-teal"
                                  data-bs-dismiss="modal"
                                  data-bs-toggle="modal"
                                  data-bs-target="#products"
                                >
                                  View Products
                                </Link>
                                <Link to="#" className="btn btn-md btn-indigo">
                                  Print
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="tab-pane fade" id="unpaid" role="tabpanel">
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Order"
                      />
                    </div>
                    <div className="order-body">
                      <div className="text-center py-4">
                        <p>No unpaid orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="paid" role="tabpanel">
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Order"
                      />
                    </div>
                    <div className="order-body">
                      <div className="text-center py-4">
                        <p>No paid orders</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Orders */}

      {/* Scan Payment */}
      <div className="modal fade modal-default" id="scan-payment">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
              <div className="success-wrap scan-wrap text-center">
                <h5>
                  <span className="text-gray-6">Amount to Pay :</span> $0.00
                </h5>
                <div className="scan-img">
                  <div className="scan-placeholder">QR Code</div>
                </div>
                <p className="mb-3">
                  Scan your Phone or UPI App to Complete the payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Scan Payment */}

      {/* Payment Cash */}
      <div className="modal fade modal-default" id="payment-cash">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Finalize Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Received Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Paying Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="change-item mb-3">
                      <label className="form-label">Change</label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.paymentTypes}
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.value)}
                        placeholder="Select Payment Type"
                        filter={false}
                      />
                    </div>
                    <div className="quick-cash payment-content bg-light d-block mb-3">
                      <div className="d-flex align-items-center flex-wra gap-4">
                        <h5 className="text-nowrap">Quick Cash</h5>
                        <div className="d-flex align-items-center flex-wrap gap-3">
                          {[10, 20, 50, 100, 500, 1000].map((amount) => (
                            <div key={amount} className="form-check">
                              <input
                                type="radio"
                                className="btn-check"
                                name="cash"
                                id={`cash${amount}`}
                              />
                              <label className="btn btn-white" htmlFor={`cash${amount}`}>
                                {amount}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Receiver</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Sale Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Staff Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Payment Cash */}

      {/* Payment Card */}
      <div className="modal fade modal-default" id="payment-card">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Finalize Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Received Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Paying Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="change-item mb-3">
                      <label className="form-label">Change</label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dollar" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        className="w-100"
                        options={options.paymentTypes}
                        value={selectedPaymentType}
                        onChange={(e) => setSelectedPaymentType(e.value)}
                        placeholder="Select Payment Type"
                        filter={false}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Receiver</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Payment Note</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Type your message"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Payment Card */}

      {/* Calculator */}
      <div
        className="modal fade pos-modal"
        id="calculator"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body p-0" onKeyDown={handleKeyPress}>
              <div className="calculator-wrap">
                <div className="p-3">
                  <div className="d-flex align-items-center">
                    <h3>Calculator</h3>
                    <button
                      type="button"
                      className="close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div>
                    <input
                      className="input"
                      type="text"
                      placeholder="0"
                      value={input}
                      readOnly
                    />
                  </div>
                </div>
                <div className="calculator-body d-flex justify-content-between">
                  <div className="text-center">
                    <button className="btn btn-clear" onClick={handleClear}>
                      C
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("7")}
                    >
                      7
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("4")}
                    >
                      4
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("1")}
                    >
                      1
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick(",")}
                    >
                      ,
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("/")}
                    >
                      ÷
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("8")}
                    >
                      8
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("5")}
                    >
                      5
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("2")}
                    >
                      2
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("00")}
                    >
                      00
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("%")}
                    >
                      %
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("9")}
                    >
                      9
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("6")}
                    >
                      6
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick("3")}
                    >
                      3
                    </button>
                    <button
                      className="btn btn-number"
                      onClick={() => handleButtonClick(".")}
                    >
                      .
                    </button>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-clear" onClick={handleBackspace}>
                      <i className="ti ti-backspace" />
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("*")}
                    >
                      x
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("-")}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-expression"
                      onClick={() => handleButtonClick("+")}
                    >
                      +
                    </button>
                    <button className="btn btn-clear" onClick={handleSolve}>
                      =
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Calculator */}

      {/* Cash Register Details */}
      <div
        className="modal fade pos-modal"
        id="cash-register"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cash Register Details</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Cash in Hand</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Amount</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Cash Register Details */}

      {/* Today's Sale */}
      <div
        className="modal fade pos-modal"
        id="today-sale"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Today&apos;s Sale</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Total Sale Amount</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Credit Card Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Cheque Payment:</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Today's Sale */}

      {/* Today's Profit */}
      <div
        className="modal fade pos-modal"
        id="today-profit"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Today&apos;s Profit</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row justify-content-center g-3 mb-3">
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-success bg-success-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Total Sale</p>
                    <h3 className="text-success">$0.00</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-danger bg-danger-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Expense</p>
                    <h3 className="text-danger">$0.00</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-info bg-info-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Total Profit</p>
                    <h3 className="text-info">$0.00</h3>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Product Revenue</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Product Cost</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td>Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$0.00</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Profit
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $0.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-primary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Today's Profit */}
    </>
  );
};

export default PosModals;

