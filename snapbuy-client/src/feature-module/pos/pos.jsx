import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "../../core/modals/pos-modal/posModals";
import CounterTwo from "../../components/counter/counterTwo";
import { getAllProducts } from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import { category1 } from "../../utils/imagepath";
import { getCustomerByPhone } from "../../services/customerService";
import orderService from "../../services/orderService";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGST] = useState(5);
  const [selectedDiscount] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const location = useLocation();
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        const mapped = (data || []).map((c, index) => ({
          categoryId: c.category_id ?? c.categoryId ?? c.id ?? `cat-${index}`,
          categoryName:
            c.category_name ?? c.categoryName ?? c.name ?? "No name",
          description: c.description ?? c.desc ?? "",
          parentCategoryId: c.parent_category_id ?? c.parentCategoryId ?? null,
          active: c.active ?? true,
        }));
        setCategories(mapped);
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredProducts(products);
    } else {
      const childIds = categories
        .filter((c) => c.parentCategoryId === activeTab)
        .map((c) => c.categoryId);
      if (childIds.length === 0) {
        setFilteredProducts(products.filter((p) => p.categoryId === activeTab));
      } else {
        setFilteredProducts(
          products.filter((p) => childIds.includes(p.categoryId))
        );
      }
    }
  }, [activeTab, products, categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();
        const mapped = data.map((p, index) => ({
          productId: p.productId || index + 1,
          productCode: p.productCode || p.code || "Không có",
          productName: p.productName || p.name || "Không có",
          imageUrl: p.imageUrl || p.image || "/no-image.png",
          categoryId: p.categoryId || p.category?.id || null,
          categoryName: p.categoryName || p.category?.name || "Không có",
          unitPrice: p.unitPrice ?? p.unit_price ?? 0,
          unitsInStock:
            p.unitsInStock ??
            p.quantityInStock ??
            p.soLuongTon ??
            p.inventoryQuantity ??
            p.stock ??
            0,
          supplierName: p.supplierName || p.supplier?.name || "",
        }));
        setProducts(mapped);
      } catch (err) {
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.categoryId === activeTab));
    }
  }, [activeTab, products]);

  const displayedProducts = filteredProducts.filter((p) =>
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const isProductSelected = (id) =>
    selectedProducts.some((p) => p.productId === id);

  const handleQuantityChange = (productId, value) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: value } : p
      )
    );
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productCode !== productId)
    );
  };

  const subTotal = selectedProducts.reduce(
    (sum, p) => sum + (p.unitPrice ?? 0) * (p.quantity ?? 1),
    0
  );
  const taxAmount = (subTotal * selectedGST) / 100;
  const discountAmount = (subTotal * selectedDiscount) / 100;
  const total = subTotal + taxAmount - discountAmount;

  useEffect(() => {
    document.body.classList.add("pos-page");
    return () => document.body.classList.remove("pos-page");
  }, [location.pathname]);

  const customerRef = useRef(null);

  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    setCustomerInput(value);

    if (!value) {
      setCustomerSuggestions([]);
      setSelectedCustomer(null);
      return;
    }

    try {
      const result = await getCustomerByPhone(value);
      const customer = result?.result || result;

      if (customer && customer.phone?.includes(value)) {
        setCustomerSuggestions([customer]);
      } else {
        setCustomerSuggestions([]);
      }
    } catch (err) {
      console.error("Lỗi khi tìm khách hàng:", err);
      setCustomerSuggestions([]);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(customer.phone);
    setCustomerSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setCustomerSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tạo đơn hàng
  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn sản phẩm trước khi tạo đơn!");
      return;
    }

    try {
      const employeeId = "00000000-0000-0000-0000-000000000002";

      const orderData = {
        employeeId,
        orderDate: new Date().toISOString(),
        createdBy: username || "POS User",
        status: "PENDING",
        subTotal,
        discountAmount: discountAmount || 0,
        total,
        notes: orderNotes || "",
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: Number(p.quantity),
          price: Number(p.unitPrice),
        })),
      };

      console.log("📦 Dữ liệu gửi lên backend:", orderData);
      const createdOrder = await orderService.createOrder(orderData);

      console.log("✅ Đơn hàng tạo thành công:", createdOrder);
      alert("✅ Tạo đơn hàng thành công!");
      setOrderCreated(true);
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn hàng:", error);
      if (error.response) {
        alert(
          `Tạo đơn thất bại: ${
            error.response.data.message || "Lỗi không xác định"
          }`
        );
      } else {
        alert("Không thể kết nối đến máy chủ, vui lòng thử lại.");
      }
    }
  };

  const settings = {
    dots: false,
    arrows: true,
    autoplay: false,
    slidesToShow: 6,
    slidesToScroll: 1,
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
                  </div>
                </div>

                <h4 className="mb-3">Danh mục sản phẩm</h4>
                <Slider
                  {...settings}
                  className="tabs owl-carousel pos-category"
                >
                  {/* Tất cả danh mục */}
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

                  {/* Danh mục con */}
                  {categories
                    .filter(
                      (cat) =>
                        cat.parentCategoryId !== null &&
                        categories.some(
                          (parent) => parent.categoryId === cat.parentCategoryId
                        )
                    )
                    .map((cat) => (
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
                            } ${
                              product.unitsInStock === 0 ? "out-of-stock" : ""
                            }`}
                            onClick={() => {
                              if (product.unitsInStock > 0) {
                                handleAddProduct(product);
                              } else {
                                alert("Sản phẩm này đã hết hàng!");
                              }
                            }}
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
                              {product.unitsInStock > 0 ? (
                                <span>{`${product.unitsInStock} SP`}</span>
                              ) : (
                                <span className="text-danger fw-bold">
                                  Hết hàng
                                </span>
                              )}
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
                    <h3>Danh sách đặt hàng</h3>
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
                <div
                  className="customer-info block-section"
                  ref={customerRef}
                  style={{ position: "relative" }}
                >
                  <h4 className="mb-3">Thông tin khách hàng</h4>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ position: "relative" }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập số điện thoại khách hàng..."
                      value={customerInput}
                      onChange={handleCustomerInput}
                      autoComplete="off"
                    />

                    <Link
                      to="#"
                      className="btn btn-primary btn-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#create"
                      title="Thêm khách hàng mới"
                    >
                      <i className="feather icon-user-plus feather-16" />
                    </Link>
                  </div>

                  {/* Danh sách gợi ý */}
                  {customerSuggestions.length > 0 && (
                    <ul
                      className="list-group position-absolute w-100 shadow-sm rounded mt-1"
                      style={{
                        zIndex: 1000,
                        background: "#fff",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {customerSuggestions.map((c) => (
                        <li
                          key={c.customerId}
                          className="list-group-item list-group-item-action"
                          onClick={() => selectCustomer(c)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="fw-semibold">{c.fullName}</div>
                          <div className="text-muted small">{c.phone}</div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Thông tin khách hàng được chọn */}
                  {selectedCustomer && (
                    <div className="mt-3 p-2 rounded border bg-light">
                      <div>
                        <strong>Tên:</strong> {selectedCustomer.fullName}
                      </div>
                      <div>
                        <strong>SĐT:</strong> {selectedCustomer.phone}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Added */}
                <div className="product-added block-section">
                  <div className="head-text d-flex align-items-center justify-content-between">
                    <h5 className="d-flex align-items-center mb-0">
                      Sản phẩm đã thêm
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
                      Xóa tất cả
                    </Link>
                  </div>

                  <div className="product-wrap">
                    {selectedProducts.length === 0 ? (
                      <div className="empty-cart">
                        <div className="fs-24 mb-1">
                          <i className="ti ti-shopping-cart" />
                        </div>
                        <p className="fw-bold">Không sản phẩm nào được chọn</p>
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
                          <td>Tổng tiền hàng</td>
                          <td className="text-end">
                            {subTotal.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td>Thuế ({selectedGST}%)</td>
                          <td className="text-end">
                            {taxAmount.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td className="text-danger">
                            Giảm giá ({selectedDiscount}%)
                          </td>
                          <td className="text-danger text-end">
                            -{discountAmount.toLocaleString()}₫
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Tổng thanh toán</td>
                          <td className="text-end fw-bold text-success">
                            {total.toLocaleString()}₫
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Methods */}
                {orderCreated && (
                  <div className="block-section payment-method">
                    <h4>Phương thức thanh toán</h4>
                    <div className="row align-items-center justify-content-center methods g-3">
                      <div className="col-sm-6 col-md-4">
                        <Link
                          to="#"
                          className="payment-item"
                          data-bs-toggle="modal"
                          data-bs-target="#payment-cash"
                        >
                          <i className="ti ti-cash-banknote fs-18" />
                          <span>Tiền mặt</span>
                        </Link>
                      </div>
                      <div className="col-sm-6 col-md-4">
                        <Link
                          to="#"
                          className="payment-item"
                          data-bs-toggle="modal"
                          data-bs-target="#scan-payment"
                        >
                          <i className="ti ti-scan fs-18" />
                          <span>Quét mã</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="btn-row d-sm-flex align-items-center justify-content-between">
                  {!orderCreated ? (
                    <Link
                      to="#"
                      className="btn btn-primary d-flex align-items-center justify-content-center flex-fill"
                      onClick={handleCreateOrder}
                    >
                      <i className="ti ti-file-plus me-1" />
                      Tạo đơn
                    </Link>
                  ) : (
                    <Link
                      to="#"
                      className="btn btn-success d-flex align-items-center justify-content-center flex-fill"
                      data-bs-toggle="modal"
                      data-bs-target="#select-payment-method"
                    >
                      <i className="ti ti-cash-banknote me-1" />
                      Thanh toán
                    </Link>
                  )}
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
