import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import DeleteModal from "../../components/delete-modal";
import CommonFooter from "../../components/footer/commonFooter";
import CommonSelect from "../../components/select/common-select";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getProductById, updateProduct } from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import { message } from "antd";


const EditProduct = () => {
  const route = all_routes;
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isImageVisible, setIsImageVisible] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        const mainCats = data
          .filter((c) => !c.parentCategoryId)
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));
        setCategories(mainCats);
      } catch (err) {
        console.error("❌ Lỗi tải danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Khi chọn category -> lọc subcategory tương ứng
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllCategories();
        const subs = data
          .filter((c) => c.parentCategoryId && c.parentCategoryId === selectedCategory?.value)
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));

        setSubCategories(subs);
      } catch (err) {
        console.error("❌ Lỗi tải danh mục con:", err);
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

      } catch (error) {
        console.error("❌ Lỗi khi tải sản phẩm:", error);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSaveProduct = async () => {
    try {
      // gom dữ liệu form
      const updatedProduct = {
        productCode: product?.productCode || "",
        productName: product?.productName || "",
        categoryId: selectedSubCategory
          ? selectedSubCategory.value
          : selectedCategory?.value,
        unit: product?.unit || "",
        supplierName: product?.supplierName || "",
        dimensions: product?.dimensions || "",
        description: product?.description || "",
      };


      await updateProduct(id, updatedProduct);

      message.success("Cập nhật sản phẩm thành công!");
      navigate(route.products);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      message.success("Cập nhật thất bại!");
    }
  };

  const handleRemoveProduct = () => setIsImageVisible(false);

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
                              <input
                                type="text"
                                value={product?.supplierName || ""}
                                onChange={(e) => setProduct({ ...product, supplierName: e.target.value })}
                                className="form-control"
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
                            <span>Image</span>
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
                                  <input type="file" />
                                  <div className="image-uploads">
                                    <i className="feather icon-plus-circle plus-down-add me-0" />
                                    <h4>Add Image</h4>
                                  </div>
                                </div>
                              </div>
                              {isImageVisible && (
                                <div className="phone-img">
                                  <img src="" alt="product" />
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