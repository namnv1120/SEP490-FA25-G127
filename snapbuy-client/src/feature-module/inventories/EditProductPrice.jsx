import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import { message } from "antd";
import {
  getProductPriceById,
  updateProductPrice,
} from "../../services/ProductPriceService";
import { getAllProducts } from "../../services/ProductService";
import PageLoader from "../../components/loading/PageLoader.jsx";

const EditProductPrice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = allRoutes;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    productId: "",
    unitPrice: "",
    costPrice: "",
  });

  const [inputValues, setInputValues] = useState({
    unitPrice: "",
    costPrice: "",
  });

  const [errors, setErrors] = useState({});

  // Format số thành tiền Việt (với dấu chấm phân cách hàng nghìn)
  const formatCurrency = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const num = parseFloat(String(value).replace(/\./g, "").replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN");
  };

  // Parse chuỗi tiền Việt thành số
  const parseCurrency = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const num = parseFloat(String(value).replace(/\./g, "").replace(/,/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const fetchProducts = useCallback(async () => {
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
  }, []);

  const fetchProductPrice = useCallback(async () => {
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
      setInputValues({
        unitPrice: formatCurrency(data.unitPrice || 0),
        costPrice: formatCurrency(data.costPrice || 0),
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải thông tin giá sản phẩm:", error);
      message.error("Lỗi khi tải thông tin giá sản phẩm");
      navigate(route.productprices);
    } finally {
      setInitialLoading(false);
    }
  }, [id, navigate, route.productprices]);

  useEffect(() => {
    fetchProducts();
    fetchProductPrice();
  }, [fetchProducts, fetchProductPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "unitPrice" || name === "costPrice") {
      // Chỉ cho phép nhập số
      const rawInput = value.replace(/[^0-9]/g, "");
      const numValue = parseCurrency(rawInput);

      setInputValues((prev) => ({
        ...prev,
        [name]: formatCurrency(numValue),
      }));
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePriceBlur = (name) => {
    const value = inputValues[name];

    // Nếu trống hoặc không hợp lệ, set về 0
    const numValue = parseCurrency(value);
    if (numValue === 0 || isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
      setInputValues((prev) => ({
        ...prev,
        [name]: "0",
      }));
      return;
    }

    const finalValue = Math.max(0, numValue);

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    setInputValues((prev) => ({
      ...prev,
      [name]: formatCurrency(finalValue),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = "Làm ơn chọn sản phẩm";
    }

    const unitPrice = parseFloat(formData.unitPrice);
    const costPrice = parseFloat(formData.costPrice);

    if (!formData.unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
      newErrors.unitPrice = "Giá bán phải lớn hơn 0";
    }

    if (!formData.costPrice || isNaN(costPrice) || costPrice < 0) {
      newErrors.costPrice = "Giá nhập không được âm";
    }

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
      message.error(
        error.response?.data?.message ||
          "Lỗi khi cập nhật giá sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(route.productprices);
  };

  // const selectedProduct = products.find((p) => p.productId === formData.productId);

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Sửa giá sản phẩm</h4>
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
                        <select
                          className={`form-control ${
                            errors.productId ? "is-invalid" : ""
                          }`}
                          name="productId"
                          value={formData.productId}
                          onChange={handleChange}
                          disabled
                        >
                          <option value="">
                            {loadingProducts
                              ? "Đang tải dữ liệu..."
                              : "Chọn sản phẩm"}
                          </option>
                          {products.map((product) => (
                            <option
                              key={product.productId}
                              value={product.productId}
                            >
                              {product.productName}
                            </option>
                          ))}
                        </select>
                        {errors.productId && (
                          <div className="invalid-feedback">
                            {errors.productId}
                          </div>
                        )}
                        <small className="text-muted">
                          Sản phẩm không thể thay đổi
                        </small>
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Giá bán (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control text-start ${
                            errors.unitPrice ? "is-invalid" : ""
                          }`}
                          name="unitPrice"
                          value={inputValues.unitPrice}
                          onChange={handleChange}
                          onBlur={() => handlePriceBlur("unitPrice")}
                          placeholder="0"
                        />
                        {errors.unitPrice && (
                          <div className="invalid-feedback">
                            {errors.unitPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Giá nhập (đ) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control text-start ${
                            errors.costPrice ? "is-invalid" : ""
                          }`}
                          name="costPrice"
                          value={inputValues.costPrice}
                          onChange={handleChange}
                          onBlur={() => handlePriceBlur("costPrice")}
                          placeholder="0"
                        />
                        {errors.costPrice && (
                          <div className="invalid-feedback">
                            {errors.costPrice}
                          </div>
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
                            <li>
                              Giá bán:{" "}
                              {parseFloat(formData.unitPrice).toLocaleString()}{" "}
                              đ
                            </li>
                            <li>
                              Giá nhập:{" "}
                              {parseFloat(formData.costPrice).toLocaleString()}{" "}
                              đ
                            </li>
                            {formData.costPrice && (
                              <li className="mt-2">
                                Biên lợi nhuận:{" "}
                                {(
                                  ((parseFloat(formData.unitPrice) -
                                    parseFloat(formData.costPrice)) /
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
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
