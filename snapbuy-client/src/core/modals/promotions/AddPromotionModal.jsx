import { useState, useEffect } from "react";
import { Modal, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { createPromotion } from "../../../services/PromotionService";
import { getAllProducts } from "../../../services/ProductService";
import ProductSelectionModal from "./ProductSelectionModal";
import SmartDateTimePicker from "../../../components/date-time-picker/SmartDateTimePicker";

// Set locale mặc định cho dayjs
dayjs.locale("vi");

const AddPromotionModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    promotionName: "",
    description: "",
    discountType: "Giảm theo phần trăm",
    discountValue: "",
    startDate: null,
    endDate: null,
    productIds: [],
  });
  const [errors, setErrors] = useState({});

  // Load danh sách sản phẩm
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        promotionName: "",
        description: "",
        discountType: "Giảm theo phần trăm",
        discountValue: "",
        startDate: null,
        endDate: null,
        productIds: [],
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch {
      message.error("Không thể thêm chương trình khuyến mãi!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let finalValue = value;

    // Tên khuyến mãi: chỉ cho phép chữ, số, khoảng trắng, %, -, $
    if (name === "promotionName") {
      finalValue = value.replace(/^[\s]+/, ""); // Xóa khoảng trắng đầu
      // Chỉ cho phép: chữ cái (bao gồm tiếng Việt), số, khoảng trắng, %, -, $
      finalValue = finalValue.replace(/[^a-zA-Z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\s%\-$]/g, "");
    }

    // Giá trị giảm giá: chỉ cho phép số
    if (name === "discountValue") {
      finalValue = value.replace(/[^0-9.]/g, ""); // Chỉ cho phép số và dấu chấm
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductSelection = (selectedIds) => {
    setFormData((prev) => ({ ...prev, productIds: selectedIds }));
    if (errors.productIds) {
      setErrors((prev) => ({ ...prev, productIds: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.promotionName.trim()) {
      newErrors.promotionName = "Vui lòng nhập tên khuyến mãi.";
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Giá trị giảm giá phải lớn hơn 0.";
    }

    if (
      formData.discountType === "Giảm theo phần trăm" &&
      parseFloat(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Giá trị phần trăm không được vượt quá 100.";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    if (!formData.productIds || formData.productIds.length === 0) {
      newErrors.productIds = "Vui lòng chọn ít nhất một sản phẩm.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        promotionName: formData.promotionName.trim(),
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        startDate: formData.startDate
          ? dayjs(formData.startDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        endDate: formData.endDate
          ? dayjs(formData.endDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        productIds: formData.productIds,
      };

      await createPromotion(payload);
      message.success("Tạo khuyến mãi thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo khuyến mãi.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProductsDisplay = () => {
    if (!formData.productIds || formData.productIds.length === 0) {
      return [];
    }
    return products.filter((p) => formData.productIds.includes(p.productId));
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closable={true}
      title={<h4 className="mb-0">Thêm khuyến mãi</h4>}
    >
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                Tên khuyến mãi <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="promotionName"
                className={`form-control ${errors.promotionName ? "is-invalid" : ""
                  }`}
                value={formData.promotionName}
                onChange={handleInputChange}
                placeholder="Nhập tên khuyến mãi"
                disabled={loading}
              />
              {errors.promotionName && (
                <div className="invalid-feedback">{errors.promotionName}</div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                Loại giảm giá <span className="text-danger">*</span>
              </label>
              <select
                name="discountType"
                className="form-control"
                value={formData.discountType}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Giảm theo phần trăm">Giảm theo phần trăm</option>
                <option value="Giảm trực tiếp số tiền">
                  Giảm trực tiếp số tiền
                </option>
              </select>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                Giá trị giảm giá <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="discountValue"
                className={`form-control ${errors.discountValue ? "is-invalid" : ""
                  }`}
                value={formData.discountValue}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  // Chặn mọi ký tự không phải số hoặc dấu chấm
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder={
                  formData.discountType === "Giảm theo phần trăm"
                    ? "Nhập % giảm giá"
                    : "Nhập số tiền giảm"
                }
                disabled={loading}
              />
              {errors.discountValue && (
                <div className="invalid-feedback">{errors.discountValue}</div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <input
                type="text"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả khuyến mãi"
                disabled={loading}
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                Ngày bắt đầu <span className="text-danger">*</span>
              </label>
              <SmartDateTimePicker
                placeholder="Ngày/tháng/năm Giờ:Phút"
                value={formData.startDate ? dayjs(formData.startDate) : null}
                onChange={(date) => {
                  if (date) {
                    setFormData({ ...formData, startDate: date.toDate() });
                  } else {
                    setFormData({ ...formData, startDate: null });
                  }
                }}
                disabled={loading}
                status={errors.startDate ? "error" : ""}
              />
              {errors.startDate && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.startDate}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">
                Ngày kết thúc <span className="text-danger">*</span>
              </label>
              <SmartDateTimePicker
                placeholder="Ngày/tháng/năm Giờ:Phút"
                value={formData.endDate ? dayjs(formData.endDate) : null}
                onChange={(date) => {
                  if (date) {
                    setFormData({ ...formData, endDate: date.toDate() });
                  } else {
                    setFormData({ ...formData, endDate: null });
                  }
                }}
                disabled={loading}
                status={errors.endDate ? "error" : ""}
              />
              {errors.endDate && (
                <div
                  className="text-danger"
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {errors.endDate}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-12">
            <div className="mb-3">
              <label className="form-label">
                Chọn sản phẩm áp dụng <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${errors.productIds ? "is-invalid" : ""
                    }`}
                  value={
                    formData.productIds.length > 0
                      ? `Đã chọn ${formData.productIds.length} sản phẩm`
                      : ""
                  }
                  placeholder="Nhấn nút để chọn sản phẩm..."
                  readOnly
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setProductModalOpen(true)}
                  disabled={loading}
                >
                  <i className="ti ti-list me-1" />
                  Chọn sản phẩm
                </button>
              </div>
              {errors.productIds && (
                <div className="text-danger small mt-1">
                  {errors.productIds}
                </div>
              )}
              {formData.productIds.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">Sản phẩm đã chọn:</small>
                  <div
                    className="mt-1"
                    style={{ maxHeight: "80px", overflowY: "auto" }}
                  >
                    {getSelectedProductsDisplay().map((product) => (
                      <span
                        key={product.productId}
                        className="badge bg-info me-1 mb-1"
                      >
                        {product.productCode} - {product.productName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo khuyến mãi"}
          </button>
        </div>
      </form>

      <ProductSelectionModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        products={products}
        selectedProductIds={formData.productIds}
        onConfirm={handleProductSelection}
      />
    </Modal>
  );
};

export default AddPromotionModal;
