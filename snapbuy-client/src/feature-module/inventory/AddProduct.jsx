import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import { createProduct } from "../../services/ProductService";
import Addunits from "../../core/modals/inventory/addunits";
import AddCategory from "../../core/modals/inventory/addcategory";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import DeleteModal from "../../components/delete-modal";
import { Editor } from "primereact/editor";
import CommonSelect from "../../components/select/common-select";

const AddProduct = () => {
  const route = all_routes;
  const navigate = useNavigate();
  
  // State cho form data
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    categoryName: "",
    description: "",
    unitPrice: "",
    unit: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [text, setText] = useState("");

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation cơ bản
    if (!formData.productName || !formData.unitPrice) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setLoading(true);
      
      // Chuẩn bị data để gửi lên API
      const productData = {
        productName: formData.productName,
        productCode: formData.productCode || `PRD${Date.now()}`,
        categoryName: selectedCategory || formData.categoryName,
        description: text || formData.description,
        unitPrice: parseFloat(formData.unitPrice),
        unit: selectedUnit || formData.unit,
        quantity: parseInt(formData.quantity) || 0,
      };

      console.log("📤 Sending product data:", productData);

      // Gọi API tạo sản phẩm
      const response = await createProduct(productData);
      
      console.log("✅ Product created:", response);
      alert("✅ Thêm sản phẩm thành công!");
      
      // Chuyển về trang product list
      navigate(route.productlist);
      
    } catch (error) {
      console.error("❌ Error creating product:", error);
      
      if (error.response) {
        alert(`❌ Lỗi: ${error.response.data.message || "Không thể tạo sản phẩm"}`);
      } else if (error.request) {
        alert("❌ Không thể kết nối đến server. Vui lòng kiểm tra backend!");
      } else {
        alert("❌ Có lỗi xảy ra khi tạo sản phẩm!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Options cho select
  const category = [
    { value: "", label: "Choose" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "food", label: "Food" },
  ];

  const unit = [
    { value: "", label: "Choose" },
    { value: "kg", label: "Kg" },
    { value: "pc", label: "Pc" },
    { value: "box", label: "Box" },
    { value: "liter", label: "Liter" },
  ];

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
              <div className="accordions-items-seperate" id="accordionSpacingExample">
                
                {/* Product Information Section */}
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
                      
                      {/* Product Name & Code */}
                      <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Product Name
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="productName"
                              value={formData.productName}
                              onChange={handleInputChange}
                              placeholder="Enter product name"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Product Code
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="productCode"
                              value={formData.productCode}
                              onChange={handleInputChange}
                              placeholder="Auto-generated if empty"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <div className="add-newplus">
                              <label className="form-label">
                                Category
                                <span className="text-danger ms-1">*</span>
                              </label>
                              <Link
                                to="#"
                                data-bs-toggle="modal"
                                data-bs-target="#add-units-category"
                              >
                                <i className="feather icon-plus-circle plus-down-add" />
                                <span>Add New</span>
                              </Link>
                            </div>
                            <CommonSelect
                              className="w-100"
                              options={category}
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.value)}
                              placeholder="Choose Category"
                              filter={false}
                            />
                          </div>
                        </div>
                        
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Unit
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <CommonSelect
                              className="w-100"
                              options={unit}
                              value={selectedUnit}
                              onChange={(e) => setSelectedUnit(e.value)}
                              placeholder="Choose Unit"
                              filter={false}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price & Quantity */}
                      <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Price
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="unitPrice"
                              value={formData.unitPrice}
                              onChange={handleInputChange}
                              placeholder="0"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Quantity
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description Editor */}
                      <div className="col-lg-12">
                        <div className="summer-description-box">
                          <label className="form-label">Description</label>
                          <Editor
                            value={text}
                            onTextChange={(e) => setText(e.htmlValue)}
                            style={{ height: "200px" }}
                            placeholder="Enter product description..."
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Submit Buttons */}
            <div className="col-lg-12">
              <div className="d-flex align-items-center justify-content-end mb-4">
                <Link 
                  to={route.productlist} 
                  className="btn btn-secondary me-2"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
      
      <Addunits />
      <AddCategory />
      <DeleteModal />
    </>
  );
};

export default AddProduct;