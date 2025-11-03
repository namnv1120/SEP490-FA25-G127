import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonDatePicker from "../../../components/date-picker/common-date-picker";
import CommonSelect from "../../../components/select/common-select";
import { qrCodeImage } from "../../../utils/imagepath";
import { salesReturnService } from "../../../services/salesReturnService";

const EditSalesRetuens = ({ onSuccess, selectedItemId }) => {
  // Form state
  const [date, setDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reference, setReference] = useState("");
  const [productCode, setProductCode] = useState("");
  const [orderTax, setOrderTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  
  // Product list state
  const [products, setProducts] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const customers = [
    { value: "Choose Customer", label: "Choose Customer" },
    { value: "Thomas", label: "Thomas" },
    { value: "Benjamin", label: "Benjamin" },
    { value: "Bruklin", label: "Bruklin" },
  ];

  const status = [
    { value: "Status", label: "Status" },
    { value: "Pending", label: "Pending" },
    { value: "Received", label: "Received" },
  ];

  // Fetch data when modal opens
  useEffect(() => {
    const modalElement = document.getElementById('edit-sales-new');
    
    const handleModalShow = async () => {
      if (selectedItemId) {
        await fetchSalesReturnData(selectedItemId);
      }
    };

    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', handleModalShow);
      
      return () => {
        modalElement.removeEventListener('show.bs.modal', handleModalShow);
      };
    }
  }, [selectedItemId]);

  // Fetch sales return data
  const fetchSalesReturnData = async (id) => {
    setFetchLoading(true);
    setError(null);
    
    try {
      const data = await salesReturnService.getById(id);
      
      // Populate form with fetched data
      setSelectedCustomer(data.customerId);
      setDate(new Date(data.date));
      setReference(data.reference);
      setSelectedStatus(data.status);
      setOrderTax(data.orderTax || 0);
      setDiscount(data.discount || 0);
      setShipping(data.shipping || 0);
      
      // Set products if available
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching sales return:", err);
      setError(err.message || "Failed to load sales return data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Calculate totals
  const calculateSubtotal = (product) => {
    const qty = parseFloat(product.qty) || 0;
    const price = parseFloat(product.price) || 0;
    const discount = parseFloat(product.discount) || 0;
    const tax = parseFloat(product.tax) || 0;
    
    const subtotal = (qty * price) - discount;
    const taxAmount = (subtotal * tax) / 100;
    
    return subtotal + taxAmount;
  };

  const calculateGrandTotal = () => {
    const productsTotal = products.reduce((sum, product) => {
      return sum + calculateSubtotal(product);
    }, 0);
    
    const taxAmount = parseFloat(orderTax) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const shippingAmount = parseFloat(shipping) || 0;
    
    return productsTotal + taxAmount - discountAmount + shippingAmount;
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCustomer || selectedCustomer === "Choose Customer") {
      newErrors.customer = "Please select a customer";
    }
    
    if (!date) {
      newErrors.date = "Please select a date";
    }
    
    if (!reference.trim()) {
      newErrors.reference = "Please enter a reference";
    }
    
    if (products.length === 0) {
      newErrors.products = "Please add at least one product";
    }
    
    if (!selectedStatus || selectedStatus === "Status") {
      newErrors.status = "Please select a status";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!selectedItemId) {
      setError("No item selected for update");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = {
        customerId: selectedCustomer,
        date: date.toISOString(),
        reference: reference,
        status: selectedStatus,
        products: products.map(p => ({
          productId: p.id || p.productId,
          productName: p.name || p.productName,
          qty: parseFloat(p.qty),
          price: parseFloat(p.price),
          discount: parseFloat(p.discount),
          tax: parseFloat(p.tax),
          subtotal: calculateSubtotal(p)
        })),
        orderTax: parseFloat(orderTax) || 0,
        discount: parseFloat(discount) || 0,
        shipping: parseFloat(shipping) || 0,
        total: calculateGrandTotal(),
        paid: 0, // This should come from payment section
        due: calculateGrandTotal()
      };
      
      await salesReturnService.update(selectedItemId, formData);
      
      // Close modal
      const modalElement = document.getElementById('edit-sales-new');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Show success message
      alert("Sales return updated successfully!");
      
    } catch (err) {
      console.error("Error updating sales return:", err);
      setError(err.message || "Failed to update sales return");
    } finally {
      setLoading(false);
    }
  };

  // Handle add product
  const handleAddProduct = () => {
    if (!productCode.trim()) {
      alert("Please enter a product code");
      return;
    }
    
    const newProduct = {
      id: Date.now().toString(),
      code: productCode,
      name: productCode,
      price: 0,
      qty: 1,
      discount: 0,
      tax: 0,
      stock: 0
    };
    
    setProducts([...products, newProduct]);
    setProductCode("");
  };

  // Handle remove product
  const handleRemoveProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId && p.productId !== productId));
  };

  // Handle product field change
  const handleProductChange = (productId, field, value) => {
    setProducts(products.map(p => 
      (p.id === productId || p.productId === productId) ? { ...p, [field]: value } : p
    ));
  };

  // Reset form
  const resetForm = () => {
    setDate(new Date());
    setSelectedStatus(null);
    setSelectedCustomer(null);
    setReference("");
    setProductCode("");
    setOrderTax(0);
    setDiscount(0);
    setShipping(0);
    setProducts([]);
    setErrors({});
    setError(null);
  };

  return (
    <div>
      {/* Edit popup */}
      <div className="modal fade" id="edit-sales-new">
        <div className="modal-dialog add-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Edit Sales Return</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card border-0">
                <div className="card-body pb-0">
                  {/* Loading State */}
                  {fetchLoading && (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading sales return data...</p>
                    </div>
                  )}

                  {/* Error Alert */}
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

                  {!fetchLoading && (
                    <>
                      <div className="row">
                        {/* Customer Name */}
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Customer Name
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <div className="row">
                              <div className="col-lg-10 col-sm-10 col-10">
                                <CommonSelect
                                  className="w-100"
                                  options={customers}
                                  value={selectedCustomer}
                                  onChange={(e) => {
                                    setSelectedCustomer(e.value);
                                    setErrors({ ...errors, customer: null });
                                  }}
                                  placeholder="Choose"
                                  filter={false}
                                />
                                {errors.customer && (
                                  <small className="text-danger">{errors.customer}</small>
                                )}
                              </div>
                              <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                <div className="add-icon">
                                  <Link
                                    to="#"
                                    className="bg-dark text-white p-2 rounded"
                                    title="Add New Customer"
                                  >
                                    <i className="feather icon-plus-circle plus" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Date<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-groupicon calender-input">
                              <CommonDatePicker
                                value={date}
                                onChange={(newDate) => {
                                  setDate(newDate);
                                  setErrors({ ...errors, date: null });
                                }}
                                className="w-100"
                              />
                              <i className="feather icon-calendar info-img" />
                            </div>
                            {errors.date && (
                              <small className="text-danger">{errors.date}</small>
                            )}
                          </div>
                        </div>

                        {/* Reference */}
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Reference<span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={reference}
                              onChange={(e) => {
                                setReference(e.target.value);
                                setErrors({ ...errors, reference: null });
                              }}
                            />
                            {errors.reference && (
                              <small className="text-danger">{errors.reference}</small>
                            )}
                          </div>
                        </div>

                        {/* Product */}
                        <div className="col-lg-12 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Product<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-groupicon select-code">
                              <input
                                type="text"
                                className="form-control"
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
                              <div className="addonset" onClick={handleAddProduct} style={{ cursor: 'pointer' }}>
                                <img src={qrCodeImage} alt="img" />
                              </div>
                            </div>
                            {errors.products && (
                              <small className="text-danger">{errors.products}</small>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Products Table */}
                      <div className="table-responsive no-pagination mb-3">
                        <table className="table datanew">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Net Unit Price($)</th>
                              <th>Stock</th>
                              <th>QTY</th>
                              <th>Discount($)</th>
                              <th>Tax %</th>
                              <th>Subtotal ($)</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center text-muted">
                                  No products added yet
                                </td>
                              </tr>
                            ) : (
                              products.map((product, index) => (
                                <tr key={product.id || product.productId || index}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {product.image && (
                                        <Link to="#" className="avatar avatar-md me-2">
                                          <img src={product.image} alt="product" />
                                        </Link>
                                      )}
                                      <span>{product.name || product.productName}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={product.price}
                                      onChange={(e) => handleProductChange(product.id || product.productId, 'price', e.target.value)}
                                      min="0"
                                      step="0.01"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={product.stock}
                                      onChange={(e) => handleProductChange(product.id || product.productId, 'stock', e.target.value)}
                                      min="0"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={product.qty}
                                      onChange={(e) => handleProductChange(product.id || product.productId, 'qty', e.target.value)}
                                      min="1"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={product.discount}
                                      onChange={(e) => handleProductChange(product.id || product.productId, 'discount', e.target.value)}
                                      min="0"
                                      step="0.01"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={product.tax}
                                      onChange={(e) => handleProductChange(product.id || product.productId, 'tax', e.target.value)}
                                      min="0"
                                      max="100"
                                    />
                                  </td>
                                  <td>${calculateSubtotal(product).toFixed(2)}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRemoveProduct(product.id || product.productId)}
                                      title="Remove product"
                                    >
                                      <i className="ti ti-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Summary */}
                      <div className="row">
                        <div className="col-lg-6 ms-auto">
                          <div className="total-order w-100 max-widthauto m-auto mb-4">
                            <ul className="rounded-1 border-1">
                              <li className="border-0 border-bottom">
                                <h4 className="border-end">Order Tax</h4>
                                <h5>$ {parseFloat(orderTax || 0).toFixed(2)}</h5>
                              </li>
                              <li className="border-0 border-bottom">
                                <h4 className="border-end">Discount</h4>
                                <h5>$ {parseFloat(discount || 0).toFixed(2)}</h5>
                              </li>
                              <li className="border-0 border-bottom">
                                <h4 className="border-end">Shipping</h4>
                                <h5>$ {parseFloat(shipping || 0).toFixed(2)}</h5>
                              </li>
                              <li className="border-0 border-bottom">
                                <h4 className="border-end">Grand Total</h4>
                                <h5>$ {calculateGrandTotal().toFixed(2)}</h5>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Additional Fields */}
                      <div className="row">
                        <div className="col-lg-3 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Order Tax<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-groupicon select-code">
                              <input
                                type="number"
                                value={orderTax}
                                onChange={(e) => setOrderTax(e.target.value)}
                                className="form-control p-2"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Discount<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-groupicon select-code">
                              <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className="form-control p-2"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Shipping<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-groupicon select-code">
                              <input
                                type="number"
                                value={shipping}
                                onChange={(e) => setShipping(e.target.value)}
                                className="form-control p-2"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 col-12">
                          <div className="mb-3 mb-5">
                            <label className="form-label">
                              Status<span className="text-danger ms-1">*</span>
                            </label>
                            <CommonSelect
                              className="w-100"
                              options={status}
                              value={selectedStatus}
                              onChange={(e) => {
                                setSelectedStatus(e.value);
                                setErrors({ ...errors, status: null });
                              }}
                              placeholder="Choose"
                              filter={false}
                            />
                            {errors.status && (
                              <small className="text-danger">{errors.status}</small>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-cancel me-3"
                  data-bs-dismiss="modal"
                  onClick={resetForm}
                  disabled={loading || fetchLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary add-sale"
                  disabled={loading || fetchLoading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit popup */}
    </div>
  );
};

export default EditSalesRetuens;