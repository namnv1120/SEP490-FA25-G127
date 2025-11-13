import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { allRoutes } from "../../routes/AllRoutes";
import DeleteModal from "../../components/delete-modal";
import CommonFooter from "../../components/footer/CommonFooter";
import CommonSelect from "../../components/select/common-select";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getProductById, updateProduct } from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import { getAllSuppliers } from "../../services/SupplierService";
import { getImageUrl } from "../../utils/imageUtils";
import { message } from "antd";
import { generateRandomBarcode, downloadBarcode, displayBarcodePreview } from "../../utils/barcodeUtils";


const EditProduct = () => {
  const route = allRoutes;
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

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
      } catch (err) {
        console.error("❌ Lỗi lấy danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

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

  // 🔹 Khi chọn category -> lọc subcategory tương ứng
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllCategories();
        const subs = data
          .filter((c) => c.parentCategoryId && c.parentCategoryId === selectedCategory?.value && (c.active === true || c.active === 1))
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));

        setSubCategories(subs);
      } catch (err) {
        console.error("❌ Lỗi lấy danh mục con:", err);
      }
    };

    if (selectedCategory) {
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);

        setSelectedCategory({
          value: data.parentCategoryId || data.categoryId,
          label: data.parentCategoryName || data.categoryName,
        });

        if (data.parentCategoryId) {
          setSelectedSubCategory({
            value: data.categoryId,
            label: data.categoryName,
          });
        }

        if (data.supplierId) {
          setSelectedSupplier({
            value: data.supplierId,
            label: data.supplierName,
          });
        }

        // Set ảnh preview (nếu có ảnh thì hiển thị ảnh, nếu không có thì hiển thị ảnh mặc định)
        const fullImageUrl = getImageUrl(data.imageUrl);
        setImagePreview(fullImageUrl);
        setIsImageVisible(true);
        // Nếu sản phẩm không có ảnh (imageUrl null hoặc rỗng), đánh dấu là đã xóa ảnh
        setIsImageRemoved(!data.imageUrl || !data.imageUrl.trim());

      } catch (error) {
        console.error("❌ Lỗi lấy thông tin sản phẩm:", error);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Hiển thị barcode preview khi barcode thay đổi
  useEffect(() => {
    if (product?.barcode?.trim()) {
      displayBarcodePreview(product.barcode, 'barcode-preview-edit');
    } else {
      const container = document.getElementById('barcode-preview-edit');
      if (container) {
        container.innerHTML = '';
      }
    }
  }, [product?.barcode]);

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!selectedCategory && !selectedSubCategory) {
        message.error("Vui lòng chọn danh mục!");
        return;
      }

      if (!selectedSupplier?.value) {
        message.error("Vui lòng chọn nhà cung cấp!");
        return;
      }

      if (!product?.productCode?.trim()) {
        message.error("Vui lòng nhập mã sản phẩm!");
        return;
      }

      if (!product?.productName?.trim()) {
        message.error("Vui lòng nhập tên sản phẩm!");
        return;
      }

      // Tạo FormData để gửi dữ liệu (giống AddProduct)
      const formData = new FormData();
      formData.append("productCode", product.productCode.trim());
      formData.append("productName", product.productName.trim());
      formData.append(
        "categoryId",
        selectedSubCategory ? selectedSubCategory.value : selectedCategory.value
      );
      formData.append("supplierId", selectedSupplier.value);

      // Xử lý barcode: nếu có thì gửi, nếu không có thì không gửi (backend sẽ set null)
      if (product.barcode?.trim()) {
        formData.append("barcode", product.barcode.trim());
      }
      if (product.unit?.trim()) {
        formData.append("unit", product.unit.trim());
      }
      if (product.dimensions?.trim()) {
        formData.append("dimensions", product.dimensions.trim());
      }
      if (product.description?.trim()) {
        formData.append("description", product.description.trim());
      }

      // Xử lý ảnh: nếu người dùng xóa ảnh và không chọn ảnh mới, gửi flag removeImage
      if (isImageRemoved && !imageFile) {
        formData.append("removeImage", "true");
      } else if (imageFile) {
        // Nếu có ảnh mới, gửi ảnh mới (và không gửi removeImage)
        formData.append("image", imageFile);
      }

      console.log("📤 Gửi dữ liệu (FormData)");

      await updateProduct(id, formData);

      message.success("Cập nhật sản phẩm thành công!");
      navigate(route.products);
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại! Vui lòng thử lại.";
      message.error(errorMessage);
    }
  };

  const handleRemoveProduct = () => {
    setImageFile(null);
    // Hiển thị ảnh mặc định khi xóa ảnh
    setImagePreview(getImageUrl(null));
    setIsImageVisible(true); // Vẫn hiển thị để người dùng thấy ảnh mặc định
    setIsImageRemoved(true); // Đánh dấu là người dùng đã xóa ảnh
    if (product) {
      setProduct({ ...product, imageUrl: null });
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Sửa sản phẩm</h4>
                <h6>Cập nhật sản phẩm</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <RefreshIcon />
              <CollapesIcon />
              <li>
                <div className="page-btn">
                  <Link to={route.products} className="btn btn-secondary">
                    <i className="feather icon-arrow-left me-2" />
                    Quay lại danh sách sản phẩm
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          <form>
            <div className="card mb-0">
              <div className="card-body add-product pb-0">
                <div className="accordions-items-seperate" id="accordionSpacingExample">
                  {/* Product Information */}
                  <div className="accordion-item border mb-4">
                    <h2 className="accordion-header" id="headingSpacingOne">
                      <div
                        className="accordion-button collapsed bg-white"
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
                      aria-labelledby="headingSpacingOne"
                    >
                      <div className="accordion-body border-top">
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Mã sản phẩm
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={product?.productCode || ""}
                                onChange={(e) => setProduct({ ...product, productCode: e.target.value })}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Tên sản phẩm
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={product?.productName || ""}
                                onChange={(e) => setProduct({ ...product, productName: e.target.value })}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Barcode (tùy chọn)
                              </label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  value={product?.barcode || ""}
                                  onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
                                  className="form-control"
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
                                {product?.barcode?.trim() && (
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
                              <small className="text-muted">
                                Mỗi sản phẩm chỉ có thể có 1 barcode duy nhất. Có thể để trống và thêm sau.
                              </small>
                              {/* Preview barcode */}
                              {product?.barcode?.trim() && (
                                <div className="mt-3">
                                  <div id="barcode-preview-edit" style={{ textAlign: 'center', padding: '10px', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <div className="add-newplus">
                                <label className="form-label">
                                  Danh mục
                                  <span className="text-danger ms-1">*</span>
                                </label>
                              </div>
                              <CommonSelect
                                className="w-100"
                                options={categories}
                                value={selectedCategory}
                                onChange={(selectedOption) => {
                                  setSelectedCategory(selectedOption);
                                  setSelectedSubCategory(null);
                                }}
                                placeholder="Chọn danh mục"
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Danh mục con
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <CommonSelect
                                className="w-100"
                                options={subCategories}
                                value={selectedSubCategory}
                                onChange={setSelectedSubCategory}
                                placeholder="Chọn danh mục con"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Unit
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                value={product?.unit || ""}
                                onChange={(e) => setProduct({ ...product, unit: e.target.value })}
                                className="form-control"
                                placeholder="Điền đơn vị tính (ví dụ: cái, chiếc...)"
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Nhà cung cấp
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <CommonSelect
                                className="w-100"
                                options={suppliers}
                                value={selectedSupplier}
                                onChange={setSelectedSupplier}
                                placeholder="Chọn nhà cung cấp"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">Kích thước</label>
                              <input
                                type="text"
                                value={product?.dimensions || ""}
                                onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="summer-description-box">
                            <label className="form-label">Mô tả</label>
                            <textarea
                              value={product?.description || ""}
                              onChange={(e) =>
                                setProduct({ ...product, description: e.target.value })
                              }
                              className="form-control"
                              rows={5}
                            />
                            <p className="fs-14 mt-1">Tối đa 500 ký tự</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
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
                      aria-labelledby="headingSpacingThree"
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
                                        setIsImageRemoved(false); // Nếu chọn ảnh mới, không xóa ảnh nữa
                                        const previewUrl = URL.createObjectURL(file);
                                        setImagePreview(previewUrl);
                                      }
                                    }}
                                  />
                                  <div className="image-uploads">
                                    <i className="feather icon-plus-circle plus-down-add me-0" />
                                    <h4>Thêm ảnh</h4>
                                  </div>
                                </div>
                              </div>
                              {isImageVisible && imagePreview && (
                                <div className="phone-img">
                                  <img src={imagePreview} alt="product" />
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
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="btn-addproduct mb-4">
                <button
                  type="button"
                  className="btn btn-cancel me-2"
                  onClick={() => navigate(route.products)}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="btn btn-submit"
                  onClick={handleSaveProduct}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        </div>
        <CommonFooter />
      </div>
      <DeleteModal />
    </>
  );
};

export default EditProduct;