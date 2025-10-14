import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getProductById, updateProduct } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";


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

  // 🔹 Lấy danh sách Category từ server
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
        console.error("❌ Lỗi tải subcategory:", err);
      }
    };

    if (selectedCategory) {
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);


  // 🔹 Lấy chi tiết sản phẩm
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
          ? selectedSubCategory.value // Nếu có subcategory thì lấy ID con
          : selectedCategory?.value,  // Nếu không thì lấy category cha
        unit: product?.unit || "",
        supplierName: product?.supplierName || "",
        dimensions: product?.dimensions || "",
        description: product?.description || "",
      };


      await updateProduct(id, updatedProduct);

      alert("Cập nhật sản phẩm thành công!");
      navigate(route.productlist);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      alert("❌ Cập nhật thất bại!");
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
                <h4>New Product</h4>
                <h6>Create new product</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <RefreshIcon />
              <CollapesIcon />
              <li>
                <div className="page-btn">
                  <Link to={route.productlist} className="btn btn-secondary">
                    <i className="feather icon-arrow-left me-2" />
                    Back to Product
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
                            <span>Product Information</span>
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
                                Product Code
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
                                Product Name
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
                                  Category
                                  <span className="text-danger ms-1">*</span>
                                </label>
                              </div>
                              <CommonSelect
                                className="w-100"
                                options={categories}
                                value={selectedCategory}
                                onChange={(e) => {
                                  setSelectedCategory(e.value);
                                  setSelectedSubCategory(null);
                                  setProduct((prev) => ({
                                    ...prev,
                                    categoryId: e.value?.value || null,
                                  }));
                                }}
                                placeholder="Choose Category"
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Sub Category
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <CommonSelect
                                className="w-100"
                                options={subCategories}
                                value={selectedSubCategory}
                                onChange={setSelectedSubCategory}
                                placeholder="Choose Sub Category"
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
                                placeholder="Enter unit (e.g., kg, box, piece)"
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Supplier Name
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
                              <label className="form-label">Dimensions</label>
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
                            <label className="form-label">Description</label>
                            <textarea
                              value={product?.description || ""}
                              onChange={(e) =>
                                setProduct({ ...product, description: e.target.value })
                              }
                              className="form-control"
                              rows={5}
                            />
                            <p className="fs-14 mt-1">Maximum 60 Words</p>
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
                  onClick={() => navigate(route.productlist)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-submit"
                  onClick={handleSaveProduct}
                >
                  Save Product
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <DeleteModal />
    </>
  );
};

export default EditProduct;