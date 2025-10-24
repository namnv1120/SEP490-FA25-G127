import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd"; 
import { all_routes } from "../../routes/all_routes";
import { createProduct } from "../../services/ProductService";
import { getAllCategories } from "../../services/categoryService";
import CommonSelect from "../../components/select/common-select";
import DeleteModal from "../../components/delete-modal";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";

const AddProduct = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productCode: "",
    productName: "",
    description: "",
    unit: "",
    supplierName: "",
    dimensions: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(true);

  const handleRemoveProduct = () => setIsImageVisible(false);

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
      } catch (error) {
        console.error("❌ Lỗi tải danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllCategories();
        const subs = data
          .filter((c) => c.parentCategoryId === selectedCategory?.value)
          .map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }));
        setSubCategories(subs);
      } catch (error) {
        console.error("❌ Lỗi tải subcategory:", error);
      }
    };

    if (selectedCategory) {
      fetchSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.productCode || !product.productName || !selectedCategory  || !product.unit)  {
      message.warning("Please fill in all required fields (*)");
      return;
    }

    const productData = {
      productCode: product.productCode,
      productName: product.productName,
      description: product.description,
      unit: product.unit,
      dimensions: product.dimensions,
      categoryId: selectedSubCategory
        ? selectedSubCategory.value
        : selectedCategory?.value,
      supplierName: product.supplierName || "",
      active: true,
      imageUrl: "",
    };

    try {
      setIsSubmitting(true);
      const created = await createProduct(productData);
      message.success(`✅ Product "${created.productName}" created successfully!`);
      navigate(route.productlist);
    } catch (error) {
      console.error("❌ Failed to create product:", error);
      const res = error.response?.data;

      if (res?.code === 4000 && res?.message) {
        const messages = res.message.split(";").map(msg => msg.trim()).filter(Boolean);
        messages.forEach(msg => message.error(msg));
      }

      else if (res?.message) {
        message.error(res.message);
      }

      else {
        message.error("Failed to create product. Please try again.");
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
                <h4>Create Product</h4>
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

          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="add-product">
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
                            Product Code<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={product.productCode}
                            onChange={(e) =>
                              setProduct({ ...product, productCode: e.target.value })
                            }
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Product Name<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={product.productName}
                            onChange={(e) =>
                              setProduct({ ...product, productName: e.target.value })
                            }
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Category
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <CommonSelect
                            className="w-100"
                            options={categories}
                            value={selectedCategory}
                            onChange={(selectedOption) => {
                              setSelectedCategory(selectedOption);
                              setSelectedSubCategory(null); 
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
                            Unit<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={product.unit}
                            onChange={(e) =>
                              setProduct({ ...product, unit: e.target.value })
                            }
                            className="form-control"
                            placeholder="Enter unit (e.g., kg, box, piece)"
                          />
                        </div>
                      </div>
                      <div className="col-sm-6 col-12">
                        <div className="mb-3">
                          <label className="form-label">Supplier Name</label>
                          <input
                            type="text"
                            value={product.supplierName}
                            onChange={(e) =>
                              setProduct({ ...product, supplierName: e.target.value })
                            }
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
                            value={product.dimensions}
                            onChange={(e) =>
                              setProduct({ ...product, dimensions: e.target.value })
                            }
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="summer-description-box">
                        <label className="form-label">Description</label>
                        <textarea
                          value={product.description}
                          onChange={(e) =>
                            setProduct({ ...product, description: e.target.value })
                          }
                          className="form-control"
                          rows={5}
                        />
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

              <div className="col-lg-12">
                <div className="d-flex align-items-center justify-content-end mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => navigate(route.productlist)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0 text-gray-9">
            2025 © SnapBuy.
          </p>
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
