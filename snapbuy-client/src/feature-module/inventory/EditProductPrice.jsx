import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import CommonFooter from "../../components/footer/commonFooter";
import { message } from "antd";
import { getProductPriceById, updateProductPrice } from "../../services/ProductPriceService";
import { getAllProducts } from "../../services/ProductService";

const EditProductPrice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = all_routes;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    productId: "",
    unitPrice: "",
    costPrice: "",
    taxRate: "",
    validFrom: "",
    validTo: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchProductPrice();
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchProductPrice = async () => {
    try {
      setInitialLoading(true);
      const data = await getProductPriceById(id);

      // Format datetime for input fields
      const formatDateTime = (dateTime) => {
        if (!dateTime) return "";
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      };

      setFormData({
        productId: data.productId || "",
        unitPrice: data.unitPrice || "",
        costPrice: data.costPrice || "",
        taxRate: data.taxRate || "",
        validFrom: formatDateTime(data.validFrom),
        validTo: formatDateTime(data.validTo),
      });
    } catch (error) {
      console.error("Error fetching product price:", error);
      message.error("Failed to load product price");
      navigate(route.productprices);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a product";
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = "Unit price must be greater than 0";
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = "Cost price must be greater than 0";
    }

    if (formData.taxRate && (parseFloat(formData.taxRate) < 0 || parseFloat(formData.taxRate) > 1)) {
      newErrors.taxRate = "Tax rate must be between 0 and 1 (e.g., 0.10 for 10%)";
    }

    if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }

    if (formData.validTo && formData.validFrom) {
      const from = new Date(formData.validFrom);
      const to = new Date(formData.validTo);
      if (to <= from) {
        newErrors.validTo = "Valid to must be after valid from";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const priceData = {
        productId: formData.productId,
        unitPrice: parseFloat(formData.unitPrice),
        costPrice: parseFloat(formData.costPrice),
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : 0,
        validFrom: formData.validFrom,
        validTo: formData.validTo || null,
      };

      await updateProductPrice(id, priceData);
      message.success("Product price updated successfully!");
      navigate(route.productprices);
    } catch (error) {
      console.error("Error updating product price:", error);
      message.error(error.response?.data?.message || "Failed to update product price");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(route.productprices);
  };

  const selectedProduct = products.find((p) => p.productId === formData.productId);

  if (initialLoading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading product price...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Edit Product Price</h4>
                <h6>Update product pricing information</h6>
              </div>
            </div>
            <div className="page-btn">
              <Link to={route.productprices} className="btn btn-secondary">
                <i className="ti ti-arrow-left me-1"></i>
                Back to List
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">
                <div className="new-employee-field">
                  <div className="card-title-head">
                    <h6>
                      <span>
                        <i className="ti ti-info-circle me-2"></i>
                      </span>
                      Price Information
                    </h6>
                  </div>

                  <div className="row">
                    {/* Product Selection */}
                    <div className="col-lg-6 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Product <span className="text-danger">*</span>
                        </label>
                        {loadingProducts ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <select
                            className={`form-control ${errors.productId ? "is-invalid" : ""}`}
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            disabled
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.productId} value={product.productId}>
                                {product.productCode} - {product.productName}
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.productId && (
                          <div className="invalid-feedback d-block">{errors.productId}</div>
                        )}
                        <small className="text-muted">Product cannot be changed</small>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Unit Price (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.unitPrice ? "is-invalid" : ""}`}
                          name="unitPrice"
                          value={formData.unitPrice}
                          onChange={handleChange}
                          placeholder="Enter unit price"
                          step="0.01"
                          min="0"
                        />
                        {errors.unitPrice && (
                          <div className="invalid-feedback">{errors.unitPrice}</div>
                        )}
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Cost Price (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.costPrice ? "is-invalid" : ""}`}
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          placeholder="Enter cost price"
                          step="0.01"
                          min="0"
                        />
                        {errors.costPrice && (
                          <div className="invalid-feedback">{errors.costPrice}</div>
                        )}
                      </div>
                    </div>

                    {/* Tax Rate */}
                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tax Rate (0-1)</label>
                        <input
                          type="number"
                          className={`form-control ${errors.taxRate ? "is-invalid" : ""}`}
                          name="taxRate"
                          value={formData.taxRate}
                          onChange={handleChange}
                          placeholder="e.g., 0.10 for 10%"
                          step="0.01"
                          min="0"
                          max="1"
                        />
                        {errors.taxRate && (
                          <div className="invalid-feedback">{errors.taxRate}</div>
                        )}
                        <small className="text-muted">Enter as decimal (e.g., 0.10 = 10%)</small>
                      </div>
                    </div>

                    {/* Valid From */}
                    <div className="col-lg-6 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Valid From <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.validFrom ? "is-invalid" : ""}`}
                          name="validFrom"
                          value={formData.validFrom}
                          onChange={handleChange}
                        />
                        {errors.validFrom && (
                          <div className="invalid-feedback">{errors.validFrom}</div>
                        )}
                      </div>
                    </div>

                    {/* Valid To */}
                    <div className="col-lg-6 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Valid To</label>
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.validTo ? "is-invalid" : ""}`}
                          name="validTo"
                          value={formData.validTo}
                          onChange={handleChange}
                        />
                        {errors.validTo && (
                          <div className="invalid-feedback">{errors.validTo}</div>
                        )}
                        <small className="text-muted">Leave empty for no expiration</small>
                      </div>
                    </div>

                    {/* Price Calculation Preview */}
                    {formData.unitPrice && formData.taxRate && (
                      <div className="col-12">
                        <div className="alert alert-info">
                          <strong>Price Preview:</strong>
                          <ul className="mb-0 mt-2">
                            <li>Unit Price: {parseFloat(formData.unitPrice).toLocaleString()} đ</li>
                            <li>
                              Tax ({(parseFloat(formData.taxRate) * 100).toFixed(2)}%):{" "}
                              {(parseFloat(formData.unitPrice) * parseFloat(formData.taxRate)).toLocaleString()} đ
                            </li>
                            <li>
                              <strong>
                                Total with Tax:{" "}
                                {(
                                  parseFloat(formData.unitPrice) *
                                  (1 + parseFloat(formData.taxRate))
                                ).toLocaleString()}{" "}
                                đ
                              </strong>
                            </li>
                            {formData.costPrice && (
                              <li className="mt-2">
                                Profit Margin:{" "}
                                {(
                                  ((parseFloat(formData.unitPrice) - parseFloat(formData.costPrice)) /
                                    parseFloat(formData.costPrice)) *
                                  100
                                ).toFixed(2)}
                                %
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ti ti-device-floppy me-1"></i>
                    Update Price
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <CommonFooter />
      </div>
    </>
  );
};

export default EditProductPrice;