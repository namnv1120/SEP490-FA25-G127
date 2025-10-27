import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../components/select/common-select";
import { logo, scanImg } from "../../../utils/imagepath";
import {
  createCustomer,
  getCustomerByPhone,
} from "../../../services/customerService";
import orderService from "../../../services/orderService";
import ProductService from "../../../services/ProductService";

const PosModals = () => {
  const [selectedTaxType, setSelectedTaxType] = useState(null);
  const [selectedDiscountType, setSelectedDiscountType] = useState(null);
  const [selectedWeightUnit, setSelectedWeightUnit] = useState(null);
  const [selectedTaxRate, setSelectedTaxRate] = useState(null);
  const [selectedDiscountMode, setSelectedDiscountMode] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [input, setInput] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [payingAmount, setPayingAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("paid");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [matchedCustomers, setMatchedCustomers] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getAllOrders();
        setOrders(response);
      } catch (error) {
        console.error("Lỗi khi tải danh sách đơn hàng:", error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  const filteredOrders = (status) => {
    return orders.filter((order) => order.paymentStatus === status);
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await orderService.getOrderById(orderId);
      setSelectedOrder(response);
      const modal = new window.bootstrap.Modal(
        document.getElementById("print-receipt")
      );
      modal.show();
    } catch (error) {
      console.error("Lỗi khi xem đơn hàng:", error);
    }
  };

  const handleViewProducts = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      const order = await orderService.getOrderById(orderId);
      setSelectedOrder(order);
      setSelectedOrderProducts(order.items || []);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm của đơn hàng:", error);
      setSelectedOrderProducts([]);
    }
  };

  // State lưu thông tin khách hàng
  const [customer, setCustomer] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer.customerName.trim() || !customer.phone.trim()) {
      alert("Vui lòng nhập đầy đủ họ tên và số điện thoại!");
      return;
    }

    setLoading(true);
    try {
      const existing = await getCustomerByPhone(customer.phone);
      if (existing) {
        alert(`Số điện thoại ${customer.phone} đã tồn tại trong hệ thống!`);
        setLoading(false);
        return;
      }

      const newCustomer = await createCustomer(customer);
      alert("Tạo khách hàng thành công!");

      if (onCustomerCreated) onCustomerCreated(newCustomer);

      setCustomer({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo khách hàng:", error);
      alert("Không thể tạo khách hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

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

  const handleReceivedChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value === "") {
      setReceivedAmount("");
      setChangeAmount(0);
      return;
    }

    const numericValue = parseInt(value, 10);
    setReceivedAmount(numericValue);

    if (payingAmount) {
      setChangeAmount(Math.max(numericValue - parseInt(payingAmount, 10), 0));
    }
  };

  const handlePayingChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value === "") {
      setPayingAmount("");
      setChangeAmount(0);
      return;
    }

    const numericValue = parseInt(value, 10);
    setPayingAmount(numericValue);

    if (receivedAmount) {
      setChangeAmount(Math.max(parseInt(receivedAmount, 10) - numericValue, 0));
    }
  };

  const handleQuickCash = (amount) => {
    setReceivedAmount(amount);
    setChangeAmount(Math.max(amount - payingAmount, 0));
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
                  <h3 className="mb-2">Hoàn thành thanh toán</h3>
                  <p className="mb-3">Bạn muốn in hóa đơn hay đơn hàng mới?</p>
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-md btn-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#print-receipt"
                    >
                      In hóa đơn
                      <i className="feather-arrow-right-circle icon-me-5" />
                    </button>
                    <button
                      type="button"
                      data-bs-dismiss="modal"
                      className="btn btn-md btn-primary"
                    >
                      Đơn hàng mới
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
              {selectedOrder ? (
                <>
                  <div className="text-center mb-3">
                    <img src={logo} width={100} height={30} alt="Logo" />
                    <h6 className="mt-2">Hóa đơn bán hàng</h6>
                    <p>Mã đơn: #{selectedOrder.orderNumber}</p>
                    <p>
                      Ngày: {new Date(selectedOrder.orderDate).toLocaleString()}
                    </p>
                  </div>

                  <table className="table w-100">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString()}₫</td>
                          <td className="text-end">
                            {(item.price * item.quantity).toLocaleString()}₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-end mt-3">
                    <p>
                      Tổng cộng:{" "}
                      <strong>
                        {selectedOrder.totalAmount?.toLocaleString()}₫
                      </strong>
                    </p>
                    <p>
                      Trạng thái: <strong>{selectedOrder.paymentStatus}</strong>
                    </p>
                  </div>

                  <div className="text-center mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => window.print()}
                    >
                      <i className="ti ti-printer" /> In hóa đơn
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center">Không có dữ liệu đơn hàng.</p>
              )}
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
                <h5 className="me-4">Sản phẩm trong đơn hàng</h5>
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
              {selectedOrderProducts.length === 0 ? (
                <p className="text-center text-muted">
                  Không có sản phẩm trong đơn hàng này.
                </p>
              ) : (
                <div className="card bg-light mb-3">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                      <span className="badge bg-dark fs-12">
                        Mã đơn: #{selectedOrderId}
                      </span>
                      <p className="fs-16">
                        Số lượng sản phẩm: {selectedOrderProducts.length}
                      </p>
                    </div>

                    <div className="product-wrap h-auto">
                      {selectedOrderProducts.map((item) => (
                        <div
                          key={item.productId}
                          className="product-list bg-white align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center product-info">
                            <Link to="#" className="pro-img">
                              <img src={item.imageUrl} alt={item.productName} />
                            </Link>
                            <div className="info">
                              <h6>
                                <Link to="#">{item.productName}</Link>
                              </h6>
                              <p>Số lượng: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-teal fw-bold">
                            {(item.price || item.unitPrice)?.toLocaleString()}₫
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* /Products */}
      {/* Customer */}
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
              <h5 className="modal-title">Thêm khách hàng mới</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Đóng"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body pb-1">
                <div className="row">
                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Họ tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={customer.customerName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Nhập họ tên khách hàng"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={customer.address}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  <div className="col-lg-6 col-sm-12 col-12">
                    <div className="mb-3">
                      <label className="form-label">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={customer.city}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Nhập tên thành phố"
                      />
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
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-md btn-primary"
                  disabled={loading}
                  data-bs-dismiss={loading ? "" : "modal"}
                >
                  {loading ? "Đang lưu..." : "Lưu khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Customer */}
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
                        defaultValue="Red Nike Laser Show"
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
                          defaultValue={1800}
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
                          defaultValue={15}
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
                        defaultValue={15}
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
              <h5 className="modal-title">Đơn hàng</h5>
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
                      className={`nav-link ${
                        activeTab === "unpaid" ? "active" : ""
                      }`}
                      id="unpaid-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#unpaid"
                      type="button"
                      role="tab"
                      onClick={() => setActiveTab("unpaid")}
                    >
                      Chưa thanh toán
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "paid" ? "active" : ""
                      }`}
                      id="paid-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#paid"
                      type="button"
                      role="tab"
                      onClick={() => setActiveTab("paid")}
                    >
                      Đã thanh toán
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "refunded" ? "active" : ""
                      }`}
                      id="refunded-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#refunded"
                      type="button"
                      role="tab"
                      onClick={() => setActiveTab("refunded")}
                    >
                      Hoàn tiền
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {["unpaid", "paid", "refunded"].map((tabKey) => (
                    <div
                      key={tabKey}
                      className={`tab-pane fade ${
                        activeTab === tabKey ? "show active" : ""
                      }`}
                      id={tabKey}
                      role="tabpanel"
                    >
                      <div className="input-icon-start pos-search position-relative mb-3">
                        <span className="input-icon-addon">
                          <i className="ti ti-search" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tìm kiếm đơn hàng"
                        />
                      </div>

                      <div className="order-body">
                        {filteredOrders(tabKey.toUpperCase()).map((order) => (
                          <div
                            className="card bg-light mb-3"
                            key={order.orderId}
                          >
                            <div className="card-body">
                              <span
                                className={`badge fs-12 mb-2 ${
                                  tabKey === "paid"
                                    ? "bg-success"
                                    : tabKey === "unpaid"
                                    ? "bg-dark"
                                    : "bg-danger"
                                }`}
                              >
                                Mã đơn: #{order.orderNumber}
                              </span>

                              <div className="row g-3">
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fw-bold text-gray-9">
                                      Thu ngân:
                                    </span>{" "}
                                    {order.accountName || "Admin"}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fw-bold text-gray-9">
                                      Tổng tiền:
                                    </span>{" "}
                                    {order.totalAmount?.toLocaleString()}₫
                                  </p>
                                </div>
                                <div className="col-md-6">
                                  <p className="fs-15 mb-1">
                                    <span className="fw-bold text-gray-9">
                                      Khách hàng:
                                    </span>{" "}
                                    {order.customerName || "Khách lẻ"}
                                  </p>
                                  <p className="fs-15">
                                    <span className="fw-bold text-gray-9">
                                      Ngày:
                                    </span>{" "}
                                    {new Date(order.orderDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`${
                                  tabKey === "paid"
                                    ? "bg-success-transparent text-success"
                                    : tabKey === "unpaid"
                                    ? "bg-info-transparent text-info"
                                    : "bg-danger-transparent text-danger"
                                } p-1 rounded text-center my-3`}
                              >
                                <p className="fw-medium">
                                  {tabKey === "paid"
                                    ? "Đơn hàng đã được thanh toán"
                                    : tabKey === "unpaid"
                                    ? "Đơn hàng chưa được thanh toán"
                                    : "Đơn hàng đã được hoàn tiền"}
                                </p>
                              </div>

                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
                                <Link
                                  to="#"
                                  className="btn btn-md btn-teal"
                                  data-bs-dismiss="modal"
                                  data-bs-toggle="modal"
                                  data-bs-target="#products"
                                  onClick={() =>
                                    handleViewProducts(order.orderId)
                                  }
                                >
                                  Xem sản phẩm
                                </Link>

                                <Link
                                  to="#"
                                  className="btn btn-md btn-indigo"
                                  onClick={() => handleViewOrder(order.orderId)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#print-receipt"
                                >
                                  In hóa đơn
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}

                        {filteredOrders(tabKey.toUpperCase()).length === 0 && (
                          <p className="text-center text-muted mt-3">
                            Không có đơn hàng nào.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Orders */}
      {/* Scan */}
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
                  <span className="text-gray-6">Amount to Pay :</span> $150
                </h5>
                <div className="scan-img">
                  <img src={scanImg} alt="img" />
                </div>
                <p className="mb-3">
                  Scan your Phone or UPI App to Complete the payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Scan */}
      {/* Order Tax */}
      <div className="modal fade modal-default" id="order-tax">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Tax</h5>
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
                <div className="mb-3">
                  <label className="form-label">
                    Order Tax <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    className="w-100"
                    options={options.taxRates}
                    value={selectedTaxRate}
                    onChange={(e) => setSelectedTaxRate(e.value)}
                    placeholder="Select Order Tax"
                    filter={false}
                  />
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
      {/* /Order Tax */}
      {/* Discount */}
      <div className="modal fade modal-default" id="discount">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Discount </h5>
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
                <div className="mb-3">
                  <label className="form-label">
                    Order Discount Type <span className="text-danger">*</span>
                  </label>
                  <CommonSelect
                    className="w-100"
                    options={options.discountMode}
                    value={selectedDiscountMode}
                    onChange={(e) => setSelectedDiscountMode(e.value)}
                    placeholder="Select Discount Type"
                    filter={false}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Value <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
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
      {/* /Discount */}
      {/* Cash Payment */}
      <div
        className="modal fade modal-default"
        id="cash-payment"
        aria-labelledby="payment-completed"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body p-0">
              <div className="success-wrap">
                <div className="text-center">
                  <div className="icon-success bg-success text-white mb-2">
                    <i className="ti ti-check" />
                  </div>
                  <h3 className="mb-2">Congratulations, Sale Completed</h3>
                  <div className="p-2 d-flex align-items-center justify-content-center gap-2 flex-wrap mb-3">
                    <p className="fs-13 fw-medium pe-2 border-end mb-0">
                      Bill Amount : <span className="text-gray-9">$150</span>
                    </p>
                    <p className="fs-13 fw-medium pe-2 border-end mb-0">
                      Total Paid : <span className="text-gray-9">$200</span>
                    </p>
                    <p className="fs-13 fw-medium mb-0">
                      Change : <span className="text-gray-9">$50</span>
                    </p>
                  </div>
                </div>
                <div className="bg-success-transparent p-2 mb-3 br-5 border-start border-success d-flex align-items-center">
                  <span className="avatar avatar-sm bg-success rounded-circle flex-shrink-0 fs-16 me-2">
                    <i className="ti ti-mail-opened" />
                  </span>
                  <p className="fs-13 fw-medium text-gray-9">
                    A receipt of this transaction will be sent to the registered
                    info@customer@example.com
                  </p>
                </div>
                <div className="resend-form mb-3">
                  <input
                    type="text"
                    className="form-control"
                    defaultValue="infocustomer@example.com"
                  />
                  <button
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-primary btn-xs"
                  >
                    Resend Email
                  </button>
                </div>
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-md btn-light flex-fill"
                    data-bs-toggle="modal"
                    data-bs-target="#print-receipt"
                  >
                    <i className="ti ti-printer me-1" />
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    className="btn btn-md btn-teal flex-fill"
                  >
                    <i className="ti ti-gift me-1" />
                    Gift Receipt
                  </button>
                  <Link to="#" className="btn btn-md btn-dark flex-fill">
                    <i className="ti ti-shopping-cart me-1" />
                    Next Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Cash Payment */}
      {/* Payment Cash */}
      <div className="modal fade modal-default" id="payment-cash">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Hoàn tất thanh toán</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Đóng"
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
                        Số tiền nhận <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dong" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            receivedAmount
                              ? receivedAmount.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={handleReceivedChange}
                          placeholder="Nhập số tiền nhận..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Số tiền cần thanh toán{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dong" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            payingAmount
                              ? payingAmount.toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={handlePayingChange}
                          placeholder="Nhập số tiền cần thanh toán..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="change-item mb-3">
                      <label className="form-label">Số tiền cần trả lại</label>
                      <div className="input-icon-start position-relative">
                        <span className="input-icon-addon text-gray-9">
                          <i className="ti ti-currency-dong" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            changeAmount > 0
                              ? changeAmount.toLocaleString("vi-VN")
                              : "0"
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick cash */}
                  <div className="col-md-12">
                    <div className="quick-cash payment-content bg-light d-block mb-3">
                      <div className="d-flex align-items-center flex-wrap gap-4">
                        <h5 className="text-nowrap mb-0">Tiền mặt nhanh</h5>
                        <div className="d-flex align-items-center flex-wrap gap-3">
                          {[10000, 20000, 50000, 100000, 500000, 1000000].map(
                            (amount, idx) => (
                              <div className="form-check" key={amount}>
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="cash"
                                  id={`cash${idx + 1}`}
                                  onChange={() => handleQuickCash(amount)}
                                />
                                <label
                                  className="btn btn-white"
                                  htmlFor={`cash${idx + 1}`}
                                >
                                  {amount.toLocaleString()}₫
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Điểm thưởng */}
                    <div className="point-wrap payment-content mb-3">
                      <div className="bg-success-transparent d-flex align-items-center justify-content-between flex-wrap p-2 gap-2 br-5">
                        <h6 className="fs-14 fw-bold text-success mb-0">
                          Bạn có 2.000 điểm có thể sử dụng
                        </h6>
                        <Link to="#" className="btn btn-dark btn-md">
                          Dùng cho đơn hàng này
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Người nhận thanh toán */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Người nhận thanh toán
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên nhân viên thu tiền"
                      />
                    </div>
                  </div>

                  {/* Ghi chú thanh toán */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Ghi chú thanh toán</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Nhập ghi chú (nếu có)"
                        defaultValue={""}
                      />
                    </div>
                  </div>

                  {/* Ghi chú bán hàng */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Ghi chú bán hàng</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Nhập ghi chú bán hàng"
                        defaultValue={""}
                      />
                    </div>
                  </div>

                  {/* Ghi chú nhân viên */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Ghi chú của nhân viên
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Nhập ghi chú nội bộ"
                        defaultValue={""}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer d-flex justify-content-end flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="btn btn-md btn-primary"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Payment Cash  */}
      {/* Payment Point */}
      <div className="modal fade modal-default" id="payment-points">
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
                          defaultValue={1800}
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
                          defaultValue={1800}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    {/* <div className="change-item mb-3">
                  <label className="form-label">Change</label>
                  <div className="input-icon-start position-relative">
                    <span className="input-icon-addon text-gray-9">
                      <i className="ti ti-currency-dollar" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={0.0}
                    />
                  </div>
                </div> */}
                    <div className="point-item mb-3">
                      <label className="form-label">Balance Point</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={200}
                      />
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
                    <div className="quick-cash payment-content bg-light  mb-3">
                      <div className="d-flex align-items-center flex-wra gap-4">
                        <h5 className="text-nowrap">Quick Cash</h5>
                        <div className="d-flex align-items-center flex-wrap gap-3">
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash41"
                              defaultChecked
                            />
                            <label className="btn btn-white" htmlFor="cash41">
                              10
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash42"
                            />
                            <label className="btn btn-white" htmlFor="cash42">
                              20
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash43"
                            />
                            <label className="btn btn-white" htmlFor="cash43">
                              50
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash44"
                            />
                            <label className="btn btn-white" htmlFor="cash44">
                              100
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash45"
                            />
                            <label className="btn btn-white" htmlFor="cash45">
                              500
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              className="btn-check"
                              name="cash"
                              id="cash46"
                            />
                            <label className="btn btn-white" htmlFor="cash46">
                              1000
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="point-wrap payment-content d-block mb-3">
                      <div className=" bg-success-transparent d-flex align-items-center justify-content-between flex-wrap p-2 gap-2 br-5">
                        <h6 className="fs-14 fw-bold text-success">
                          You have 2000 Points to Use
                        </h6>
                        <Link to="#" className="btn btn-dark btn-md">
                          Use for this Purchase
                        </Link>
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
                        defaultValue={""}
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
                        defaultValue={""}
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
                        defaultValue={""}
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
      {/* /Payment Point */}
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
                  {/* Column 1 */}
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

                  {/* Column 2 */}
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

                  {/* Column 3 */}
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

                  {/* Column 4 */}
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
                      <td className="text-gray-9 fw-medium text-end">$45689</td>
                    </tr>
                    <tr>
                      <td>Total Sale Amount</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $566867.97
                      </td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">$1959</td>
                    </tr>
                    <tr>
                      <td>Total Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$0</td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $587130.97
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
      {/* Today&apos;s Sale */}
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
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Cash Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Credit Card Payment</td>
                      <td className="text-gray-9 fw-medium text-end">$1959</td>
                    </tr>
                    <tr>
                      <td>Cheque Payment:</td>
                      <td className="text-gray-9 fw-medium text-end">$0</td>
                    </tr>
                    <tr>
                      <td>Deposit Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Points Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Gift Card Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Scan &amp; Pay</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Pay Later</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Total Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Expense:</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $587130.97
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
      {/* /Today&apos;s Sale */}
      {/* Today&apos;s Profit */}
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
                    <h3 className="text-success">$89954</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-danger bg-danger-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Expense</p>
                    <h3 className="text-danger">$89954</h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 d-flex">
                  <div className="border border-info bg-info-transparent br-8 p-3 flex-fill">
                    <p className="fs-16 text-gray-9 mb-1">Total Profit </p>
                    <h3 className="text-info">$2145</h3>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped border">
                  <tbody>
                    <tr>
                      <td>Product Revenue</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Product Cost</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Expense</td>
                      <td className="text-gray-9 fw-medium text-end">$1959</td>
                    </tr>
                    <tr>
                      <td>Total Stock Adjustment</td>
                      <td className="text-gray-9 fw-medium text-end">$0</td>
                    </tr>
                    <tr>
                      <td>Deposit Payment</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Purchase Shipping Cost</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sell Discount</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sell Return</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Closing Stock</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $3355.84
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sales</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Sale Return</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td>Total Expense</td>
                      <td className="text-gray-9 fw-medium text-end">
                        $565597.88
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-9 fw-bold bg-secondary-transparent">
                        Total Cash
                      </td>
                      <td className="text-gray-9 fw-bold text-end bg-secondary-transparent">
                        $587130.97
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
      {/* /Today&apos;s Profit */}
    </>
  );
};

export default PosModals;
