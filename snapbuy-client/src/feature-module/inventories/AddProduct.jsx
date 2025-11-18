/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { allRoutes } from "../../routes/AllRoutes";
import { createProduct } from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import { getAllSuppliers } from "../../services/SupplierService";
import CommonSelect from "../../components/select/common-select";
import DeleteModal from "../../components/delete-modal";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { generateRandomBarcode, downloadBarcode, displayBarcodePreview } from "../../utils/barcodeUtils";

const AddProduct = () => {
  const route = allRoutes;
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productCode: "",
    productName: "",
    barcode: "",
    description: "",
    unit: "",
    supplierName: "",
    dimensions: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);


  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(true);

  const handleRemoveProduct = () => setIsImageVisible(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        const mainCats = data
          .filter((c) => !c.parentCategoryId && (c.active === true || c.active === 1))
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));
        setCategories(mainCats);
      } catch (error) {
        console.error("❌ Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllCategories();
        const subs = data
          .filter((c) => c.parentCategoryId === selectedCategory?.value && (c.active === true || c.active === 1))
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));
        setSubCategories(subs);
      } catch (error) {
        console.error("❌ Lỗi lấy danh mục con:", error);
      }
    };

    if (selectedCategory) {
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        const options = data
          .filter((s) => s.active === true || s.active === 1)
          .map((s) => ({
            value: s.supplierId,
            label: s.supplierName,
          }));
        setSuppliers(options);
      } catch (error) {
        console.error("❌ Lỗi lấy nhà cung cấp:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Hiển thị barcode preview khi barcode thay đổi
  useEffect(() => {
    if (product.barcode?.trim()) {
      displayBarcodePreview(product.barcode, 'barcode-preview-add');
    } else {
      const container = document.getElementById('barcode-preview-add');
      if (container) {
        container.innerHTML = '';
      }
    }
  }, [product.barcode]);


  // 🧩 Validate dữ liệu
  const validateForm = () => {
    const newErrors = {};

    if (!product.productCode.trim()) {
      newErrors.productCode = "Vui lòng nhập mã sản phẩm.";
    } else if (product.productCode.length < 3) {
      newErrors.productCode = "Mã sản phẩm phải có ít nhất 3 ký tự.";
    } else if (product.productCode.length > 50) {
      newErrors.productCode = "Mã sản phẩm không được vượt quá 50 ký tự.";
    }

    if (!product.productName.trim()) {
      newErrors.productName = "Vui lòng nhập tên sản phẩm.";
    } else if (product.productName.length < 3) {
      newErrors.productName = "Tên sản phẩm phải có ít nhất 3 ký tự.";
    } else if (product.productName.length > 100) {
      newErrors.productName = "Tên sản phẩm không được vượt quá 100 ký tự.";
    } else if (!/^[\p{L}\d ]+$/u.test(product.productName)) {
      newErrors.productName = "Tên sản phẩm chỉ cho phép chữ, số và khoảng trắng.";
    }

    if (!selectedCategory) {
      newErrors.category = "Vui lòng chọn danh mục chính.";
    }

    if (!selectedSupplier) {
      newErrors.supplier = "Vui lòng chọn nhà cung cấp.";
    }

    if (product.unit && product.unit.length > 50) {
      newErrors.unit = "Đơn vị không được vượt quá 50 ký tự.";
    }

    if (product.dimensions && product.dimensions.length > 100) {
      newErrors.dimensions = "Kích thước không được vượt quá 100 ký tự.";
    }

    if (product.description && product.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự.";
    }

    if (product.barcode && product.barcode.length > 100) {
      newErrors.barcode = "Barcode không được vượt quá 100 ký tự.";
    }

    // Validate format barcode (chỉ chữ và số)
    if (product.barcode && !/^[A-Za-z0-9]*$/.test(product.barcode)) {
      newErrors.barcode = "Barcode chỉ cho phép chữ và số.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    const formData = new FormData();
    formData.append("productCode", product.productCode.trim());
    formData.append("productName", product.productName.trim());
    if (product.barcode?.trim()) {
      formData.append("barcode", product.barcode.trim());
    }
    formData.append("description", product.description.trim());
    formData.append("unit", product.unit.trim());
    formData.append("dimensions", product.dimensions.trim());
    formData.append(
      "categoryId",
      selectedSubCategory ? selectedSubCategory.value : selectedCategory?.value
    );
    formData.append("supplierId", selectedSupplier.value);

    formData.append("active", true);

    if (imageFile) {
      formData.append("image", imageFile); // 👈 gửi file ảnh
    }


    try {
      setIsSubmitting(true);
      const created = await createProduct(formData);
      message.success(`Sản phẩm "${created.productName}" tạo thành công!`);
      navigate(route.products);
    } catch (error) {
      console.error("❌ Lỗi tạo sản phẩm:", error);
      const res = error.response?.data;

      if (res?.code === 4000 && res?.message) {
        const messages = res.message
          .split(";")
          .map((msg) => msg.trim())
          .filter(Boolean);
        messages.forEach((msg) => message.error(msg));
      } else if (res?.message) {
        message.error(res.message);
      } else {
        message.error("Lỗi tạo sản phẩm. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Tạo sản phẩm</h4>
                <h6>Tạo sản phẩm mới</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <RefreshIcon />
              <CollapesIcon />
              <li>
                <div className="page-btn">
                  <Link to={route.products} className="btn btn-secondary">
                    <i className="feather icon-arrow-left me-2" />
                    Trở về danh sách sản phẩm
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="add-product">
              {/* --- THÔNG TIN SẢN PHẨM --- */}
              <div className="accordion-item border mb-4">
                <h2 className="accordion-header" id="headingSpacingOne">
                  <div
                    className="accordion-button bg-white"
                    data-bs-toggle="collapse"
                    data-bs-target="#SpacingOne"
                    aria-expanded="true"
                    aria-controls="SpacingOne"
                  >
                    <div className="d-flex align-items-center justify-content-between flex-fill">
                      <h5 className="d-flex align-items-center">
                        <i className="feather icon-info text-primary me-2" />
                        <span>Thông tin sản phẩm</span>
                      </h5>
                    </div>
                  </div>
                </h2>

                <div
                  id="SpacingOne"
                  className="accordion-collapse collapse show"
                >
                  <div className="accordion-body border-top">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Mã sản phẩm <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.productCode ? "is-invalid" : ""
                              }`}
                            value={product.productCode}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                productCode: e.target.value,
                              })
                            }
                          />
                          {errors.productCode && (
                            <div className="invalid-feedback">
                              {errors.productCode}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Tên sản phẩm <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.productName ? "is-invalid" : ""
                              }`}
                            value={product.productName}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                productName: e.target.value,
                              })
                            }
                          />
                          {errors.productName && (
                            <div className="invalid-feedback">
                              {errors.productName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Barcode (tùy chọn)
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              className={`form-control ${errors.barcode ? "is-invalid" : ""}`}
                              value={product.barcode || ""}
                              onChange={(e) =>
                                setProduct({
                                  ...product,
                                  barcode: e.target.value,
                                })
                              }
                              placeholder="Nhập barcode hoặc tạo tự động"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const generatedBarcode = generateRandomBarcode(13);
                                setProduct({
                                  ...product,
                                  barcode: generatedBarcode,
                                });
                                message.success("Đã tạo barcode ngẫu nhiên");
                              }}
                              title="Tạo barcode ngẫu nhiên"
                            >
                              <i className="ti ti-barcode" />
                            </button>
                            {product.barcode?.trim() && (
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={async () => {
                                  try {
                                    await downloadBarcode(
                                      product.barcode,
                                      product.productName || "SanPham"
                                    );
                                    message.success("Đã tải barcode về máy");
                                  } catch (error) {
                                    message.error(error.message || "Không thể tải barcode");
                                  }
                                }}
                                title="Tải barcode về máy"
                              >
                                <i className="ti ti-download" />
                              </button>
                            )}
                          </div>
                          {errors.barcode && (
                            <div className="invalid-feedback">
                              {errors.barcode}
                            </div>
                          )}
                          <small className="text-muted">
                            Mỗi sản phẩm chỉ có thể có 1 barcode duy nhất. Có thể để trống và thêm sau.
                          </small>
                          {/* Preview barcode */}
                          {product.barcode?.trim() && (
                            <div className="mt-3">
                              <div id="barcode-preview-add" style={{ textAlign: 'center', padding: '10px', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- DANH MỤC --- */}
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Danh mục <span className="text-danger">*</span>
                          </label>
                          <CommonSelect
                            className={`w-100 ${errors.category ? "is-invalid" : ""
                              }`}
                            options={categories}
                            value={selectedCategory}
                            onChange={(opt) => {
                              setSelectedCategory(opt);
                              setSelectedSubCategory(null);
                              setErrors((prev) => ({
                                ...prev,
                                category: "",
                              }));
                            }}
                            placeholder="Chọn danh mục"
                          />
                          {errors.category && (
                            <div className="text-danger small mt-1">
                              {errors.category}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Danh mục con
                          </label>
                          <CommonSelect
                            className={`w-100 ${errors.subCategory ? "is-invalid" : ""
                              }`}
                            options={subCategories}
                            value={selectedSubCategory}
                            onChange={(opt) => {
                              setSelectedSubCategory(opt);
                              setErrors((prev) => ({
                                ...prev,
                                subCategory: "",
                              }));
                            }}
                            placeholder="Chọn danh mục con"
                          />
                          {errors.subCategory && (
                            <div className="text-danger small mt-1">
                              {errors.subCategory}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- ĐƠN VỊ, NCC --- */}
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">Nhà cung cấp <span className="text-danger">*</span></label>
                          <CommonSelect
                            className={`w-100 ${errors.supplier ? "is-invalid" : ""}`}
                            options={suppliers}
                            value={selectedSupplier}
                            onChange={(opt) => {
                              setSelectedSupplier(opt);
                              setErrors((prev) => ({ ...prev, supplier: "" }));
                            }}
                            placeholder="Chọn nhà cung cấp"
                          />
                          {errors.supplier && (
                            <div className="text-danger small mt-1">{errors.supplier}</div>
                          )}

                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Đơn vị
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.unit ? "is-invalid" : ""
                              }`}
                            value={product.unit}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                unit: e.target.value,
                              })
                            }
                          />
                          {errors.unit && (
                            <div className="invalid-feedback">
                              {errors.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- KÍCH THƯỚC --- */}
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-3">
                          <label className="form-label">Kích thước</label>
                          <input
                            type="text"
                            className={`form-control ${errors.dimensions ? "is-invalid" : ""
                              }`}
                            value={product.dimensions}
                            onChange={(e) =>
                              setProduct({
                                ...product,
                                dimensions: e.target.value,
                              })
                            }
                          />
                          {errors.dimensions && (
                            <div className="invalid-feedback">
                              {errors.dimensions}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- MÔ TẢ --- */}
                    <div className="col-lg-12">
                      <div className="summer-description-box">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          className={`form-control ${errors.description ? "is-invalid" : ""
                            }`}
                          rows={5}
                          value={product.description}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              description: e.target.value,
                            })
                          }
                        />
                        {errors.description && (
                          <div className="invalid-feedback">
                            {errors.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- HÌNH ẢNH --- */}
              <div className="accordion-item border mb-4">
                <h2 className="accordion-header" id="headingSpacingThree">
                  <div
                    className="accordion-button collapsed bg-white"
                    data-bs-toggle="collapse"
                    data-bs-target="#SpacingThree"
                    aria-expanded="true"
                    aria-controls="SpacingThree"
                  >
                    <div className="d-flex align-items-center justify-content-between flex-fill">
                      <h5 className="d-flex align-items-center">
                        <i className="feather icon-image text-primary me-2" />
                        <span>Ảnh</span>
                      </h5>
                    </div>
                  </div>
                </h2>
                <div
                  id="SpacingThree"
                  className="accordion-collapse collapse show"
                >
                  <div className="accordion-body border-top">
                    <div className="text-editor add-list add">
                      <div className="col-lg-12">
                        <div className="add-choosen">
                          <div className="mb-3">
                            <div className="image-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setImageFile(file);
                                    setIsImageVisible(true);
                                    setProduct({ ...product, imageUrl: URL.createObjectURL(file) });
                                  }
                                }}
                              />
                              <div className="image-uploads">
                                <i className="feather icon-plus-circle plus-down-add me-0" />
                                <h4>Thêm ảnh</h4>
                              </div>
                            </div>
                          </div>
                          {isImageVisible && product.imageUrl && (
                            <div className="phone-img">
                              <img src={product.imageUrl} alt="product" />
                              <Link to="#">
                                <i
                                  className="feather icon-x x-square-add remove-product"
                                  onClick={handleRemoveProduct}
                                />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- NÚT LƯU --- */}
              <div className="col-lg-12">
                <div className="d-flex align-items-center justify-content-end mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => navigate(route.products)}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang lưu..." : "Thêm sản phẩm"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0 text-gray-9">2025 © SnapBuy.</p>
          <p>
            Thiết kế & Phát triển bởi{" "}
            <Link to="#" className="text-primary">
              G127
            </Link>
          </p>
        </div>
      </div>

      <DeleteModal />
    </>
  );
};

export default AddProduct;
