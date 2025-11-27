import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../assets/css/pos-promotion.css";
import PosModals from "../../core/modals/pos/PosModals";
import AddCustomerModal from "../../core/modals/pos/AddCustomerModal";
import CounterTwo from "../../components/counter/CounterTwo";
import CloseShiftModal from "../../components/shift/CloseShiftModal";
import { Spin, message, Modal } from "antd";
import { getAllCategories } from "../../services/CategoryService";
import {
  getAllProducts,
  getProductByBarcode,
} from "../../services/ProductService";
import {
  getCustomerById,
  searchCustomers,
} from "../../services/CustomerService";
import {
  createOrder,
  completeOrder,
  getOrderById,
} from "../../services/OrderService";
import { getPosSettings } from "../../services/PosSettingsService";
import { getBestDiscountInfoForProduct } from "../../services/PromotionService";
import { getImageUrl } from "../../utils/imageUtils";
import usePermission from "../../hooks/usePermission";
import {
  isShiftOpen,
  getCurrentShift,
  openShift,
  closeShift,
} from "../../services/ShiftService";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const Location = useLocation();

  const GUEST_CUSTOMER_ID = "00000000-0000-0000-0000-000000000001";
  const [selectedCustomer, setSelectedCustomer] = useState(GUEST_CUSTOMER_ID);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [customerSearchVisible, setCustomerSearchVisible] = useState(false);
  const [guestCustomer, setGuestCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

  const [selectedShipping, setSelectedShipping] = useState(null);
  const [posSettings, setPosSettings] = useState({
    taxPercent: 0,
    discountPercent: 0,
  });
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isBarcodeInputFocused, setIsBarcodeInputFocused] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // "cash" or "momo"
  const [usePoints, setUsePoints] = useState(0); // Số điểm muốn sử dụng
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [completedOrderForPrint, setCompletedOrderForPrint] = useState(null); // Lưu order đã thanh toán để in
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftNotOpenOverlay, setShiftNotOpenOverlay] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [closeShiftNote, setCloseShiftNote] = useState("");
  const [closeShiftDenominations, setCloseShiftDenominations] = useState([]);
  const momoPollingIntervalRef = useRef(null);

  const handleBarcodeScanRef = useRef(null);
  const lastMessageRef = useRef({ type: null, content: null, timestamp: 0 });

  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: false, // Không lặp vô hạn
    autoplay: false,
    slidesToShow: 6,
    slidesToScroll: 1,
    speed: 500,
    arrows: true, // Hiển thị mũi tên
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    variableWidth: false, // Đảm bảo width đồng đều
    centerMode: false, // Không center
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Custom arrow components
  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        className={`custom-arrow custom-arrow-next ${className}`}
        onClick={onClick}
        style={{
          position: "absolute",
          right: "-15px",
          top: "40%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#ff9f43",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <i
          className="fa fa-chevron-right"
          style={{ color: "white", fontSize: "12px" }}
        ></i>
      </button>
    );
  }

  function SamplePrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        className={`custom-arrow custom-arrow-prev ${className}`}
        onClick={onClick}
        style={{
          position: "absolute",
          left: "-15px",
          top: "40%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#ff9f43",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <i
          className="fa fa-chevron-left"
          style={{ color: "white", fontSize: "12px" }}
        ></i>
      </button>
    );
  }

  // Xử lý cuộn chuột cho slider - chỉ cuộn slider, không cuộn trang
  const lastWheelTimeRef = useRef(0);

  const handleWheel = useCallback((e) => {
    if (sliderRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTimeRef.current;

      // Debounce để tránh cuộn quá nhanh, nhưng vẫn nhạy
      if (timeSinceLastWheel < 100) {
        return;
      }

      lastWheelTimeRef.current = now;

      // Cuộn dựa trên hướng, không cần deltaY lớn
      if (e.deltaY < 0) {
        // Cuộn lên = đi về trước
        sliderRef.current.slickPrev();
      } else if (e.deltaY > 0) {
        // Cuộn xuống = đi về sau
        sliderRef.current.slickNext();
      }
    }
  }, []);

  // Ref cho container của slider
  const sliderContainerRef = useRef(null);

  // Thêm event listener để ngăn cuộn trang khi hover vào slider
  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleWheel(e);
    };

    container.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", preventScroll);
    };
  }, [handleWheel]);

  // Config message để giới hạn số lượng hiển thị
  useEffect(() => {
    message.config({
      maxCount: 3, // Chỉ hiển thị tối đa 3 message cùng lúc
      duration: 2, // Tự động ẩn sau 2 giây
      rtl: false,
    });
  }, []);

  useEffect(() => {
    const handler = () => setShowShiftModal(true);
    const closeHandler = () => setShowCloseShiftModal(true); // Open close shift modal
    window.addEventListener("openShiftModal", handler);
    window.addEventListener("openCloseShiftModal", closeHandler);
    return () => {
      window.removeEventListener("openShiftModal", handler);
      window.removeEventListener("openCloseShiftModal", closeHandler);
    };
  }, []);

  // Helper function để hiển thị message và tránh duplicate
  const showMessage = useCallback((type, content) => {
    const now = Date.now();
    const lastMessage = lastMessageRef.current;

    // Nếu message giống hệt và được gọi trong vòng 500ms, bỏ qua
    if (
      lastMessage.type === type &&
      lastMessage.content === content &&
      now - lastMessage.timestamp < 500
    ) {
      return;
    }

    // Cập nhật ref
    lastMessageRef.current = { type, content, timestamp: now };

    // Hiển thị message
    message[type](content);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchProducts();
      await fetchGuestCustomer(); // Fetch guest customer
      await fetchPosSettings(); // Fetch POS settings
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadShift = async () => {
      try {
        setShiftLoading(true);
        const s = await getCurrentShift();
        setCurrentShift(s);
      } finally {
        setShiftLoading(false);
      }
    };
    loadShift();
  }, []);

  const navigate = useNavigate();
  const { userRole } = usePermission();
  const checkedRef = useRef(false);
  useEffect(() => {
    const gate = async () => {
      if (!userRole) return; // Đợi userRole được load
      if (checkedRef.current) return;
      checkedRef.current = true;

      console.log("🔍 Checking shift for role:", userRole);

      if (userRole === "Nhân viên bán hàng") {
        // Ưu tiên localStorage
        const openLocal = await isShiftOpen();
        console.log("📦 isShiftOpen (localStorage):", openLocal);

        if (openLocal) {
          setShiftNotOpenOverlay(false);
          return;
        }

        // Thử gọi API lần nữa
        try {
          const current = await getCurrentShift();
          console.log("🌐 getCurrentShift (API):", current);

          if (current && current.status === "Mở") {
            setShiftNotOpenOverlay(false);
            return;
          }
        } catch (error) {
          console.log("❌ Error getting shift:", error);
        }

        // Không mở, hiển thị overlay thông báo
        console.log("⚠️ Shift not open - showing overlay");
        setShiftNotOpenOverlay(true);
      } else {
        console.log("👤 Not staff role - no shift check needed");
        setShiftNotOpenOverlay(false);
      }
    };
    gate();
  }, [userRole]);

  const fetchPosSettings = async () => {
    try {
      const settings = await getPosSettings();
      setPosSettings({
        taxPercent: settings.taxPercent || 0,
        discountPercent: settings.discountPercent || 0,
      });
    } catch (error) {
      console.error("Không thể tải cài đặt POS:", error);
      setPosSettings({
        taxPercent: 0,
        discountPercent: 0,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setAllCategories(data);
      const parentCategories = data
        .filter(
          (cat) =>
            cat.active &&
            (!cat.parentCategoryId || cat.parentCategoryId === null)
        )
        .map((cat) => ({
          id: cat.categoryId,
          name: cat.categoryName,
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
        }));
      setCategories(parentCategories);
    } catch {
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();

      // Map products data và load khuyến mãi
      const mappedProductsPromises = data
        .filter((product) => product.active)
        .map(async (product) => {
          const originalPrice = product.unitPrice || 0;
          // Lấy thông tin giảm giá chi tiết (tổng hợp tất cả promotion)
          const discountInfo = await getBestDiscountInfoForProduct(
            product.productId,
            originalPrice
          );

          // Tính giá sau giảm: Trừ thẳng tổng số tiền giảm
          const discountedPrice = Math.max(
            0,
            originalPrice - discountInfo.discountValue
          );

          return {
            id: product.productId,
            productId: product.productId,
            name: product.productName,
            productName: product.productName,
            code: product.productCode,
            productCode: product.productCode,
            barcode: product.barcode || null,
            price: discountedPrice, // Giá sau khuyến mãi
            originalPrice: originalPrice, // Giá gốc
            discountPercent: discountInfo.discountPercent, // % giảm giá (để hiển thị)
            discountValue: discountInfo.discountValue, // Tổng số tiền giảm
            stock: product.quantityInStock,
            quantityInStock: product.quantityInStock,
            categoryId: product.categoryId,
            categoryName: product.categoryName || "",
            image: getImageUrl(product.imageUrl || product.image || null),
          };
        });

      const mappedProducts = await Promise.all(mappedProductsPromises);
      setProducts(mappedProducts);

      setCartItems((prevCartItems) => {
        if (prevCartItems.length === 0) return prevCartItems;

        return prevCartItems.map((cartItem) => {
          const updatedProduct = mappedProducts.find(
            (p) => String(p.productId) === String(cartItem.productId)
          );
          if (updatedProduct) {
            const newStock =
              updatedProduct.quantityInStock || updatedProduct.stock || 0;
            const adjustedQuantity = Math.min(cartItem.quantity, newStock);
            return {
              ...cartItem,
              stock: newStock,
              quantity: adjustedQuantity,
            };
          }
          return cartItem;
        });
      });
    } catch {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestCustomer = async () => {
    try {
      const guestData = await getCustomerById(GUEST_CUSTOMER_ID);
      setGuestCustomer(guestData);
      setSelectedCustomerData(guestData);
    } catch {
      message.error("Không thể tải thông tin khách lẻ");
    }
  };

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
          const guestName = (
            guestCustomer.fullName ||
            guestCustomer.customerName ||
            ""
          ).toLowerCase();
          const guestPhone = (guestCustomer.phone || "").toLowerCase();

          // Kiểm tra nếu query match với tên hoặc số điện thoại của khách lẻ
          if (
            guestName.includes(queryLower) ||
            guestPhone.includes(queryLower)
          ) {
            // Kiểm tra xem khách lẻ đã có trong results chưa
            const guestInResults = results.some(
              (r) => String(r.customerId) === GUEST_CUSTOMER_ID
            );
            if (!guestInResults) {
              finalResults = [guestCustomer, ...results];
            }
          }
        }

        setCustomerSearchResults(finalResults);
        setShowCustomerDropdown(finalResults.length > 0);
      } catch {
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
      setUsePoints(0);
      if (String(fullCustomerData.customerId) === GUEST_CUSTOMER_ID) {
        setGuestCustomer(fullCustomerData);
      }
    } catch {
      message.error("Không thể lấy thông tin khách hàng");
      setSelectedCustomer(customer.customerId);
      setSelectedCustomerData(customer);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setUsePoints(0);
    }
  };

  const handleCustomerCreated = async (newCustomer) => {
    try {
      const fullCustomerData = await getCustomerById(newCustomer.customerId);
      setSelectedCustomer(fullCustomerData.customerId);
      setSelectedCustomerData(fullCustomerData);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setAddCustomerModalOpen(false);
    } catch {
      setSelectedCustomer(newCustomer.customerId);
      setSelectedCustomerData(newCustomer);
      setCustomerSearchQuery("");
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      setCustomerSearchVisible(false);
      setAddCustomerModalOpen(false);
    }
  };

  const handleOpenAddCustomerModal = () => {
    if (customerSearchQuery.trim().length === 0) {
      message.warning("Vui lòng nhập số điện thoại trước");
      return;
    }
    if (
      customerSearchResults.length === 0 &&
      customerSearchQuery.trim().length > 0
    ) {
      setAddCustomerModalOpen(true);
    } else {
      message.info("Đã tìm thấy khách hàng, vui lòng chọn từ danh sách");
    }
  };

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      const productInfo = target.closest(".product-info");
      const isCartItem = target.closest(".product-wrap");

      if (productInfo && !isCartItem) {
        productInfo.classList.toggle("active");

        const hasActive =
          document.querySelectorAll(".product-info.active").length > 0;

        const emptyCart = document.querySelector(".product-wrap .empty-cart");
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
  }, [Location.pathname]);

  // Hàm helper để focus vào barcode input (không đổi category)
  // Định nghĩa trước để dùng trong các hàm khác
  const focusBarcodeInput = useCallback(
    (changeCategory = false) => {
      if (!createdOrder) {
        // Chỉ set category về "all" nếu được yêu cầu (khi quét barcode)
        if (changeCategory) {
          setActiveTab("all");
        }
        const scrollY = window.scrollY || window.pageYOffset;
        setTimeout(() => {
          const barcodeInputElement = document.getElementById("barcode-input");
          if (barcodeInputElement) {
            // Khôi phục scroll position trước khi focus
            window.scrollTo(0, scrollY);
            // Focus mà không scroll
            barcodeInputElement.focus({ preventScroll: true });
            setIsBarcodeInputFocused(true);
          }
        }, 100);
      }
    },
    [createdOrder]
  );

  // Handle add product to cart - Định nghĩa trước để dùng trong handleBarcodeScan
  const handleAddToCart = useCallback(
    (product, e) => {
      // Ngăn chặn event bubbling để không toggle active class
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // Validate số lượng tồn kho
      const availableStock = product.stock || product.quantityInStock || 0;
      if (availableStock <= 0) {
        message.error(
          `Sản phẩm "${product.name || product.productName}" đã hết hàng!`
        );
        // Tự động focus lại vào barcode input (không đổi category)
        focusBarcodeInput(false);
        return;
      }

      // Sử dụng functional update để tránh stale closure
      setCartItems((prevCartItems) => {
        const existingItem = prevCartItems.find(
          (item) => String(item.productId) === String(product.productId)
        );

        if (existingItem) {
          // If product already in cart, increase quantity
          const newQuantity = existingItem.quantity + 1;
          const currentStock = existingItem.stock || availableStock;

          // Validate số lượng không vượt quá tồn kho
          if (newQuantity > currentStock) {
            message.error(
              `Số lượng vượt quá tồn kho! Tồn kho hiện có: ${currentStock}`
            );
            // Tự động focus lại vào barcode input (không đổi category)
            setTimeout(() => {
              focusBarcodeInput(false);
            }, 100);
            return prevCartItems;
          }

          showMessage(
            "success",
            "Đã cập nhật số lượng sản phẩm trong giỏ hàng"
          );

          return prevCartItems.map((item) =>
            String(item.productId) === String(product.productId)
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          const cartItem = {
            id: product.productId,
            productId: product.productId,
            name: product.name,
            code: product.code,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discountPercent: product.discountPercent || 0,
            quantity: 1,
            stock: availableStock,
            image: product.image,
            categoryName: product.categoryName,
          };
          showMessage("success", "Đã thêm sản phẩm vào giỏ hàng");
          return [...prevCartItems, cartItem];
        }
      });

      focusBarcodeInput(false);
    },
    [focusBarcodeInput, showMessage]
  );

  const handleBarcodeScan = useCallback(
    async (barcode, skipFocusCheck = false) => {
      if (!barcode || barcode.trim().length === 0) {
        return;
      }

      if (!skipFocusCheck && !isBarcodeInputFocused) {
        message.warning("Vui lòng click vào ô quét barcode trước khi quét!");
        focusBarcodeInput(true);
        return;
      }

      try {
        setIsScanning(true);
        const product = await getProductByBarcode(barcode.trim());

        const originalPrice = product.unitPrice || 0;
        // Lấy thông tin giảm giá chi tiết (tổng hợp tất cả promotion)
        const discountInfo = await getBestDiscountInfoForProduct(
          product.productId,
          originalPrice
        );

        // Tính giá sau giảm: Trừ thẳng tổng số tiền giảm
        const discountedPrice = Math.max(
          0,
          originalPrice - discountInfo.discountValue
        );

        const mappedProduct = {
          id: product.productId,
          productId: product.productId,
          name: product.productName,
          productName: product.productName,
          code: product.productCode,
          productCode: product.productCode,
          price: discountedPrice,
          originalPrice: originalPrice,
          discountPercent: discountInfo.discountPercent,
          discountValue: discountInfo.discountValue,
          stock: product.quantityInStock || 0,
          quantityInStock: product.quantityInStock || 0,
          categoryId: product.categoryId,
          categoryName: product.categoryName || "",
          image: getImageUrl(product.imageUrl || null),
        };

        setActiveTab("all");

        handleAddToCart(mappedProduct, null);

        setBarcodeInput("");
      } catch {
        message.error(`Không tìm thấy sản phẩm với barcode: ${barcode}`);
      } finally {
        setIsScanning(false);
        setActiveTab("all");
        const scrollY = window.scrollY || window.pageYOffset;
        setTimeout(() => {
          const barcodeInputElement = document.getElementById("barcode-input");
          if (barcodeInputElement) {
            window.scrollTo(0, scrollY);
            barcodeInputElement.focus({ preventScroll: true });
            barcodeInputElement.select();
            setIsBarcodeInputFocused(true);
          }
        }, 50);
      }
    },
    [isBarcodeInputFocused, handleAddToCart, focusBarcodeInput]
  );

  useEffect(() => {
    handleBarcodeScanRef.current = handleBarcodeScan;
  }, [handleBarcodeScan]);

  const handleBarcodeInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (barcodeInput.trim().length > 0) {
        handleBarcodeScan(barcodeInput);
      }
    }
  };

  const handleBarcodeInputFocus = () => {
    setIsBarcodeInputFocused(true);
  };

  const handleBarcodeInputBlur = () => {
    setIsBarcodeInputFocused(false);
  };

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
  };

  useEffect(() => {
    if (!createdOrder && !customerSearchVisible) {
      setActiveTab("all");
      const timer = setTimeout(() => {
        const barcodeInputElement = document.getElementById("barcode-input");
        if (barcodeInputElement && !customerSearchVisible) {
          barcodeInputElement.focus({ preventScroll: true });
          setIsBarcodeInputFocused(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [createdOrder, customerSearchVisible]);

  // Focus vào customer search input khi chuyển sang chế độ tìm kiếm
  useEffect(() => {
    if (customerSearchVisible) {
      const timer = setTimeout(() => {
        const customerInput = document.querySelector(".customer-search-input");
        if (customerInput) {
          customerInput.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [customerSearchVisible]);

  const handleUpdateQuantity = (
    itemId,
    newQuantity,
    shouldShowMessage = true
  ) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      if (shouldShowMessage) {
        showMessage("success", "Đã xóa sản phẩm khỏi giỏ hàng");
      }
      return;
    }

    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    if (item.quantity === newQuantity) {
      return;
    }

    const availableStock = item.stock || 0;
    if (newQuantity > availableStock) {
      message.error(
        `Số lượng vượt quá tồn kho! Tồn kho hiện có: ${availableStock}`
      );
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: availableStock }
            : cartItem
        )
      );
      setTimeout(() => {
        focusBarcodeInput(false);
      }, 100);
      return;
    }

    setCartItems(
      cartItems.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );

    if (shouldShowMessage) {
      showMessage("success", "Đã cập nhật số lượng sản phẩm trong giỏ hàng");
    }
  };

  const getCategoryIdsForParent = (parentCategoryId) => {
    if (!parentCategoryId || parentCategoryId === "all") return [];

    const parentIdStr = String(parentCategoryId);

    const categoryIds = [parentIdStr];

    const subCategories = allCategories.filter((cat) => {
      const catParentId = cat.parentCategoryId
        ? String(cat.parentCategoryId)
        : null;
      return catParentId === parentIdStr && cat.active;
    });

    subCategories.forEach((subCat) => {
      categoryIds.push(String(subCat.categoryId));
    });

    return categoryIds;
  };

  const filteredProducts = products.filter((product) => {
    let matchCategory = false;

    if (activeTab === "all") {
      matchCategory = true;
    } else {
      const categoryIds = getCategoryIdsForParent(activeTab);
      const productCategoryIdStr = product.categoryId
        ? String(product.categoryId)
        : null;
      matchCategory =
        productCategoryIdStr && categoryIds.includes(productCategoryIdStr);
    }

    const matchSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const calculateTotals = () => {
    const subTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discountPercent = posSettings.discountPercent || 0;
    const taxPercent = posSettings.taxPercent || 0;

    const discount =
      discountPercent > 0 ? (subTotal * discountPercent) / 100 : 0;

    const afterDiscount = subTotal - discount;

    const tax = taxPercent > 0 ? (afterDiscount * taxPercent) / 100 : 0;

    const shipping = selectedShipping ? parseFloat(selectedShipping) : 0;
    const totalBeforePoints = afterDiscount + tax + shipping;

    const currentPoints = selectedCustomerData?.points ?? 0;
    const maxUsablePoints = Math.min(
      currentPoints,
      Math.floor(totalBeforePoints)
    );
    const actualUsePoints = Math.min(usePoints, maxUsablePoints);

    const total = Math.max(0, totalBeforePoints - actualUsePoints);
    return {
      subTotal,
      tax,
      shipping,
      discount,
      total,
      pointsUsed: actualUsePoints,
      totalBeforePoints,
      discountPercent,
      taxPercent,
    };
  };

  const totals = calculateTotals();

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    const isGuest = String(selectedCustomer) === GUEST_CUSTOMER_ID;
    if (!isGuest && !selectedCustomerData) {
      message.error("Vui lòng chọn khách hàng!");
      return;
    }
    if (
      !isGuest &&
      (!selectedCustomerData.phone || selectedCustomerData.phone.trim() === "")
    ) {
      message.error(
        "Khách hàng không có số điện thoại. Vui lòng cập nhật thông tin khách hàng."
      );
      return;
    }

    (async () => {
      if (userRole === "Nhân viên bán hàng") {
        const open = await isShiftOpen();
        if (!open) {
          message.warning("Ca chưa được mở. Vui lòng liên hệ quản lý");
          return;
        }
      }
      setShowPaymentMethodModal(true);
    })();
  };

  const handleSelectPaymentMethod = async (paymentMethod) => {
    if (cartItems.length === 0) {
      message.warning("Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    if (userRole === "Nhân viên bán hàng") {
      const open = await isShiftOpen();
      if (!open) {
        message.warning("Ca chưa được mở. Vui lòng liên hệ quản lý");
        return;
      }
    }

    try {
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
        message.error(
          "Khách hàng không có số điện thoại. Vui lòng cập nhật thông tin khách hàng."
        );
        return;
      }

      const orderData = {
        phone: customerPhone || "",
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.originalPrice || item.price, // Gửi giá gốc
          discount: item.discountPercent || 0, // Gửi % giảm giá của sản phẩm
        })),
        discountAmount: totals.discountPercent || 0,
        taxAmount: totals.taxPercent || 0,
        paymentMethod: paymentMethod === "cash" ? null : "MOMO",
        notes: null,
        usePoints: totals.pointsUsed || 0,
      };

      message.loading("Đang tạo đơn hàng...", 0);
      const orderResult = await createOrder(orderData);
      message.destroy();

      setCreatedOrder(orderResult);
      setSelectedPaymentMethod(paymentMethod); // Save selected payment method

      setShowPaymentMethodModal(false);
      message.success("Đã tạo đơn hàng thành công!");
      await fetchProducts();

      if (paymentMethod === "cash") {
        setShowCashPaymentModal(true);
      } else if (paymentMethod === "momo") {
        const momoPayUrl =
          orderResult.payment?.payUrl ||
          (orderResult.payment?.notes?.startsWith("PAYURL:")
            ? orderResult.payment.notes.substring("PAYURL:".length)
            : null);
        if (momoPayUrl) {
          setShowMomoModal(true);
          startMoMoPaymentPolling(orderResult.orderId);
        } else {
          message.error(
            "Không thể tạo link thanh toán MoMo. Vui lòng thử lại!"
          );
        }
      }
    } catch {
      message.destroy();
      message.error("Tạo đơn hàng thất bại. Vui lòng thử lại!");
    }
  };

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
      setShowPaymentMethodModal(true);
    }
  };

  const handleSelectOrder = async (orderData) => {
    try {
      let fullOrderData = orderData;
      if (!orderData.orderDetails) {
        fullOrderData = await getOrderById(orderData.orderId);
      }

      if (fullOrderData.orderDetails && fullOrderData.orderDetails.length > 0) {
        const cartItemsFromOrder = await Promise.all(
          fullOrderData.orderDetails.map(async (detail) => {
            let productInfo = products.find(
              (p) => String(p.productId) === String(detail.productId)
            );

            if (!productInfo) {
              productInfo = {
                productCode: detail.productCode || "N/A",
                image: getImageUrl(detail.imageUrl || null),
                stock: detail.quantityInStock || 0,
              };
            }

            return {
              id: detail.productId || detail.orderDetailId,
              productId: detail.productId,
              name: detail.productName || "N/A",
              productName: detail.productName || "N/A",
              code:
                productInfo.productCode ||
                productInfo.code ||
                detail.productCode ||
                "N/A",
              price: detail.unitPrice || 0,
              quantity: detail.quantity || 0,
              stock: productInfo.stock || productInfo.quantityInStock || 0,
              image: productInfo.image || getImageUrl(detail.imageUrl || null),
              discount: detail.discount || 0,
            };
          })
        );

        setCartItems(cartItemsFromOrder);
      }

      if (fullOrderData.customerId) {
        setSelectedCustomer(fullOrderData.customerId);
        if (fullOrderData.customer) {
          setSelectedCustomerData(fullOrderData.customer);
        } else {
          try {
            const customerData = await getCustomerById(
              fullOrderData.customerId
            );
            setSelectedCustomerData(customerData);
          } catch {
            setSelectedCustomer(GUEST_CUSTOMER_ID);
            setSelectedCustomerData(guestCustomer);
          }
        }
      }

      setCreatedOrder(fullOrderData);

      let paymentMethod = null;
      if (fullOrderData.payment && fullOrderData.payment.paymentMethod) {
        const method = fullOrderData.payment.paymentMethod;
        if (method === "Tiền mặt" || method === "CASH" || method === "Cash") {
          paymentMethod = "cash";
        } else if (
          method === "MOMO" ||
          method === "Ví điện tử" ||
          method === "MoMo"
        ) {
          paymentMethod = "momo";
        }
      }

      setSelectedPaymentMethod(paymentMethod);

      message.success("Đã chọn đơn hàng. Vui lòng thanh toán.");
    } catch {
      message.error("Không thể tải đơn hàng vào POS");
    }
  };

  const handleOrderPayment = async (orderData) => {
    try {
      setCreatedOrder(orderData);

      let paymentMethod = null;
      if (orderData.payment && orderData.payment.paymentMethod) {
        const method = orderData.payment.paymentMethod;
        if (method === "Tiền mặt" || method === "CASH" || method === "Cash") {
          paymentMethod = "cash";
        } else if (
          method === "MOMO" ||
          method === "Ví điện tử" ||
          method === "MoMo"
        ) {
          paymentMethod = "momo";
        }
      }

      if (paymentMethod) {
        setSelectedPaymentMethod(paymentMethod);
        if (paymentMethod === "cash") {
          setShowCashPaymentModal(true);
        } else if (paymentMethod === "momo") {
          const momoPayUrl = orderData.payment?.notes?.startsWith("PAYURL:")
            ? orderData.payment.notes.substring("PAYURL:".length)
            : orderData.payment?.payUrl || null;
          if (momoPayUrl) {
            setShowMomoModal(true);
            startMoMoPaymentPolling(orderData.orderId);
          } else {
            message.warning(
              "Đơn hàng này chưa có link thanh toán MoMo. Vui lòng chọn lại phương thức thanh toán."
            );
            setShowPaymentMethodModal(true);
          }
        }
      } else {
        setSelectedPaymentMethod(null);
        setShowPaymentMethodModal(true);
      }
    } catch {
      message.error("Không thể xử lý thanh toán cho đơn hàng này");
    }
  };

  const startMoMoPaymentPolling = (orderId) => {
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
          return;
        }

        if (orderData.paymentStatus === "Đã thanh toán") {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;

          setShowMomoModal(false);

          try {
            const completedOrder = await completeOrder(orderId);
            setCompletedOrderForPrint(completedOrder);
            setShowOrderSuccessModal(true);
          } catch {
            message.error("Lỗi khi hoàn tất đơn hàng. Vui lòng thử lại!");
          }
          return;
        }

        const paymentFailed = orderData.paymentStatus === "Thất bại";

        if (paymentFailed) {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;
          setShowMomoModal(false);
          message.error("Thanh toán MoMo thất bại. Vui lòng thử lại!");
          handlePaymentCompleted();
          return;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearInterval(pollInterval);
          momoPollingIntervalRef.current = null;
          setShowMomoModal(false);
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          return;
        }
        if (pollCount % 10 === 0) {
          void 0;
        }
      }

      if (pollCount >= maxPollCount) {
        clearInterval(pollInterval);
        momoPollingIntervalRef.current = null;
        setShowMomoModal(false);
        message.error("Thanh toán MoMo quá thời gian. Vui lòng thử lại!");
        handlePaymentCompleted();
      }
    }, 3000); // Poll every 3 seconds

    momoPollingIntervalRef.current = pollInterval;
  };

  useEffect(() => {
    return () => {
      if (momoPollingIntervalRef.current) {
        clearInterval(momoPollingIntervalRef.current);
        momoPollingIntervalRef.current = null;
      }
    };
  }, []);

  const handlePaymentCompleted = async () => {
    // Reset cart và các state khác
    setCartItems([]);
    setCustomerSearchVisible(false);
    setCustomerSearchQuery("");
    setCustomerSearchResults([]);
    setShowCustomerDropdown(false);
    setSelectedShipping(null);
    setCreatedOrder(null);
    setSelectedPaymentMethod(null);
    setShowPaymentMethodModal(false);
    setShowCashPaymentModal(false);
    setUsePoints(0);
    setShowMomoModal(false);

    await fetchProducts();

    // Luôn reset về khách lẻ sau khi thanh toán xong
    setSelectedCustomer(GUEST_CUSTOMER_ID);
    setSelectedCustomerData(guestCustomer);
  };

  // Helper functions for CloseShiftModal
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Calculate expected drawer for close shift
  const [expectedDrawer, setExpectedDrawer] = useState(0);

  // Fetch orders and calculate expected drawer when modal opens
  useEffect(() => {
    const fetchExpectedDrawer = async () => {
      if (!showCloseShiftModal || !currentShift) {
        setExpectedDrawer(0);
        return;
      }

      try {
        const { getAllOrders } = await import("../../services/OrderService");
        const { getMyInfo } = await import("../../services/AccountService");

        const myInfoRes = await getMyInfo();
        const myAccountId = myInfoRes?.accountId || myInfoRes?.id;

        const allOrders = await getAllOrders();

        // Filter orders in current shift
        const fromTime = new Date(currentShift.openedAt).getTime();
        const toTime = Date.now();

        const shiftOrders = allOrders.filter((o) => {
          const orderAccountId =
            o.accountId || o.account?.id || o.account?.accountId;
          const isAccountMatch = String(orderAccountId) === String(myAccountId);
          const orderTime = new Date(
            o.orderDate || o.createdDate || o.createdAt
          ).getTime();
          const isTimeMatch = orderTime >= fromTime && orderTime <= toTime;
          return isAccountMatch && isTimeMatch;
        });

        // Calculate cash revenue from completed orders
        const completedOrders = shiftOrders.filter(
          (o) =>
            o.orderStatus?.toLowerCase().includes("hoàn tất") ||
            o.orderStatus?.toUpperCase() === "COMPLETED"
        );

        const cashRevenue = completedOrders
          .filter((o) => {
            const method = (
              o.payment?.paymentMethod ||
              o.paymentMethod ||
              ""
            ).toUpperCase();
            return method.includes("CASH") || method.includes("TIỀN MẶT");
          })
          .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

        const expected = (currentShift.initialCash || 0) + cashRevenue;
        setExpectedDrawer(expected);
      } catch (error) {
        console.error("Error calculating expected drawer:", error);
        setExpectedDrawer(currentShift.initialCash || 0);
      }
    };

    fetchExpectedDrawer();
  }, [showCloseShiftModal, currentShift]);

  const handleCloseShift = async () => {
    try {
      setShiftLoading(true);
      const total = closeShiftDenominations.reduce(
        (sum, d) => sum + d.denomination * d.quantity,
        0
      );

      const denominationsData = closeShiftDenominations.map((d) => ({
        denomination: d.denomination,
        quantity: d.quantity,
        totalValue: d.denomination * d.quantity,
      }));

      const res = await closeShift(total, closeShiftNote, denominationsData);
      setCurrentShift(res);
      setShowCloseShiftModal(false);
      setCloseShiftNote("");
      setCloseShiftDenominations([]);
      window.dispatchEvent(new CustomEvent("shiftUpdated", { detail: res }));
      message.success("Đã đóng ca thành công!");

      // Navigate về dashboard sau khi đóng ca
      setTimeout(() => {
        navigate("/sale-dashboard");
      }, 100); // Delay 1.5s để người dùng thấy message success
    } catch (error) {
      console.error("Error closing shift:", error);
      message.error(error.response?.data?.message || "Không thể đóng ca");
    } finally {
      setShiftLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      {/* Overlay khi ca chưa được mở */}
      {shiftNotOpenOverlay && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 9998,
              backdropFilter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              zIndex: 9999,
              minWidth: "450px",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#faad14"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V12"
                  stroke="#faad14"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1" fill="#faad14" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#262626",
                marginBottom: "12px",
              }}
            >
              Ca chưa được mở
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#595959",
                marginBottom: "24px",
              }}
            >
              Hãy liên hệ chủ cửa hàng để được mở ca
            </p>
            <button
              onClick={() => navigate("/sale-dashboard")}
              style={{
                padding: "10px 24px",
                fontSize: "16px",
                fontWeight: 500,
                color: "#fff",
                background: "#1890ff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#40a9ff";
                e.target.style.boxShadow = "0 4px 12px rgba(24, 144, 255, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#1890ff";
                e.target.style.boxShadow = "0 2px 8px rgba(24, 144, 255, 0.3)";
              }}
            >
              Quay về Dashboard
            </button>
          </div>
        </>
      )}
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row align-items-start pos-wrapper">
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
                  <div
                    ref={sliderContainerRef}
                    style={{ position: "relative" }}
                  >
                    <Slider
                      ref={sliderRef}
                      {...settings}
                      className={`tabs owl-carousel pos-category ${
                        categories.length + 1 < 6 ? "center-mode" : ""
                      }`}
                    >
                      <div
                        onClick={() => setActiveTab("all")}
                        className={`owl-item ${
                          activeTab === "all" ? "active" : ""
                        }`}
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
                        const categoryIds = getCategoryIdsForParent(
                          category.id
                        );
                        const productCount = products.filter((p) => {
                          const pCategoryIdStr = p.categoryId
                            ? String(p.categoryId)
                            : null;
                          return (
                            pCategoryIdStr &&
                            categoryIds.includes(pCategoryIdStr)
                          );
                        }).length;

                        return (
                          <div
                            key={category.id}
                            onClick={() => setActiveTab(category.id)}
                            className={`owl-item ${
                              activeTab === category.id ? "active" : ""
                            }`}
                            id={category.id}
                          >
                            <Link to="#">
                              <div className="category-placeholder">
                                {category.name}
                              </div>
                            </Link>
                            <h6>
                              <Link to="#">{category.name}</Link>
                            </h6>
                            <span>{productCount} Sản phẩm</span>
                          </div>
                        );
                      })}
                    </Slider>
                  </div>
                )}
                <div className="pos-products">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h4 className="mb-3">Sản phẩm</h4>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      {/* Barcode Scanner Input */}
                      <div
                        className="input-icon-start pos-search position-relative mb-3"
                        style={{ minWidth: "200px" }}
                      >
                        <input
                          id="barcode-input"
                          type="text"
                          className="form-control"
                          placeholder="Quét barcode"
                          value={barcodeInput}
                          onChange={handleBarcodeInputChange}
                          onKeyPress={handleBarcodeInputKeyPress}
                          onFocus={handleBarcodeInputFocus}
                          onBlur={handleBarcodeInputBlur}
                          style={{ paddingLeft: "40px" }}
                          disabled={isScanning}
                          autoFocus={!createdOrder}
                        />
                        <span
                          className="input-icon-addon"
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                            pointerEvents: "none",
                          }}
                        >
                          <i className="ti ti-scan" />
                        </span>
                        {isScanning && (
                          <span
                            className="position-absolute"
                            style={{
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              zIndex: 1,
                            }}
                          >
                            <Spin size="small" />
                          </span>
                        )}
                      </div>

                      {/* Search by name input */}
                      <div className="input-icon-start pos-search position-relative mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ paddingLeft: "40px" }}
                        />
                        <span
                          className="input-icon-addon"
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                            pointerEvents: "none",
                          }}
                        >
                          <i className="ti ti-search" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tabs_container">
                    <div className="tab_content active" data-tab={activeTab}>
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
                              <div
                                key={product.id}
                                className="col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3"
                              >
                                <div
                                  className="product-info card"
                                  onClick={(e) => handleAddToCart(product, e)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Link
                                    to="#"
                                    className="pro-img"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <div className="product-image-placeholder">
                                      <img
                                        src={product.image || getImageUrl(null)}
                                        alt={product.name}
                                      />
                                    </div>
                                    <span>
                                      <i className="ti ti-circle-check-filled" />
                                    </span>
                                  </Link>
                                  <h6 className="cat-name">
                                    <Link
                                      to="#"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      {product.categoryName || "Danh mục"}
                                    </Link>
                                  </h6>
                                  <h6 className="product-name">
                                    <Link
                                      to="#"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      {product.name}
                                    </Link>
                                  </h6>
                                  <div className="d-flex align-items-start justify-content-between price">
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        color: "#6c757d",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      {product.stock || 0} Cái
                                    </span>
                                    <div
                                      className="text-end"
                                      style={{ minWidth: "140px" }}
                                    >
                                      {product.discountPercent > 0 ? (
                                        <div className="d-flex flex-column align-items-end">
                                          <div className="d-flex align-items-center gap-1 mb-1">
                                            <small
                                              className="text-muted text-decoration-line-through"
                                              style={{ fontSize: "12px" }}
                                            >
                                              {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                              }).format(
                                                product.originalPrice || 0
                                              )}
                                            </small>
                                            <span
                                              className="badge"
                                              style={{
                                                fontSize: "10px",
                                                padding: "2px 6px",
                                                backgroundColor: "#ff4d4f",
                                                color: "white",
                                                fontWeight: "600",
                                              }}
                                            >
                                              -{product.discountPercent}%
                                            </span>
                                          </div>
                                          <p
                                            className="mb-0 fw-bold"
                                            style={{
                                              fontSize: "15px",
                                              color: "#ff4d4f",
                                            }}
                                          >
                                            {new Intl.NumberFormat("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                            }).format(product.price || 0)}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="d-flex flex-column align-items-end">
                                          <div
                                            style={{
                                              height: "20px",
                                              marginBottom: "4px",
                                            }}
                                          ></div>
                                          <p
                                            className="mb-0 fw-semibold"
                                            style={{
                                              fontSize: "15px",
                                              color: "#1f1f1f",
                                            }}
                                          >
                                            {new Intl.NumberFormat("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                            }).format(product.price || 0)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
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
              <aside
                className="product-order-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 20px)",
                }}
                onClick={(e) => {
                  if (
                    !createdOrder &&
                    !customerSearchVisible &&
                    !e.target.closest("input") &&
                    !e.target.closest("button") &&
                    !e.target.closest("a")
                  ) {
                    focusBarcodeInput(false);
                  }
                }}
              >
                {createdOrder && (
                  <div className="order-head bg-light d-flex align-items-center justify-content-between w-100">
                    <div>
                      <h3>Đơn hàng</h3>
                      <span>
                        Mã giao dịch : #
                        {createdOrder.orderNumber ||
                          createdOrder.orderId ||
                          "-"}
                      </span>
                    </div>
                    <div>
                      <Link
                        className="link-danger fs-16"
                        to="#"
                        onClick={async (e) => {
                          e.preventDefault();
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
                  {selectedCustomerData &&
                    String(selectedCustomer) !== GUEST_CUSTOMER_ID && (
                      <div className="mb-3">
                        <div className="mb-2">
                          <span className="text-muted">Điểm tích lũy: </span>
                          <span className="fw-bold text-primary">
                            {new Intl.NumberFormat("vi-VN").format(
                              selectedCustomerData.points ?? 0
                            )}{" "}
                            điểm
                          </span>
                        </div>
                        {!createdOrder &&
                          (selectedCustomerData.points ?? 0) > 0 &&
                          totals.totalBeforePoints > 0 && (
                            <div>
                              <label className="form-label small">
                                Sử dụng điểm (tối đa{" "}
                                {Math.min(
                                  selectedCustomerData.points ?? 0,
                                  Math.floor(totals.totalBeforePoints)
                                )}{" "}
                                điểm):
                              </label>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                max={Math.min(
                                  selectedCustomerData.points ?? 0,
                                  Math.floor(totals.totalBeforePoints)
                                )}
                                value={usePoints}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const maxUsable = Math.min(
                                    selectedCustomerData.points ?? 0,
                                    Math.floor(totals.totalBeforePoints)
                                  );
                                  setUsePoints(
                                    Math.max(0, Math.min(value, maxUsable))
                                  );
                                }}
                                placeholder="Nhập số điểm muốn sử dụng"
                              />
                              {usePoints > 0 && (
                                <small className="text-muted">
                                  Sẽ giảm{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(usePoints)}{" "}
                                  từ tổng tiền
                                </small>
                              )}
                            </div>
                          )}
                        {createdOrder && createdOrder.pointsRedeemed > 0 && (
                          <div className="mb-2">
                            <small className="text-muted">
                              Điểm đã sử dụng:{" "}
                            </small>
                            <span className="fw-bold text-success">
                              {new Intl.NumberFormat("vi-VN").format(
                                createdOrder.pointsRedeemed
                              )}{" "}
                              điểm
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerSearchVisible(true);
                            // Focus vào input sau khi render
                            setTimeout(() => {
                              const customerInput = document.querySelector(
                                ".customer-search-input"
                              );
                              if (customerInput) {
                                customerInput.focus();
                              }
                            }, 0);
                          }}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <span>
                            {selectedCustomerData?.fullName ||
                              selectedCustomerData?.customerName ||
                              ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow-1 position-relative">
                        <input
                          type="text"
                          className="form-control customer-search-input"
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
                            setTimeout(
                              () => setShowCustomerDropdown(false),
                              200
                            );
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        {showCustomerDropdown &&
                          customerSearchResults.length > 0 && (
                            <div
                              className="position-absolute w-100 bg-white border rounded shadow-lg"
                              style={{
                                zIndex: 1000,
                                maxHeight: "200px",
                                overflowY: "auto",
                                top: "100%",
                                marginTop: "2px",
                              }}
                            >
                              {customerSearchResults.map((customer) => (
                                <div
                                  key={customer.customerId}
                                  className="p-2 border-bottom cursor-pointer"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleSelectCustomer(customer)}
                                  onMouseDown={(e) => e.preventDefault()} // Prevent blur
                                >
                                  <div className="fw-bold">
                                    {customer.fullName || customer.customerName}
                                  </div>
                                  <div className="text-muted small">
                                    {customer.phone || ""}
                                  </div>
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
                <div
                  className="product-added block-section"
                  style={{
                    flex: 1,
                    marginBottom: "20px",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <div
                    className="head-text d-flex align-items-center justify-content-between"
                    style={{ flexShrink: 0 }}
                  >
                    <h5 className="d-flex align-items-center mb-0">
                      Sản phẩm đã thêm
                      <span className="count">{cartItems.length}</span>
                    </h5>
                    {cartItems.length > 0 && (
                      <Link
                        to="#"
                        className="d-flex align-items-center link-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          setCartItems([]);
                          showMessage("info", "Đã xóa tất cả sản phẩm");
                        }}
                      >
                        <span className="me-2">
                          <i className="feather icon-x feather-16" />
                        </span>
                        Xóa tất cả
                      </Link>
                    )}
                  </div>
                  <div
                    className="product-wrap"
                    style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
                  >
                    {cartItems.length === 0 ? (
                      <div className="empty-cart">
                        <div className="fs-24 mb-1">
                          <i className="ti ti-shopping-cart" />
                        </div>
                        <p className="fw-bold">Chưa có sản phẩm nào</p>
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="product-list d-flex align-items-center justify-content-between"
                          style={{ flexWrap: "nowrap", gap: "10px" }}
                        >
                          <div
                            className="d-flex align-items-center product-info flex-grow-1"
                            style={{ minWidth: 0 }}
                          >
                            <Link
                              to="#"
                              className="pro-img"
                              onClick={(e) => e.preventDefault()}
                            >
                              <div className="product-image-placeholder">
                                <img
                                  src={item.image || getImageUrl(null)}
                                  alt={item.name}
                                />
                              </div>
                            </Link>
                            <div
                              className="info"
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              <span>{item.code || "N/A"}</span>
                              <h6>
                                <Link
                                  to="#"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  {item.name}
                                </Link>
                              </h6>
                              {item.discountPercent > 0 ? (
                                <div>
                                  {/* Dòng 1: Giá sau giảm + Badge giảm giá */}
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span
                                      className="fw-bold price-text"
                                      style={{
                                        fontSize: "16px",
                                        color: "#ff4d4f",
                                        background: "transparent",
                                        padding: "0",
                                        minWidth: "auto",
                                      }}
                                    >
                                      {new Intl.NumberFormat("vi-VN").format(
                                        item.price
                                      )}{" "}
                                      đ
                                    </span>
                                    <span
                                      className="badge"
                                      style={{
                                        fontSize: "11px",
                                        padding: "3px 8px",
                                        backgroundColor: "#ff4d4f",
                                        color: "white",
                                        fontWeight: "600",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      -{item.discountPercent}%
                                    </span>
                                  </div>
                                  {/* Dòng 2: Giá gốc gạch ngang */}
                                  <div>
                                    <small
                                      className="text-muted text-decoration-line-through"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {new Intl.NumberFormat("vi-VN").format(
                                        item.originalPrice
                                      )}{" "}
                                      đ
                                    </small>
                                  </div>
                                </div>
                              ) : (
                                <p
                                  className="mb-0 fw-semibold"
                                  style={{
                                    fontSize: "16px",
                                    color: "#1f1f1f",
                                  }}
                                >
                                  {new Intl.NumberFormat("vi-VN").format(
                                    item.price
                                  )}{" "}
                                  đ
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            className="qty-item text-center"
                            style={{ flexShrink: 0 }}
                          >
                            <CounterTwo
                              defaultValue={item.quantity}
                              onChange={(value) =>
                                handleUpdateQuantity(item.id, value)
                              }
                            />
                          </div>
                          <div
                            className="d-flex align-items-center action"
                            style={{ flexShrink: 0 }}
                          >
                            <Link
                              className="btn-icon delete-icon"
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCartItems(
                                  cartItems.filter((i) => i.id !== item.id)
                                );
                                showMessage(
                                  "success",
                                  "Đã xóa sản phẩm khỏi giỏ hàng"
                                );
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
                <div
                  style={{
                    marginTop: "auto",
                    backgroundColor: "#fff",
                    paddingTop: "15px",
                    borderTop: "1px solid #e9ecef",
                    flexShrink: 0,
                  }}
                >
                  <div className="btn-block">
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <table className="table-borderless w-100 table-fit mb-0">
                          <tbody>
                            <tr>
                              <td className="fw-bold">Tạm tính:</td>
                              <td className="text-end">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(totals.subTotal || 0)}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Chiết khấu:</td>
                              <td className="text-end">
                                {totals.discountPercent > 0
                                  ? `${totals.discountPercent}%`
                                  : "0%"}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Thuế:</td>
                              <td className="text-end">
                                {totals.taxPercent > 0
                                  ? `${totals.taxPercent}%`
                                  : "0%"}
                              </td>
                            </tr>
                            {totals.pointsUsed > 0 && (
                              <tr>
                                <td className="fw-bold">Điểm đã sử dụng:</td>
                                <td className="text-end text-success">
                                  -
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(totals.pointsUsed || 0)}
                                </td>
                              </tr>
                            )}
                            {createdOrder &&
                              createdOrder.paymentStatus ===
                                "Chưa thanh toán" && (
                                <tr>
                                  <td className="fw-bold">Còn nợ:</td>
                                  <td className="text-end fw-bold text-danger">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(totals.total || 0)}
                                  </td>
                                </tr>
                              )}
                            {createdOrder &&
                              createdOrder.paymentStatus ===
                                "Đã thanh toán" && (
                                <tr>
                                  <td className="fw-bold">Còn nợ:</td>
                                  <td className="text-end fw-bold text-success">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(0)}
                                  </td>
                                </tr>
                              )}
                            {!createdOrder && (
                              <tr>
                                <td className="fw-bold">Tổng phải trả:</td>
                                <td className="text-end fw-bold">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(totals.total || 0)}
                                </td>
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
                      style={{ minWidth: "200px" }}
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
                        style={{ minWidth: "200px" }}
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
          const completedOrder = await completeOrder(orderId);
          setCompletedOrderForPrint(completedOrder);
          setShowOrderSuccessModal(true);
        }}
        onCashPaymentCompleted={async (orderId) => {
          const completedOrder = await completeOrder(orderId);
          setCompletedOrderForPrint(completedOrder);
          setShowOrderSuccessModal(true);
        }}
        onHandleOrderPayment={handleOrderPayment}
        onSelectOrder={handleSelectOrder}
        showShiftModal={showShiftModal}
        onCloseShiftModal={() => setShowShiftModal(false)}
        currentShift={currentShift}
        shiftLoading={shiftLoading}
        onOpenShift={async (amount, cashDenominations = []) => {
          if (!amount || Number(amount) < 0) {
            message.error("Nhập số tiền mặt hợp lệ");
            return;
          }
          try {
            const denominationsData = cashDenominations.map((d) => ({
              denomination: d.denomination,
              quantity: d.quantity,
              totalValue: d.denomination * d.quantity,
            }));

            console.log("🟢 Opening shift with:", {
              amount: Number(amount),
              denominationsCount: denominationsData.length,
              denominations: denominationsData,
            });

            const res = await openShift(Number(amount), denominationsData);
            console.log("✅ Shift opened successfully:", res);
            setCurrentShift(res);
            setShowShiftModal(false);
            window.dispatchEvent(
              new CustomEvent("shiftUpdated", { detail: res })
            );
            message.success("Đã mở ca");
          } catch (error) {
            console.error("❌ Error opening shift:", error);
            message.error("Không thể mở ca");
          }
        }}
        onCloseShift={async (amount, note, cashDenominations = []) => {
          if (amount === undefined || Number(amount) < 0) {
            message.error("Nhập số tiền mặt hiện tại hợp lệ");
            return;
          }
          try {
            const denominationsData = cashDenominations.map((d) => ({
              denomination: d.denomination,
              quantity: d.quantity,
              totalValue: d.denomination * d.quantity,
            }));

            console.log("🔵 Closing shift with:", {
              amount: Number(amount),
              note,
              denominationsCount: denominationsData.length,
              denominations: denominationsData,
            });

            const res = await closeShift(
              Number(amount),
              note,
              denominationsData
            );
            console.log("✅ Shift closed successfully:", res);
            setCurrentShift(res);
            setShowShiftModal(false);
            window.dispatchEvent(
              new CustomEvent("shiftUpdated", { detail: res })
            );
            message.success("Đã đóng ca");
          } catch (error) {
            console.error("❌ Error closing shift:", error);
            message.error("Không thể đóng ca");
          }
        }}
      />
      <AddCustomerModal
        isOpen={addCustomerModalOpen}
        initialPhone={customerSearchQuery}
        onClose={() => setAddCustomerModalOpen(false)}
        onSuccess={handleCustomerCreated}
      />
      <CloseShiftModal
        visible={showCloseShiftModal}
        onCancel={() => {
          setShowCloseShiftModal(false);
          setCloseShiftNote("");
          setCloseShiftDenominations([]);
        }}
        onConfirm={handleCloseShift}
        loading={shiftLoading}
        currentShift={currentShift}
        expectedDrawer={expectedDrawer}
        closingNote={closeShiftNote}
        setClosingNote={setCloseShiftNote}
        cashDenominations={closeShiftDenominations}
        setCashDenominations={setCloseShiftDenominations}
        formatDateTime={formatDateTime}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Pos;
