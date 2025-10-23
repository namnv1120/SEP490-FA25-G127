import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "../../core/modals/pos-modal/posModals";
import CounterTwo from "../../components/counter/counterTwo";
import { getAllProducts } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { category1 } from "../../utils/imagepath";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedGST] = useState(5);
  const [selectedShipping] = useState(40.21);
  const [selectedDiscount] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        console.log("Dữ liệu gốc từ API:", data);

        const mapped = data.map((p, index) => ({
          productId: p.productId || index + 1,
          productCode: p.productCode || p.code || "N/A",
          productName: p.productName || p.name || "N/A",
          imageUrl: p.imageUrl || p.image || "/no-image.png",
          categoryId: p.categoryId || p.category?.id || null,
          categoryName: p.categoryName || p.category?.name || "N/A",
          unitPrice: p.unitPrice ?? p.unit_price ?? 0,
          unitsInStock: p.unitsInStock ?? p.quantity ?? 0,
          supplierName: p.supplierName || p.supplier?.name || "",
        }));

        console.log("Dữ liệu sau khi mapped:", mapped);
        setProducts(mapped);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo danh mục
  useEffect(() => {
    if (activeTab === "all") setFilteredProducts(products);
    else
      setFilteredProducts(products.filter((p) => p.categoryId === activeTab));
  }, [activeTab, products]);

  // Tìm kiếm sản phẩm
  const displayedProducts = filteredProducts.filter((p) =>
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Khi click vào sản phẩm
  const handleAddProduct = (product) => {
    setSelectedProducts((prev) => {
      const exist = prev.find((p) => p.productId === product.productId);
      if (exist) {
        return prev.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Kiểm tra sản phẩm có được chọn không
  const isProductSelected = (id) =>
    selectedProducts.some((p) => p.productId === id);

  // Thay đổi số lượng
  const handleQuantityChange = (productId, value) => {
    setSelectedProducts((prev) => {
      const updated = prev.map((p) =>
        p.productId === productId ? { ...p, quantity: value } : p
      );
      console.log("Cập nhật số lượng:", updated);
      return updated;
    });
  };

  // Xóa sản phẩm
  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId)
    );
  };

  // Tính tổng tiền
  const subTotal = selectedProducts.reduce(
    (sum, p) => sum + (p.unitPrice ?? 0) * (p.quantity ?? 1),
    0
  );
  const taxAmount = (subTotal * selectedGST) / 100;
  const discountAmount = (subTotal * selectedDiscount) / 100;
  const total = subTotal + taxAmount + selectedShipping - discountAmount;

  // Giữ class body
  useEffect(() => {
    document.body.classList.add("pos-page");
    return () => document.body.classList.remove("pos-page");
  }, [location.pathname]);

  const settings = {
    dots: false,
    autoplay: false,
    slidesToShow: 6,
    margin: 0,
    speed: 500,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 6 } },
      { breakpoint: 800, settings: { slidesToShow: 5 } },
      { breakpoint: 776, settings: { slidesToShow: 2 } },
      { breakpoint: 567, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="main-wrapper">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row align-items-start pos-wrapper">
            {/* PRODUCTS */}
            <div className="col-md-12 col-lg-7 col-xl-8">
              <div className="pos-categories tabs_wrapper pb-0">
                <div className="card pos-button">
                  <div className="d-flex align-items-center flex-wrap">
                    <Link
                      to="#"
                      className="btn btn-teal btn-md mb-xs-3"
                      data-bs-toggle="modal"
                      data-bs-target="#orders"
                    >
                      <i className="ti ti-shopping-cart me-1" />
                      Xem đơn hàng
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-md btn-indigo"
                      onClick={() => window.location.reload()}
                    >
                      <i className="ti ti-reload me-1" />
                      Tải lại
                    </Link>
                    {/*
                    <Link
                      to="#"
                      className="btn btn-md btn-info"
                      data-bs-toggle="modal"
                      data-bs-target="#recents"
                    >
                      <i className="ti ti-refresh-dot me-1" />
                      Giao dịch
                    </Link>
                    */}
                  </div>
                </div>

                <h4 className="mb-3">Danh mục sản phẩm</h4>
                <Slider
                  {...settings}
                  className="tabs owl-carousel pos-category"
                >
                  <div
                    onClick={() => setActiveTab("all")}
                    className={`owl-item ${
                      activeTab === "all" ? "active" : ""
                    }`}
                  >
                    <Link to="#">
                      <img src={category1} alt="Tất cả" />
                    </Link>
                    <h6>
                      <Link to="#">Tất cả danh mục</Link>
                    </h6>
                    <span>{categories.length} mục</span>
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat.categoryId}
                      onClick={() => setActiveTab(cat.categoryId)}
                      className={`owl-item ${
                        activeTab === cat.categoryId ? "active" : ""
                      }`}
                    >
                      <h6 className="text-center">{cat.categoryName}</h6>
                      <span>
                        {
                          products.filter(
                            (p) => p.categoryId === cat.categoryId
                          ).length
                        }{" "}
                        sản phẩm
                      </span>
                    </div>
                  ))}
                </Slider>

                <div className="pos-products">
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="mb-3">Sản phẩm</h4>
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {displayedProducts.length > 0 ? (
                      displayedProducts.map((product) => (
                        <div
                          key={product.productId}
                          className="col-sm-6 col-md-6 col-lg-4 col-xl-3"
                        >
                          <div
                            className={`product-info card ${
                              isProductSelected(product.productId)
                                ? "highlight"
                                : ""
                            }`}
                            onClick={() => handleAddProduct(product)}
                          >
                            <Link to="#" className="pro-img">
                              <img
                                src={product.imageUrl}
                                alt={product.productName}
                              />
                            </Link>
                            <h6 className="product-name">
                              <Link to="#">{product.productName}</Link>
                            </h6>
                            <div className="d-flex align-items-center justify-content-between price">
                              <span>
                                {product.unitsInStock
                                  ? `${product.unitsInStock} SP`
                                  : "Hết hàng"}
                              </span>
                              <p>{product.unitPrice.toLocaleString()}₫</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-5">
                        Không có sản phẩm nào để hiển thị.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER DETAILS */}
            <div className="col-md-12 col-lg-5 col-xl-4 ps-0 theiaStickySidebar">
              <aside className="product-order-list">
                <div className="order-head bg-light d-flex align-items-center justify-content-between w-100">
                  <div>
                    <h3>Order List</h3>
                  </div>
                  <div>
                    <Link
                      className="link-danger fs-16"
                      to="#"
                      onClick={() => setSelectedProducts([])}
                    >
                      <i className="ti ti-trash-x-filled" />
                    </Link>
                  </div>
                </div>

                {/* Customer input */}
                <div className="customer-info block-section">
                  <h4 className="mb-3">Customer Information</h4>
                  <div className="input-block d-flex align-items-center">
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập số điện thoại khách hàng"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                      />
                    </div>
                    <Link
                      to="#"
                      className="btn btn-primary btn-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#create"
                    >
                      <i className="feather icon-user-plus feather-16" />
                    </Link>
                  </div>
                </div>

                {/* Product Added */}
                <div className="product-added block-section">
                  <div className="head-text d-flex align-items-center justify-content-between">
                    <h5 className="d-flex align-items-center mb-0">
                      Product Added
                      <span className="count">{selectedProducts.length}</span>
                    </h5>
                    <Link
                      to="#"
                      className="d-flex align-items-center link-danger"
                      onClick={() => setSelectedProducts([])}
                    >
                      <span className="me-2">
                        <i className="feather icon-x feather-16" />
                      </span>
                      Clear all
                    </Link>
                  </div>

                  <div className="product-wrap">
                    {selectedProducts.length === 0 ? (
                      <div className="empty-cart">
                        <div className="fs-24 mb-1">
                          <i className="ti ti-shopping-cart" />
                        </div>
                        <p className="fw-bold">No Products Selected</p>
                      </div>
                    ) : (
                      selectedProducts.map((product) => (
                        <div
                          key={product.productCode}
                          className="product-list align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center product-info">
                            <Link to="#" className="pro-img">
                              <img
                                src={product.imageUrl || "/no-image.png"}
                                alt={product.productName}
                              />
                            </Link>
                            <div className="info">
                              <span>{product.productCode}</span>
                              <h6>{product.productName}</h6>
                              <p className="fw-bold text-teal">
                                {(
                                  product.unitPrice ??
                                  product.unit_price ??
                                  0
                                ).toLocaleString()}
                                ₫
                              </p>
                            </div>
                          </div>
                          <div className="qty-item text-center">
                            <CounterTwo
                              defaultValue={product.quantity}
                              onChange={(val) =>
                                handleQuantityChange(product.productId, val)
                              }
                            />
                          </div>
                          <div className="d-flex align-items-center action">
                            <Link
                              className="btn-icon edit-icon me-1"
                              to="#"
                              onClick={() => setEditingProduct(product)}
                              data-bs-toggle="modal"
                              data-bs-target="#edit-product"
                            >
                              <i className="feather icon-edit feather-14" />
                            </Link>
                            <Link
                              className="btn-icon delete-icon"
                              to="#"
                              onClick={() => removeProduct(product.productCode)}
                            >
                              <i className="feather icon-trash-2 feather-14" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Order Total */}
                <div className="block-section">
                  <div className="order-total">
                    <table className="table table-responsive table-borderless">
                      <tbody>
                        <tr>
                          <td>Sub Total</td>
                          <td className="text-end">
                            {subTotal.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td>Tax (GST {selectedGST}%)</td>
                          <td className="text-end">
                            {taxAmount.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td className="text-danger">
                            Discount ({selectedDiscount}%)
                          </td>
                          <td className="text-danger text-end">
                            -{discountAmount.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Total</td>
                          <td className="text-end fw-bold text-success">
                            {total.toLocaleString()}₫
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="block-section payment-method">
                  <h4>Payment Method</h4>
                  <div className="row align-items-center justify-content-center methods g-3">
                    <div className="col-sm-6 col-md-4">
                      <Link
                        to="#"
                        className="payment-item"
                        data-bs-toggle="modal"
                        data-bs-target="#scan-payment"
                      >
                        <i className="ti ti-scan fs-18" />
                        <span>Scan</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="btn-row d-sm-flex align-items-center justify-content-between">
                  <Link
                    to="#"
                    className="btn btn-purple d-flex align-items-center justify-content-center flex-fill"
                    data-bs-toggle="modal"
                    data-bs-target="#hold-order"
                  >
                    <i className="ti ti-player-pause me-1" />
                    Hold
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-danger d-flex align-items-center justify-content-center flex-fill"
                  >
                    <i className="ti ti-trash me-1" />
                    Void
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-success d-flex align-items-center justify-content-center flex-fill"
                    data-bs-toggle="modal"
                    data-bs-target="#payment-completed"
                  >
                    <i className="ti ti-cash-banknote me-1" />
                    Payment
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <PosModals />
    </div>
  );
};

export default Pos;
