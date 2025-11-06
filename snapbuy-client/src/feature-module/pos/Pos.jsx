import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "../../core/modals/pos/PosModals";
import AddCustomerModal from "../../core/modals/pos/AddCustomerModal";
import CounterTwo from "../../components/counter/CounterTwo";
import { Spin, message, Modal } from "antd";
import { getAllCategories } from "../../services/CategoryService";
import { getAllProducts } from "../../services/ProductService";
import { getCustomerById, searchCustomers } from "../../services/CustomerService";
import { createOrder, completeOrder, getOrderById } from "../../services/OrderService";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const Location = useLocation();
  const [showAlert1, setShowAlert1] = useState(true);

  const GUEST_CUSTOMER_ID = "00000000-0000-0000-0000-000000000001";
  const [selectedCustomer, setSelectedCustomer] = useState(GUEST_CUSTOMER_ID);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [customerSearchVisible, setCustomerSearchVisible] = useState(false);
  const [guestCustomer, setGuestCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGST, setSelectedGST] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // "cash" or "momo"
  const [usePoints, setUsePoints] = useState(0); // Số điểm muốn sử dụng
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [completedOrderForPrint, setCompletedOrderForPrint] = useState(null); // Lưu order đã thanh toán để in
  const momoPollingIntervalRef = useRef(null);

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

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchProducts();
      await fetchGuestCustomer(); // Fetch guest customer
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      // Lưu tất cả categories để dùng cho tính toán số lượng
      setAllCategories(data);

      // Chỉ hiển thị parent categories (không có parentCategoryId)
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
          price: product.unitPrice,
          stock: product.quantityInStock,
          quantityInStock: product.quantityInStock, // Thêm field này để dùng cho validation
          categoryId: product.categoryId,
          categoryName: product.categoryName || "",
          image: product.imageUrl || product.image || null,
        }));

      setProducts(mappedProducts);

      // Cập nhật số lượng tồn kho trong giỏ hàng nếu có
      // Sử dụng functional update để tránh stale closure
      setCartItems(prevCartItems => {
        if (prevCartItems.length === 0) return prevCartItems;

        return prevCartItems.map(cartItem => {
          const updatedProduct = mappedProducts.find(p =>
            String(p.productId) === String(cartItem.productId)
          );
          if (updatedProduct) {
            const newStock = updatedProduct.quantityInStock || updatedProduct.stock || 0;
            // Nếu số lượng trong giỏ hàng vượt quá tồn kho mới, điều chỉnh lại
            const adjustedQuantity = Math.min(cartItem.quantity, newStock);
            return {
              ...cartItem,
              stock: newStock,
              quantity: adjustedQuantity
            };
          }
          return cartItem;
        });
      });
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestCustomer = async () => {
    try {
      const guestData = await getCustomerById(GUEST_CUSTOMER_ID);
      setGuestCustomer(guestData);
      setSelectedCustomerData(guestData); // Set as default selected customer
    } catch (error) {
      message.error("Không thể tải thông tin khách lẻ");
    }
  };

  // Hàm tìm kiếm khách hàng theo số điện thoại với debounce
  useEffect(() => {
    if (!customerSearchQuery || customerSearchQuery.trim().length === 0) {
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    // Debounce search: chỉ tìm kiếm sau 300ms khi user ngừng gõ
    const searchTimer = setTimeout(async () => {
      try {
        const results = await searchCustomers(customerSearchQuery);

        // Thêm khách lẻ vào kết quả nếu query match với thông tin khách lẻ
        const queryLower = customerSearchQuery.toLowerCase();
        let finalResults = [...results];

        if (guestCustomer) {
          const guestName = (guestCustomer.fullName || guestCustomer.customerName || "").toLowerCase();
          const guestPhone = (guestCustomer.phone || "").toLowerCase();

          // Kiểm tra nếu query match với tên hoặc số điện thoại của khách lẻ
          if (guestName.includes(queryLower) || guestPhone.includes(queryLower)) {
            // Kiểm tra xem khách lẻ đã có trong results chưa
            const guestInResults = results.some(r => String(r.customerId) === GUEST_CUSTOMER_ID);
            if (!guestInResults) {
              finalResults = [guestCustomer, ...results];
            }
          }
        }

        setCustomerSearchResults(finalResults);
        setShowCustomerDropdown(finalResults.length > 0);
      } catch (error) {
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
      }
    }, 100);

    return () => clearTimeout(searchTimer);
  }, [customerSearchQuery, guestCustomer]);

  const handleCustomerSearch = (query) => {
    setCustomerSearchQuery(query);
  };

  // Hàm chọn khách hàng từ kết quả tìm kiếm
  const handleSelectCustomer = async (customer) => {
    try {
      // Fetch đầy đủ thông tin customer để đảm bảo có phone
      const fullCustomerData = await getCustomerById(customer.customerId);

      setSelectedCustomer(fullCustomerData.customerId);
      setSelectedCustomerData(fullCustomerData);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setUsePoints(0); // Reset điểm sử dụng khi chọn khách hàng mới

      // Nếu chọn khách lẻ, cập nhật guestCustomer
      if (String(fullCustomerData.customerId) === GUEST_CUSTOMER_ID) {
        setGuestCustomer(fullCustomerData);
      }
    } catch (error) {
      message.error("Không thể lấy thông tin khách hàng");
      // Fallback: dùng data từ search result
      setSelectedCustomer(customer.customerId);
      setSelectedCustomerData(customer);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setUsePoints(0); // Reset điểm sử dụng
    }
  };

  // Hàm xử lý khi tạo customer thành công
  const handleCustomerCreated = async (newCustomer) => {
    try {
      // Fetch đầy đủ thông tin customer vừa tạo
      const fullCustomerData = await getCustomerById(newCustomer.customerId);

      // Set customer vừa tạo làm selected
      setSelectedCustomer(fullCustomerData.customerId);
      setSelectedCustomerData(fullCustomerData);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setAddCustomerModalOpen(false);
    } catch (error) {
      // Fallback: dùng data từ newCustomer
      setSelectedCustomer(newCustomer.customerId);
      setSelectedCustomerData(newCustomer);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setAddCustomerModalOpen(false);
    }
  };

  // Hàm mở modal thêm customer (chỉ khi không có kết quả tìm kiếm)
  const handleOpenAddCustomerModal = () => {
    if (customerSearchQuery.trim().length === 0) {
      message.warning("Vui lòng nhập số điện thoại trước");
      return;
    }
    // Chỉ mở modal nếu không có kết quả tìm kiếm
    if (customerSearchResults.length === 0 && customerSearchQuery.trim().length > 0) {
      setAddCustomerModalOpen(true);
    } else {
      message.info("Đã tìm thấy khách hàng, vui lòng chọn từ danh sách");
    }
  };

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      const productInfo = target.closest(".product-info");
      // Bỏ qua nếu click vào product-info trong product-wrap (cart items)
      const isCartItem = target.closest(".product-wrap");

      if (productInfo && !isCartItem) {
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
  const handleAddToCart = (product, e) => {
    // Ngăn chặn event bubbling để không toggle active class
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Validate số lượng tồn kho
    const availableStock = product.stock || product.quantityInStock || 0;
    if (availableStock <= 0) {
      message.error(`Sản phẩm "${product.name || product.productName}" đã hết hàng!`);
      return;
    }

    const existingItem = cartItems.find(item =>
      String(item.productId) === String(product.productId)
    );

    if (existingItem) {
      // If product already in cart, increase quantity
      const newQuantity = existingItem.quantity + 1;
      const currentStock = existingItem.stock || availableStock;

      // Validate số lượng không vượt quá tồn kho
      if (newQuantity > currentStock) {
        message.error(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${currentStock}`);
        return;
      }

      setCartItems(cartItems.map(item =>
        String(item.productId) === String(product.productId)
          ? { ...item, quantity: newQuantity }
          : item
      ));
      message.success("Đã cập nhật số lượng sản phẩm trong giỏ hàng");
    } else {
      // Add new product to cart
      const cartItem = {
        id: product.productId,
        productId: product.productId,
        name: product.name,
        code: product.code,
        price: product.price,
        quantity: 1,
        stock: availableStock,
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
      return;
    }

    // Find the item to validate stock
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    // Validate số lượng không vượt quá tồn kho
    const availableStock = item.stock || 0;
    if (newQuantity > availableStock) {
      message.error(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${availableStock}`);
      // Reset về số lượng tối đa có thể
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: availableStock }
          : cartItem
      ));
      return;
    }

    setCartItems(cartItems.map(cartItem =>
      cartItem.id === itemId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    ));
  };

  // Hàm lấy tất cả category IDs bao gồm parent và sub-categories
  const getCategoryIdsForParent = (parentCategoryId) => {
    if (!parentCategoryId || parentCategoryId === "all") return [];

    // Convert parentCategoryId to string for comparison
    const parentIdStr = String(parentCategoryId);

    // Lấy parent category id (convert to string)
    const categoryIds = [parentIdStr];

    // Lấy tất cả sub-categories của parent
    const subCategories = allCategories.filter(
      cat => {
        const catParentId = cat.parentCategoryId ? String(cat.parentCategoryId) : null;
        return catParentId === parentIdStr && cat.active;
      }
    );

    // Thêm các sub-category IDs (convert to string)
    subCategories.forEach(subCat => {
      categoryIds.push(String(subCat.categoryId));
    });

    return categoryIds;
  };

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    let matchCategory = false;

    if (activeTab === "all") {
      matchCategory = true;
    } else {
      // Lấy tất cả category IDs bao gồm parent và sub-categories
      const categoryIds = getCategoryIdsForParent(activeTab);
      // Convert product.categoryId to string for comparison
      const productCategoryIdStr = product.categoryId ? String(product.categoryId) : null;
      // Sản phẩm khớp nếu categoryId thuộc parent hoặc sub-categories
      matchCategory = productCategoryIdStr && categoryIds.includes(productCategoryIdStr);
    }

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
    const totalBeforePoints = subTotal + tax + shipping - discount;

    // Tính số điểm có thể sử dụng (không vượt quá số điểm hiện có và tổng tiền)
    const currentPoints = selectedCustomerData?.points ?? 0;
    const maxUsablePoints = Math.min(currentPoints, Math.floor(totalBeforePoints));
    const actualUsePoints = Math.min(usePoints, maxUsablePoints);

    const total = Math.max(0, totalBeforePoints - actualUsePoints);
    return { subTotal, tax, shipping, discount, total, pointsUsed: actualUsePoints, totalBeforePoints };
  };

  const totals = calculateTotals();

  // Handle create order - show payment method selection first, then create order
  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    // Validate customer
    const isGuest = String(selectedCustomer) === GUEST_CUSTOMER_ID;
    if (!isGuest && !selectedCustomerData) {
      message.error("Vui lòng chọn khách hàng!");
      return;
    }
    if (!isGuest && (!selectedCustomerData.phone || selectedCustomerData.phone.trim() === "")) {
      message.error("Khách hàng không có số điện thoại. Vui lòng cập nhật thông tin khách hàng.");
      return;
    }

    // Show payment method selection modal first
    setShowPaymentMethodModal(true);
  };

  // Handle payment method selection - create order with selected payment method
  const handleSelectPaymentMethod = async (paymentMethod) => {

    if (cartItems.length === 0) {
      message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      // Get customer phone number
      let customerPhone = "";
      const isGuest = String(selectedCustomer) === GUEST_CUSTOMER_ID;

      if (isGuest) {
        customerPhone = guestCustomer?.phone || "";
      } else {
        if (!selectedCustomerData) {
          message.error("Vui lòng chọn khách hàng!");
          return;
        }
        customerPhone = selectedCustomerData.phone.trim();
      }

      if (!isGuest && (!customerPhone || customerPhone.trim() === "")) {
        message.error("Khách hàng không có số điện thoại. Vui lòng cập nhật thông tin khách hàng.");
        return;
      }

      // Create order with selected payment method
      const orderData = {
        phone: customerPhone || "",
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: 0,
        })),
        discountAmount: totals.discount || 0,
        taxAmount: totals.tax || 0,
        paymentMethod: paymentMethod === "cash" ? null : "MOMO", // null defaults to "Tiền mặt", "MOMO" for MoMo
        notes: null,
        usePoints: totals.pointsUsed || 0,
      };

      message.loading("Đang tạo đơn hàng...", 0);
      const orderResult = await createOrder(orderData);
      message.destroy();

      setCreatedOrder(orderResult);
      setSelectedPaymentMethod(paymentMethod); // Save selected payment method

      // Close payment method selection modal
      setShowPaymentMethodModal(false);
      message.success("Đã tạo đơn hàng thành công!");
      // Cập nhật lại danh sách sản phẩm để refresh số lượng tồn kho
      await fetchProducts();

      // Show payment modal immediately based on selected method (không hiển thị modal thành công khi tạo đơn)
      if (paymentMethod === "cash") {
        setShowCashPaymentModal(true);
      } else if (paymentMethod === "momo") {
        const momoPayUrl = orderResult.payment?.payUrl ||
          (orderResult.payment?.notes?.startsWith("PAYURL:")
            ? orderResult.payment.notes.substring("PAYURL:".length)
            : null);
        if (momoPayUrl) {
          setShowMomoModal(true);
          // Start polling for MoMo payment status
          startMoMoPaymentPolling(orderResult.orderId);
        } else {
          message.error("Không thể tạo link thanh toán MoMo. Vui lòng thử lại!");
        }
      }
    } catch (error) {
      message.destroy();
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Tạo đơn hàng thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  // Handle click on "Thanh toán" button
  const handlePaymentButtonClick = () => {
    if (!createdOrder) {
      message.error("Không tìm thấy đơn hàng. Vui lòng thử lại!");
      return;
    }

    if (selectedPaymentMethod === "cash") {
      setShowCashPaymentModal(true);
    } else if (selectedPaymentMethod === "momo") {
      setShowMomoModal(true);
    } else {
      // If payment method not set, show selection modal
      setShowPaymentMethodModal(true);
    }
  };

  // Handle select order from order list - load order into POS
  const handleSelectOrder = async (orderData) => {
    try {
      // Fetch full order details if needed
      let fullOrderData = orderData;
      if (!orderData.orderDetails) {
        fullOrderData = await getOrderById(orderData.orderId);
      }

      // Load order details into cart
      if (fullOrderData.orderDetails && fullOrderData.orderDetails.length > 0) {
        const cartItemsFromOrder = fullOrderData.orderDetails.map(detail => ({
          id: detail.productId || detail.orderDetailId,
          productId: detail.productId,
          name: detail.productName || "N/A",
          productName: detail.productName || "N/A",
          price: detail.unitPrice || 0,
          quantity: detail.quantity || 0,
          discount: detail.discount || 0,
        }));

        setCartItems(cartItemsFromOrder);
      }

      // Set customer if available
      if (fullOrderData.customerId) {
        setSelectedCustomer(fullOrderData.customerId);
        if (fullOrderData.customer) {
          setSelectedCustomerData(fullOrderData.customer);
        } else {
          // Fetch customer data if not included
          try {
            const customerData = await getCustomerById(fullOrderData.customerId);
            setSelectedCustomerData(customerData);
          } catch (error) {
            // Use guest if customer fetch fails
            setSelectedCustomer(GUEST_CUSTOMER_ID);
            setSelectedCustomerData(guestCustomer);
          }
        }
      }

      // Set this order as createdOrder
      setCreatedOrder(fullOrderData);

      // Extract payment method from order if available
      let paymentMethod = null;
      if (fullOrderData.payment && fullOrderData.payment.paymentMethod) {
        const method = fullOrderData.payment.paymentMethod;
        // Map backend payment method to frontend values
        if (method === "Tiền mặt" || method === "CASH" || method === "Cash") {
          paymentMethod = "cash";
        } else if (method === "MOMO" || method === "Ví điện tử" || method === "MoMo") {
          paymentMethod = "momo";
        }
      }

      // Set payment method
      setSelectedPaymentMethod(paymentMethod);

      message.success("Đã chọn đơn hàng. Vui lòng thanh toán.");
    } catch (error) {
      message.error("Không thể tải đơn hàng vào POS");
    }
  };

  // Handle payment for existing order from order list
  const handleOrderPayment = async (orderData) => {
    try {
      // Set this order as createdOrder
      setCreatedOrder(orderData);

      // Extract payment method from order if available
      let paymentMethod = null;
      if (orderData.payment && orderData.payment.paymentMethod) {
        const method = orderData.payment.paymentMethod;
        // Map backend payment method to frontend values
        if (method === "Tiền mặt" || method === "CASH" || method === "Cash") {
          paymentMethod = "cash";
        } else if (method === "MOMO" || method === "Ví điện tử" || method === "MoMo") {
          paymentMethod = "momo";
        }
      }

      // Set payment method if found, otherwise show selection modal
      if (paymentMethod) {
        setSelectedPaymentMethod(paymentMethod);
        // Show appropriate payment modal based on method
        if (paymentMethod === "cash") {
          setShowCashPaymentModal(true);
        } else if (paymentMethod === "momo") {
          // Extract MoMo payUrl if available
          const momoPayUrl = orderData.payment?.notes?.startsWith("PAYURL:")
            ? orderData.payment.notes.substring("PAYURL:".length)
            : orderData.payment?.payUrl || null;
          if (momoPayUrl) {
            setShowMomoModal(true);
            // Start polling for MoMo payment status
            startMoMoPaymentPolling(orderData.orderId);
          } else {
            message.warning("Đơn hàng này chưa có link thanh toán MoMo. Vui lòng chọn lại phương thức thanh toán.");
            setShowPaymentMethodModal(true);
          }
        }
      } else {
        // No payment method set, show selection modal
        setSelectedPaymentMethod(null);
        setShowPaymentMethodModal(true);
      }
    } catch (error) {
      message.error("Không thể xử lý thanh toán cho đơn hàng này");
    }
  };

  // Polling to check MoMo payment status
  const startMoMoPaymentPolling = (orderId) => {
    // Clear any existing polling interval
    if (momoPollingIntervalRef.current) {
      clearInterval(momoPollingIntervalRef.current);
      momoPollingIntervalRef.current = null;
    }

    let pollCount = 0;
    const maxPollCount = 100; // 5 minutes (100 * 3 seconds)

    const pollInterval = setInterval(async () => {
      pollCount++;

      try {
        const orderData = await getOrderById(orderId);

        if (!orderData) {
          // Order not found - continue polling
          return;
        }

        // Check if payment completed successfully
        if (orderData.paymentStatus === "Đã thanh toán") {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;

          // Close MoMo modal
          setShowMomoModal(false);

          // Complete the order and show success modal
          try {
            const completedOrder = await completeOrder(orderId);
            // Lưu order đã thanh toán để hiển thị trong modal thành công
            setCompletedOrderForPrint(completedOrder);
            // Show success modal
            setShowOrderSuccessModal(true);
            // handlePaymentCompleted will be called after user closes success modal
          } catch (error) {
            message.error("Lỗi khi hoàn tất đơn hàng. Vui lòng thử lại!");
          }
          return;
        }

        // Check if payment failed - multiple failure scenarios
        const paymentFailed =
          orderData.paymentStatus === "Thất bại"

        if (paymentFailed) {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;
          setShowMomoModal(false);
          message.error("Thanh toán MoMo thất bại. Vui lòng thử lại!");
          // Reset về trạng thái đơn mới giống như khi thanh toán thành công
          handlePaymentCompleted();
          return;
        }
      } catch (error) {
        // Handle 401 - token expired
        if (error.response?.status === 401) {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;
          setShowMomoModal(false);
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          return;
        }
        // For other errors, continue polling but don't spam console
        if (pollCount % 10 === 0) {
          // Only log every 10th error to avoid spam
        }
      }

      // Timeout after 5 minutes
      if (pollCount >= maxPollCount) {
        clearInterval(pollInterval);
        momoPollingIntervalRef.current = null;
        setShowMomoModal(false);
        message.error("Thanh toán MoMo quá thời gian. Vui lòng thử lại!");
        // Reset về trạng thái đơn mới giống như khi thanh toán thành công
        handlePaymentCompleted();
      }
    }, 3000); // Poll every 3 seconds

    momoPollingIntervalRef.current = pollInterval;
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (momoPollingIntervalRef.current) {
        clearInterval(momoPollingIntervalRef.current);
        momoPollingIntervalRef.current = null;
      }
    };
  }, []);

  // Handle payment completion
  const handlePaymentCompleted = async () => {
    // Lưu customerId trước khi reset để refresh lại thông tin sau
    const previousCustomerId = selectedCustomer;
    const isGuest = String(previousCustomerId) === GUEST_CUSTOMER_ID;

    setCartItems([]);
    setSelectedCustomer(GUEST_CUSTOMER_ID);
    setSelectedCustomerData(guestCustomer);
    setCustomerSearchVisible(false);
    setSelectedDiscount(null);
    setSelectedGST(null);
    setSelectedShipping(null);
    setCreatedOrder(null);
    setSelectedPaymentMethod(null);
    setShowPaymentMethodModal(false);
    setShowCashPaymentModal(false);
    setUsePoints(0);
    setShowMomoModal(false);

    // Cập nhật lại danh sách sản phẩm để refresh số lượng tồn kho sau khi thanh toán thành công
    await fetchProducts();

    // Refresh lại thông tin khách hàng nếu không phải khách lẻ (để cập nhật điểm mới)
    // Điều này giúp khi người dùng chọn lại khách hàng, điểm sẽ được cập nhật
    if (!isGuest && previousCustomerId) {
      try {
        // Fetch lại thông tin khách hàng để cập nhật điểm mới nhất
        // Không set lại selectedCustomer, chỉ fetch để cache được cập nhật
        await getCustomerById(previousCustomerId);
      } catch (error) {
        // Ignore error, không ảnh hưởng đến flow chính
      }
    }
  };

  // Handle back to payment method selection (after cash payment)
  const handleBackToPaymentMethod = () => {
    setShowCashPaymentModal(false);
    setCashReceived("");
    setShowPaymentMethodModal(true);
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
                    {categories.map((category) => {
                      // Tính số lượng sản phẩm bao gồm cả sub-categories
                      const categoryIds = getCategoryIdsForParent(category.id);
                      const productCount = products.filter(p => {
                        const pCategoryIdStr = p.categoryId ? String(p.categoryId) : null;
                        return pCategoryIdStr && categoryIds.includes(pCategoryIdStr);
                      }).length;

                      return (
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
                          <span>{productCount} Sản phẩm</span>
                        </div>
                      );
                    })}
                  </Slider>
                )}
                <div className="pos-products">
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="mb-3">Sản phẩm</h4>
                    <div className="input-icon-start pos-search position-relative mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                      />
                      <span className="input-icon-addon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
                        <i className="ti ti-search" />
                      </span>
                    </div>
                  </div>
                  <div className="tabs_container">
                    <div
                      className="tab_content active"
                      data-tab={activeTab}
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
                                  onClick={(e) => handleAddToCart(product, e)}
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
              <aside className="product-order-list" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 20px)' }}>
                {createdOrder && (
                  <div className="order-head bg-light d-flex align-items-center justify-content-between w-100">
                    <div>
                      <h3>Đơn hàng</h3>
                      <span>Mã giao dịch : #{createdOrder.orderNumber || createdOrder.orderId || '-'}</span>
                    </div>
                    <div>
                      <Link
                        className="link-danger fs-16"
                        to="#"
                        onClick={async (e) => {
                          e.preventDefault();
                          // Reset POS về trạng thái chưa tạo đơn
                          await handlePaymentCompleted();
                        }}
                      >
                        <i className="ti ti-trash-x-filled" />
                      </Link>
                    </div>
                  </div>
                )}
                <div className="customer-info block-section">
                  <h4 className="mb-3">Thông tin khách hàng</h4>
                  {selectedCustomerData && String(selectedCustomer) !== GUEST_CUSTOMER_ID && (
                    <div className="mb-3">
                      <div className="mb-2">
                        <span className="text-muted">Điểm tích lũy: </span>
                        <span className="fw-bold text-primary">
                          {new Intl.NumberFormat('vi-VN').format(selectedCustomerData.points ?? 0)} điểm
                        </span>
                      </div>
                      {!createdOrder && (selectedCustomerData.points ?? 0) > 0 && totals.totalBeforePoints > 0 && (
                        <div>
                          <label className="form-label small">Sử dụng điểm (tối đa {Math.min(selectedCustomerData.points ?? 0, Math.floor(totals.totalBeforePoints))} điểm):</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max={Math.min(selectedCustomerData.points ?? 0, Math.floor(totals.totalBeforePoints))}
                            value={usePoints}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const maxUsable = Math.min(selectedCustomerData.points ?? 0, Math.floor(totals.totalBeforePoints));
                              setUsePoints(Math.max(0, Math.min(value, maxUsable)));
                            }}
                            placeholder="Nhập số điểm muốn sử dụng"
                          />
                          {usePoints > 0 && (
                            <small className="text-muted">
                              Sẽ giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(usePoints)} từ tổng tiền
                            </small>
                          )}
                        </div>
                      )}
                      {createdOrder && createdOrder.pointsRedeemed > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Điểm đã sử dụng: </small>
                          <span className="fw-bold text-success">
                            {new Intl.NumberFormat('vi-VN').format(createdOrder.pointsRedeemed)} điểm
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="input-block d-flex align-items-center">
                    {!customerSearchVisible ? (
                      <div className="flex-grow-1">
                        <div
                          className="form-control"
                          onClick={() => setCustomerSearchVisible(true)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <span>{selectedCustomerData?.fullName || selectedCustomerData?.customerName || ""}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow-1 position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập số điện thoại để tìm kiếm..."
                          value={customerSearchQuery}
                          onChange={(e) => handleCustomerSearch(e.target.value)}
                          onFocus={() => {
                            if (customerSearchResults.length > 0) {
                              setShowCustomerDropdown(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay để allow click on dropdown items
                            setTimeout(() => setShowCustomerDropdown(false), 200);
                          }}
                          autoFocus
                        />
                        {showCustomerDropdown && customerSearchResults.length > 0 && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-lg"
                            style={{
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              top: '100%',
                              marginTop: '2px'
                            }}
                          >
                            {customerSearchResults.map((customer) => (
                              <div
                                key={customer.customerId}
                                className="p-2 border-bottom cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectCustomer(customer)}
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur
                              >
                                <div className="fw-bold">{customer.fullName || customer.customerName}</div>
                                <div className="text-muted small">{customer.phone || ""}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <Link
                      to="#"
                      className="btn btn-primary btn-icon"
                      onClick={(e) => {
                        e.preventDefault();
                        // Chỉ mở modal nếu đang ở chế độ search và không có kết quả
                        if (customerSearchVisible) {
                          handleOpenAddCustomerModal();
                        } else {
                          setCustomerSearchVisible(true);
                        }
                      }}
                    >
                      <i className="feather icon-user-plus feather-16" />
                    </Link>
                  </div>
                </div>
                <div className="product-added block-section" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
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
                        <div key={item.id} className="product-list d-flex align-items-center justify-content-between" style={{ flexWrap: 'nowrap', gap: '10px' }}>
                          <div
                            className="d-flex align-items-center product-info flex-grow-1"
                            style={{ minWidth: 0 }}
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
                            <div className="info" style={{ flex: 1, minWidth: 0 }}>
                              <span>{item.code || "N/A"}</span>
                              <h6>
                                <Link to="#" onClick={(e) => e.preventDefault()}>{item.name}</Link>
                              </h6>
                              <p className="fw-bold text-teal">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                              </p>
                            </div>
                          </div>
                          <div className="qty-item text-center" style={{ flexShrink: 0 }}>
                            <CounterTwo
                              defaultValue={item.quantity}
                              onChange={(value) => handleUpdateQuantity(item.id, value)}
                            />
                          </div>
                          <div className="d-flex align-items-center action" style={{ flexShrink: 0 }}>
                            <Link
                              className="btn-icon delete-icon"
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
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

                {/* Fixed bottom section */}
                <div style={{ marginTop: 'auto', backgroundColor: '#fff', paddingTop: '15px', borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
                  <div className="btn-block">
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <table className="table-borderless w-100 table-fit mb-0">
                          <tbody>
                            <tr>
                              <td className="fw-bold">Tạm tính:</td>
                              <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.subTotal || 0)}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Giảm giá:</td>
                              <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.discount || 0)}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Thuế:</td>
                              <td className="text-end">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.tax || 0)}</td>
                            </tr>
                            {totals.pointsUsed > 0 && (
                              <tr>
                                <td className="fw-bold">Điểm đã sử dụng:</td>
                                <td className="text-end text-success">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.pointsUsed || 0)}</td>
                              </tr>
                            )}
                            {createdOrder && createdOrder.paymentStatus === "Chưa thanh toán" && (
                              <tr>
                                <td className="fw-bold">Còn nợ:</td>
                                <td className="text-end fw-bold text-danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.total || 0)}</td>
                              </tr>
                            )}
                            {createdOrder && createdOrder.paymentStatus === "Đã thanh toán" && (
                              <tr>
                                <td className="fw-bold">Còn nợ:</td>
                                <td className="text-end fw-bold text-success">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}</td>
                              </tr>
                            )}
                            {!createdOrder && (
                              <tr>
                                <td className="fw-bold">Tổng phải trả:</td>
                                <td className="text-end fw-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totals.total || 0)}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="btn-row d-sm-flex align-items-center justify-content-center gap-2 mb-3">
                    <Link
                      to="#"
                      className="btn btn-success d-flex align-items-center justify-content-center"
                      style={{ minWidth: '200px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateOrder();
                      }}
                    >
                      <i className="ti ti-shopping-cart me-1" />
                      Tạo đơn
                    </Link>
                    {createdOrder && (
                      <Link
                        to="#"
                        className="btn btn-primary d-flex align-items-center justify-content-center"
                        style={{ minWidth: '200px' }}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePaymentButtonClick();
                        }}
                      >
                        <i className="ti ti-wallet me-1" />
                        Thanh toán
                      </Link>
                    )}
                  </div>
                </div>
              </aside>
            </div>
            {/* /Order Details */}
          </div>
        </div>
      </div>
      <PosModals
        createdOrder={createdOrder}
        totalAmount={totals.total}
        showPaymentMethodModal={showPaymentMethodModal}
        onClosePaymentMethodModal={() => setShowPaymentMethodModal(false)}
        onPaymentCompleted={handlePaymentCompleted}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        showCashPaymentModal={showCashPaymentModal}
        showMomoModal={showMomoModal}
        showOrderSuccessModal={showOrderSuccessModal}
        onCloseOrderSuccessModal={() => {
          setShowOrderSuccessModal(false);
          setCompletedOrderForPrint(null);
          // Reset POS after closing success modal
          handlePaymentCompleted();
        }}
        completedOrderForPrint={completedOrderForPrint || createdOrder}
        onCashPaymentConfirm={() => {
          // Just close the modal
          setShowCashPaymentModal(false);
        }}
        onMomoModalClose={() => {
          // Just close the modal
          setShowMomoModal(false);
        }}
        onCompleteOrder={async (orderId) => {
          try {
            const completedOrder = await completeOrder(orderId);
            // Lưu order đã thanh toán để hiển thị trong modal thành công
            setCompletedOrderForPrint(completedOrder);
            // Show success modal
            setShowOrderSuccessModal(true);
            // handlePaymentCompleted will be called after user closes success modal
          } catch (error) {
            // Error is already handled in PosModals.jsx
            throw error;
          }
        }}
        onCashPaymentCompleted={async (orderId) => {
          // Handle cash payment completion directly
          try {
            const completedOrder = await completeOrder(orderId);
            // Lưu order đã thanh toán để hiển thị trong modal thành công
            setCompletedOrderForPrint(completedOrder);
            // Show success modal
            setShowOrderSuccessModal(true);
            // handlePaymentCompleted will be called after user closes success modal
          } catch (error) {
            throw error;
          }
        }}
        onHandleOrderPayment={handleOrderPayment}
        onSelectOrder={handleSelectOrder}
      />
      <AddCustomerModal
        isOpen={addCustomerModalOpen}
        initialPhone={customerSearchQuery}
        onClose={() => setAddCustomerModalOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
};

export default Pos;

