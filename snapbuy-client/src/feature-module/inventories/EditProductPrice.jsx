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
      console.error("❌ Lỗi lấy danh sách sản phẩm:", error);
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchProductPrice = async () => {
    try {
      setInitialLoading(true);
      const data = await getProductPriceById(id);

      // const formatDateTime = (dateTime) => {
      //   if (!dateTime) return "";
      //   const date = new Date(dateTime);
      //   return date.toLocaleDateString("vi-VN");
      // };

      setFormData({
        productId: data.productId || "",
        unitPrice: data.unitPrice || "",
        costPrice: data.costPrice || "",
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải thông tin giá sản phẩm:", error);
      message.error("Lỗi khi tải thông tin giá sản phẩm");
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
      newErrors.productId = "Làm ơn chọn sản phẩm";
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = "Giá bán phải lớn hơn 0";
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = "Giá nhập phải lớn hơn 0";
    }

    // if (!formData.validFrom) {
    //   newErrors.validFrom = "Vui lòng chọn ngày bắt đầu hiệu lực";
    // }

    // if (formData.validTo && formData.validFrom) {
    //   const from = new Date(formData.validFrom);
    //   const to = new Date(formData.validTo);
    //   if (to <= from) {
    //     newErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng sửa các lỗi trong biểu mẫu trước khi gửi.");
      return;
    }

    try {
      setLoading(true);

      const priceData = {
        productId: formData.productId,
        unitPrice: parseFloat(formData.unitPrice),
        costPrice: parseFloat(formData.costPrice),
      };

      await updateProductPrice(id, priceData);
      message.success("Cập nhật giá sản phẩm thành công!");
      navigate(route.productprices);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật giá sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(route.productprices);
  };

  // const selectedProduct = products.find((p) => p.productId === formData.productId);

  if (initialLoading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải ...</span>
            </div>
            <p className="mt-2">Đang tải giá sản phẩm ...</p>
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
                <h4>Sửa giá sản phẩm</h4>
                <h6>Cập nhật thông tin giá sản phẩm</h6>
              </div>
            </div>
            <div className="page-btn">
              <Link to={route.productprices} className="btn btn-secondary">
                <i className="ti ti-arrow-left me-1"></i>
                Quay lại danh sách giá sản phẩm
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
                      Thông tin giá sản phẩm
                    </h6>
                  </div>

                  <div className="row">
                    {/* Product Selection */}
                    <div className="col-lg-6 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Sản phẩm <span className="text-danger">*</span>
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
                            <option value="">Chọn sản phẩm</option>
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
                        <small className="text-muted">Sản phẩm không thể thay đổi</small>
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Giá bán (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.unitPrice ? "is-invalid" : ""}`}
                          name="unitPrice"
                          value={formData.unitPrice}
                          onChange={handleChange}
                          placeholder="Nhập giá bán"
                          step="0.01"
                          min="0"
                        />
                        {errors.unitPrice && (
                          <div className="invalid-feedback">{errors.unitPrice}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Giá nhập (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.costPrice ? "is-invalid" : ""}`}
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          placeholder="Nhập giá nhập"
                          step="0.01"
                          min="0"
                        />
                        {errors.costPrice && (
                          <div className="invalid-feedback">{errors.costPrice}</div>
                        )}
                      </div>
                    </div>

                    {/* <div className="col-lg-6 col-md-6">
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
                    </div> */}

                    {/* Price Calculation Preview */}
                    {formData.unitPrice && formData.costPrice && (
                      <div className="col-12">
                        <div className="alert alert-info">
                          <strong>Xem trước:</strong>
                          <ul className="mb-0 mt-2">
                            <li>Giá bán: {parseFloat(formData.unitPrice).toLocaleString()} đ</li>
                            <li>Giá nhập: {parseFloat(formData.costPrice).toLocaleString()} đ</li>
                            {formData.costPrice && (
                              <li className="mt-2">
                                Biên lợi nhuận:{" "}
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
                Huỷ
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang cập nhật ...
                  </>
                ) : (
                  <>
                    <i className="ti ti-device-floppy me-1"></i>
                    Cập nhật
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