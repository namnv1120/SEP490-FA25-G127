import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "../../core/modals/pos/PosModals";
import CounterTwo from "../../components/counter/counterTwo";
import CommonSelect from "../../components/select/common-select";
import { Spin, message } from "antd";
import { getAllCategories } from "../../services/CategoryService";
import { getAllProducts } from "../../services/ProductService";
import { getAllCustomers } from "../../services/CustomerService";
import { createOrder } from "../../services/orderService";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const Location = useLocation();
  const [showAlert1, setShowAlert1] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGST, setSelectedGST] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const settings = {
    dots: false,
    autoplay: false,
    slidesToShow: 6,
    margin: 0,
    speed: 500,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const gstOptions = [
    { value: "choose", label: "Chọn" },
    { value: "gst5", label: "GST 5%" },
    { value: "gst10", label: "GST 10%" },
    { value: "gst15", label: "GST 15%" },
    { value: "gst20", label: "GST 20%" },
    { value: "gst25", label: "GST 25%" },
    { value: "gst30", label: "GST 30%" },
  ];

  const numericOptions = [
    { value: "0", label: "0" },
    { value: "15", label: "15" },
    { value: "20", label: "20" },
    { value: "25", label: "25" },
    { value: "30", label: "30" },
  ];

  const percentageOptions = [
    { value: "0%", label: "0%" },
    { value: "10%", label: "10%" },
    { value: "15%", label: "15%" },
    { value: "20%", label: "20%" },
    { value: "25%", label: "25%" },
    { value: "30%", label: "30%" },
  ];

  // Fetch data from API
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      // Filter only active categories and parent categories (for POS)
      const parentCategories = data
        .filter(cat => cat.active && (!cat.parentCategoryId || cat.parentCategoryId === null))
        .map(cat => ({
          id: cat.categoryId,
          name: cat.categoryName,
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
        }));
      setCategories(parentCategories);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      // Map products data
      const mappedProducts = data
        .filter(product => product.active)
        .map(product => ({
          id: product.productId,
          productId: product.productId,
          name: product.productName,
          productName: product.productName,
          code: product.productCode,
          productCode: product.productCode,
          price: product.sellingPrice || product.price || 0,
          stock: product.stockQuantity || product.quantity || 0,
          categoryId: product.categoryId,
          categoryName: product.categoryName || "",
          image: product.imageUrl || product.image || null,
        }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      const mappedCustomers = data.map(customer => ({
        value: customer.customerId,
        label: `${customer.customerName} - ${customer.phone || ""}`,
        customerId: customer.customerId,
        customerName: customer.customerName,
      }));
      setCustomerOptions([
        { value: null, label: "Khách lẻ" },
        ...mappedCustomers
      ]);
    } catch (error) {
      console.error("Lỗi khi tải khách hàng:", error);
      message.warning("Không thể tải danh sách khách hàng");
    }
  };

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      const productInfo = target.closest(".product-info");

      if (productInfo) {
        productInfo.classList.toggle("active");

        const hasActive =
          document.querySelectorAll(".product-info.active").length > 0;

        const emptyCart = document.querySelector(
          ".product-wrap .empty-cart"
        );
        const productList = document.querySelector(
          ".product-wrap .product-list"
        );

        if (hasActive) {
          if (emptyCart) emptyCart.style.display = "none";
          if (productList) productList.style.display = "block";
        } else {
          if (emptyCart) emptyCart.style.display = "flex";
          if (productList) productList.style.display = "none";
        }
      }
    };

    document.addEventListener("click", handleClick);
    document.body.classList.add("pos-page");

    return () => {
      document.removeEventListener("click", handleClick);
      document.body.classList.remove("pos-page");
    };
  }, [Location.pathname, showAlert1]);

  // Handle add product to cart
  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.productId === product.productId);
    
    if (existingItem) {
      // If product already in cart, increase quantity
      setCartItems(cartItems.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      message.success("Đã tăng số lượng sản phẩm");
    } else {
      // Add new product to cart
      const cartItem = {
        id: product.productId,
        productId: product.productId,
        name: product.name,
        code: product.code,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        image: product.image,
        categoryName: product.categoryName,
      };
      setCartItems([...cartItems, cartItem]);
      message.success("Đã thêm sản phẩm vào giỏ hàng");
    }
  };

  // Handle update cart item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchCategory = activeTab === "all" || product.categoryId === activeTab;
    const matchSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const calculateTotals = () => {
    const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Calculate tax based on selected GST
    const taxRate = selectedGST && selectedGST !== "choose" 
      ? parseFloat(selectedGST.replace('gst', '')) / 100 
      : 0;
    const tax = subTotal * taxRate;
    const shipping = selectedShipping ? parseFloat(selectedShipping) : 0;
    const discount = selectedDiscount && selectedDiscount !== "0%" 
      ? (subTotal * parseFloat(selectedDiscount.replace('%', '')) / 100) 
      : 0;
    const total = subTotal + tax + shipping - discount;
    return { subTotal, tax, shipping, discount, total };
  };

  const totals = calculateTotals();

  // Handle payment
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      const orderData = {
        customerId: selectedCustomer || null,
        orderItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        subTotal: totals.subTotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount,
        total: totals.total,
        paymentMethod: "CASH", // Will be set from payment modal
        status: "COMPLETED",
      };

      await createOrder(orderData);
      message.success("Thanh toán thành công!");
      // Clear cart after successful payment
      setCartItems([]);
      setSelectedCustomer(null);
      setSelectedDiscount(null);
      setSelectedGST(null);
      setSelectedShipping(null);
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      message.error("Thanh toán thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="main-wrapper">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row align-items-start pos-wrapper">
            {/* Products */}
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
                      data-bs-toggle="modal"
                      data-bs-target="#reset"
                    >
                      <i className="ti ti-reload me-1" />
                      Đặt lại
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-md btn-info"
                      data-bs-toggle="modal"
                      data-bs-target="#recents"
                    >
                      <i className="ti ti-refresh-dot me-1" />
                      Giao dịch
                    </Link>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <h4 className="mb-3">Danh mục</h4>
                </div>
                {loading ? (
                  <div className="text-center py-4">
                    <Spin size="large" />
                  </div>
                ) : (
                  <Slider
                    {...settings}
                    className="tabs owl-carousel pos-category"
                  >
                    <div
                      onClick={() => setActiveTab("all")}
                      className={`owl-item ${activeTab === "all" ? "active" : ""}`}
                      id="all"
                    >
                      <Link to="#">
                        <div className="category-placeholder">Tất cả</div>
                      </Link>
                      <h6>
                        <Link to="#">Tất cả</Link>
                      </h6>
                      <span>{products.length} Sản phẩm</span>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => setActiveTab(category.id)}
                        className={`owl-item ${activeTab === category.id ? "active" : ""}`}
                        id={category.id}
                      >
                        <Link to="#">
                          <div className="category-placeholder">{category.name}</div>
                        </Link>
                        <h6>
                          <Link to="#">{category.name}</Link>
                        </h6>
                        <span>
                          {products.filter(p => p.categoryId === category.id).length} Sản phẩm
                        </span>
                      </div>
                    ))}
                  </Slider>
                )}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="tabs_container">
                    <div
                      className={`tab_content ${activeTab === "all" ? "active" : ""} `}
                      data-tab="all"
                    >
                      {loading ? (
                        <div className="text-center py-4">
                          <Spin size="large" />
                        </div>
                      ) : (
                        <div className="row">
                          {filteredProducts.length === 0 ? (
                            <div className="col-12 text-center py-4">
                              <p>Không có sản phẩm nào</p>
                            </div>
                          ) : (
                            filteredProducts.map((product) => (
                              <div key={product.id} className="col-sm-6 col-md-6 col-lg-4 col-xl-3">
                                <div
                                  className="product-info card"
                                  onClick={() => handleAddToCart(product)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Link to="#" className="pro-img" onClick={(e) => e.preventDefault()}>
                                    <div className="product-image-placeholder">
                                      {product.image ? (
                                        <img src={product.image} alt={product.name} />
                                      ) : (
                                        <span>Không có hình ảnh</span>
                                      )}
                                    </div>
                                    <span>
                                      <i className="ti ti-circle-check-filled" />
                                    </span>
                                  </Link>
                                  <h6 className="cat-name">
                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                      {product.categoryName || "Danh mục"}
                                    </Link>
                                  </h6>
                                  <h6 className="product-name">
                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                      {product.name}
                                    </Link>
                                  </h6>
                                  <div className="d-flex align-items-center justify-content-between price">
                                    <span>{product.stock || 0} Cái</span>
                                    <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Products */}
            {/* Order Details */}
            <div className="col-md-12 col-lg-5 col-xl-4 ps-0 theiaStickySidebar">
              <aside className="product-order-list">
                <div className="order-head bg-light d-flex align-items-center justify-content-between w-100">
                  <div>
                    <h3>Danh sách đơn hàng</h3>
                    <span>Mã giao dịch : #{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div>
                    <Link 
                      className="link-danger fs-16" 
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCartItems([]);
                        message.info("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
                      }}
                    >
                      <i className="ti ti-trash-x-filled" />
                    </Link>
                  </div>
                </div>
                <div className="customer-info block-section">
                  <h4 className="mb-3">Thông tin khách hàng</h4>
                  <div className="input-block d-flex align-items-center">
                    <div className="flex-grow-1">
                      <CommonSelect
                        className="w-100"
                        options={customerOptions}
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.value)}
                        placeholder="Chọn khách hàng"
                        filter={true}
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
                <div className="product-added block-section">
                  <div className="head-text d-flex align-items-center justify-content-between">
                    <h5 className="d-flex align-items-center mb-0">
                      Sản phẩm đã thêm<span className="count">{cartItems.length}</span>
                    </h5>
                    {cartItems.length > 0 && (
                      <Link
                        to="#"
                        className="d-flex align-items-center link-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          setCartItems([]);
                          message.info("Đã xóa tất cả sản phẩm");
                        }}
                      >
                        <span className="me-2">
                          <i className="feather icon-x feather-16" />
                        </span>
                        Xóa tất cả
                      </Link>
                    )}
                  </div>
                  <div className="product-wrap">
                    {cartItems.length === 0 ? (
                      <div className="empty-cart">
                        <div className="fs-24 mb-1">
                          <i className="ti ti-shopping-cart" />
                        </div>
                        <p className="fw-bold">Chưa có sản phẩm nào</p>
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.id} className="product-list align-items-center justify-content-between">
                          <div
                            className="d-flex align-items-center product-info"
                            data-bs-toggle="modal"
                            data-bs-target="#products"
                          >
                            <Link to="#" className="pro-img" onClick={(e) => e.preventDefault()}>
                              <div className="product-image-placeholder">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} />
                                ) : (
                                  <span>Không có hình ảnh</span>
                                )}
                              </div>
                            </Link>
                            <div className="info">
                              <span>{item.code || "N/A"}</span>
                              <h6>
                                <Link to="#" onClick={(e) => e.preventDefault()}>{item.name}</Link>
                              </h6>
                              <p className="fw-bold text-teal">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                              </p>
                            </div>
                          </div>
                          <div className="qty-item text-center">
                            <CounterTwo 
                              defaultValue={item.quantity} 
                              onChange={(value) => handleUpdateQuantity(item.id, value)}
                            />
                          </div>
                          <div className="d-flex align-items-center action">
                            <Link
                              className="btn-icon delete-icon"
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCartItems(cartItems.filter(i => i.id !== item.id));
                                message.success("Đã xóa sản phẩm khỏi giỏ hàng");
                              }}
                            >
                              <i className="feather icon-trash-2 feather-14" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="block-section">
                  <div className="selling-info">
                    <div className="row g-3">
                      <div className="col-12 col-sm-4">
                        <div>
                          <label className="form-label">Thuế đơn hàng</label>
                          <CommonSelect
                            className="w-100"
                            options={gstOptions}
                            value={selectedGST}
                            onChange={(e) => setSelectedGST(e.value)}
                            placeholder="Chọn thuế"
                            filter={false}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div>
                          <label className="form-label">Phí vận chuyển</label>
                          <CommonSelect
                            className="w-100"
                            options={numericOptions}
                            value={selectedShipping}
                            onChange={(e) => setSelectedShipping(e.value)}
                            placeholder="Chọn phí"
                            filter={false}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div>
                          <label className="form-label">Giảm giá</label>
                          <CommonSelect
                            className="w-100"
                            options={percentageOptions}
                            value={selectedDiscount}
                            onChange={(e) => setSelectedDiscount(e.value)}
                            placeholder="Chọn giảm giá"
                            filter={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="order-total">
                    <table className="table table-responsive table-borderless">
                      <tbody>
                        <tr>
                          <td>Tạm tính</td>
                          <td className="text-end">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.subTotal)}
                          </td>
                        </tr>
                        <tr>
                          <td>Thuế (GST)</td>
                          <td className="text-end">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.tax)}
                          </td>
                        </tr>
                        <tr>
                          <td>Phí vận chuyển</td>
                          <td className="text-end">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.shipping)}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-danger">Giảm giá</td>
                          <td className="text-danger text-end">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.discount)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Tổng cộng</td>
                          <td className="text-end fw-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
                        data-bs-target="#payment-card"
                      >
                        <i className="ti ti-credit-card fs-18" />
                        <span>Thẻ</span>
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
                <div className="btn-block">
                  <Link className="btn btn-secondary w-100" to="#" onClick={(e) => e.preventDefault()}>
                    Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.total)}
                  </Link>
                </div>
                <div className="btn-row d-sm-flex align-items-center justify-content-between">
                  <Link
                    to="#"
                    className="btn btn-purple d-flex align-items-center justify-content-center flex-fill"
                    data-bs-toggle="modal"
                    data-bs-target="#hold-order"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="ti ti-player-pause me-1" />
                    Giữ đơn
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-danger d-flex align-items-center justify-content-center flex-fill"
                    onClick={(e) => {
                      e.preventDefault();
                      setCartItems([]);
                      message.info("Đã hủy đơn hàng");
                    }}
                  >
                    <i className="ti ti-trash me-1" />
                    Hủy
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-success d-flex align-items-center justify-content-center flex-fill"
                    data-bs-toggle="modal"
                    data-bs-target="#payment-completed"
                    onClick={(e) => {
                      e.preventDefault();
                      if (cartItems.length === 0) {
                        message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
                      }
                    }}
                  >
                    <i className="ti ti-cash-banknote me-1" />
                    Thanh toán
                  </Link>
                </div>
              </aside>
            </div>
            {/* /Order Details */}
          </div>
        </div>
      </div>
      <PosModals />
    </div>
  );
};

export default Pos;

