import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PosModals from "../../core/modals/pos-modal/posModalstjsx";
import CounterTwo from "../../components/counter/counterTwo.jsx";
import {
  card,
  cashIcon,
  category1,
  category2,
  category3,
  category4,
  category5,
  category6,
  category7,
  cheque,
  desposit,
  emptyCart,
  points,
  posProduct01,
  posProduct02,
  posProduct03,
  posProduct05,
  posProduct06,
  posProduct07,
  posProduct08,
  posProduct09,
  posProduct10,
  posProduct11,
  posProduct12,
  posProduct13,
  posProduct14,
  posProduct15,
  posProduct16,
  posProduct17,
  posProduct18,
  product4,
} from "../../utils/imagepath";
import CommonSelect from "../../components/select/common-select";

const Pos = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAlert1, setShowAlert1] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const Location = useLocation();
  const settings = {
    dots: false,
    autoplay: false,
    slidesToShow: 6,
    margin: 0,
    arrows: false,
    speed: 500,
    infinite: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 8,
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
  const options = [
    { value: "walkInCustomer", label: "Walk in Customer" },
    { value: "john", label: "John" },
    { value: "smith", label: "Smith" },
    { value: "ana", label: "Ana" },
    { value: "elza", label: "Elza" },
  ];

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      const productInfo = target.closest && target.closest(".product-info");

      if (productInfo) {
        productInfo.classList.toggle("active");

        const emptyCartEl = document.querySelector(".product-wrap .empty-cart");
        const productListEl = document.querySelector(".product-wrap .product-list");

        const hasActive = document.querySelectorAll(".product-info.active").length > 0;

        if (hasActive) {
          if (emptyCartEl) emptyCartEl.style.display = "none";
          if (productListEl) productListEl.style.display = "flex";
        } else {
          if (emptyCartEl) emptyCartEl.style.display = "flex";
          if (productListEl) productListEl.style.display = "none";
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

  return (
    <div className="main-wrapper pos-three">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row align-items-start pos-wrapper">
            {/* Products */}
            <div className="col-md-12 col-lg-7 col-xl-8">
              <div className="pos-categories tabs_wrapper">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                  <div>
                    <h5 className="mb-1">Welcome, Wesley Adrian</h5>
                    <p>December 24, 2024</p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="input-icon-start pos-search position-relative">
                      <span className="input-icon-addon">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Product"
                      />
                    </div>
                    <Link to="#" className="btn btn-sm btn-primary">
                      View All Categories
                    </Link>
                  </div>
                </div>
                <Slider
                  {...settings}
                  className="tabs owl-carousel pos-category3 mb-4"
                >
                  <li
                    onClick={() => setActiveTab("all")}
                    className={`owl-item ${activeTab === "all" ? "active" : ""}`}
                    id="all"
                  >
                    <Link to="#">
                      <img src={category1} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">All Categories</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("headphones")}
                    className={`owl-item ${activeTab === "headphones" ? "active" : ""}`}
                    id="headphones"
                  >
                    <Link to="#">
                      <img src={category2} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Headphones</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("shoes")}
                    className={`owl-item ${activeTab === "shoes" ? "active" : ""}`}
                    id="shoes"
                  >
                    <Link to="#">
                      <img src={category3} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Shoes</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("mobiles")}
                    className={`owl-item ${activeTab === "mobiles" ? "active" : ""}`}
                    id="mobiles"
                  >
                    <Link to="#">
                      <img src={category4} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Mobiles</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("watches")}
                    className={`owl-item ${activeTab === "watches" ? "active" : ""}`}
                    id="watches"
                  >
                    <Link to="#">
                      <img src={category5} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Watches</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("laptops")}
                    className={`owl-item ${activeTab === "laptops" ? "active" : ""}`}
                    id="laptops"
                  >
                    <Link to="#">
                      <img src={category6} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Laptops</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("homeneed")}
                    className={`owl-item ${activeTab === "homeneed" ? "active" : ""}`}
                    id="homeneed"
                  >
                    <Link to="#">
                      <img src={category7} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Home Needs</Link>
                    </h6>
                  </li>
                  <li
                    onClick={() => setActiveTab("headphone")}
                    className={`owl-item ${activeTab === "headphone" ? "active" : ""}`}
                    id="headphone"
                  >
                    <Link to="#">
                      <img src={category2} alt="Categories" />
                    </Link>
                    <h6>
                      <Link to="#">Headphones</Link>
                    </h6>
                  </li>
                </Slider>
                <div className="pos-products">
                  <div className="tabs_container">
                    <div
                      className={`tab_content ${activeTab === "all" ? "active" : ""} `}
                      data-tab="all"
                    >
                      <div className="row row-cols-xxl-5 g-3">
                        <div className="col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl">
                          <div
                            className="product-info card"
                            onClick={() => setShowAlert1(!showAlert1)}
                          >
                            <Link to="#" className="product-image">
                              <img src={posProduct01} alt="Products" />
                            </Link>
                            <div className="product-content">
                              <h6 className="fs-14 fw-bold mb-1">
                                <Link to="#">Charger Cable</Link>
                              </h6>
                              <div className="d-flex align-items-center justify-content-between">
                                <h6 className="text-teal fs-14 fw-bold">$30</h6>
                                <p className="text-pink">40 Pcs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* ... (giữ nguyên tất cả product items như file gốc) */}
                        <div className="col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl">
                          <div
                            className="product-info card"
                            onClick={() => setShowAlert1(!showAlert1)}
                          >
                            <Link to="#" className="product-image">
                              <img src={posProduct17} alt="Products" />
                            </Link>
                            <div className="product-content">
                              <h6 className="fs-14 fw-bold mb-1">
                                <Link to="#">Aroma Coffee Maker</Link>
                              </h6>
                              <div className="d-flex align-items-center justify-content-between">
                                <h6 className="text-teal fs-14 fw-bold">
                                  $170
                                </h6>
                                <p className="text-pink">35 Pcs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Các tab khác giữ nguyên nội dung như file gốc */}
                    <div
                      className={`tab_content ${activeTab === "headphones" ? "active" : ""} `}
                      data-tab="headphones"
                    >
                      <div className="row row-cols-xxl-5 g-3">
                        <div className="col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl">
                          <div
                            className="product-info card"
                            onClick={() => setShowAlert1(!showAlert1)}
                          >
                            <Link to="#" className="product-image">
                              <img src={posProduct02} alt="Products" />
                            </Link>
                            <div className="product-content">
                              <h6 className="fs-14 fw-bold mb-1">
                                <Link to="#">Apple Airpods 2</Link>
                              </h6>
                              <div className="d-flex align-items-center justify-content-between">
                                <h6 className="text-teal fs-14 fw-bold">
                                  $120
                                </h6>
                                <p className="text-pink">25 Pcs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* ... */}
                      </div>
                    </div>

                    {/* keep other tabs (shoes, mobiles, watches, laptops, homeneed, headphone) unchanged */}
                  </div>
                </div>
              </div>
            </div>
            {/* /Products */}
            {/* Order Details */}
            <div className="col-md-12 col-lg-5 col-xl-4 ps-0 theiaStickySidebar">
              <aside className="product-order-list">
                <div className="customer-info">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <div className="d-flex align-items-center">
                      <h4 className="mb-0">New Order</h4>
                      <span className="badge badge-purple badge-xs fs-10 fw-medium ms-2">
                        #5655898
                      </span>
                    </div>
                    <Link
                      to="#"
                      className="btn btn-sm btn-outline-primary shadow-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#create"
                    >
                      Add Customer
                    </Link>
                  </div>
                  <CommonSelect
                    options={options}
                    className="select"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.value)}
                    placeholder="Choose a Name"
                    filter={false}
                  />
                </div>
                <div className="product-added block-section">
                  <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <h5 className="d-flex align-items-center mb-0">
                      Order Details
                    </h5>
                    <div className="badge bg-light text-gray-9 fs-12 fw-semibold py-2 border rounded">
                      Items : <span className="text-teal">3</span>
                    </div>
                  </div>
                  <div className="product-wrap">
                    <div className="empty-cart">
                      <div className="mb-1">
                        <img src={emptyCart} alt="img" />
                      </div>
                      <p className="fw-bold">No Products Selected</p>
                    </div>
                    <div className="product-list border-0 p-0">
                      <div className="table-responsive">
                        <table className="table table-borderless">
                          <thead>
                            <tr>
                              <th className="bg-transparent fw-bold">
                                Product
                              </th>
                              <th className="bg-transparent fw-bold">QTY</th>
                              <th className="bg-transparent fw-bold">Price</th>
                              <th className="bg-transparent fw-bold text-end" />
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <div className="d-flex align-items-center mb-1">
                                  <h6 className="fs-16 fw-medium">
                                    <Link
                                      to="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#products"
                                    >
                                      Iphone 11S
                                    </Link>
                                  </h6>
                                  <Link
                                    to="#"
                                    className="ms-2 edit-icon"
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit-product"
                                  >
                                    <i className="ti ti-edit" />
                                  </Link>
                                </div>
                                Price : $400
                              </td>
                              <td>
                                <div className="qty-item m-0">
                                  <CounterTwo defaultValue={4} />
                                </div>
                              </td>
                              <td className="fw-bold">$400</td>
                              <td className="text-end">
                                <Link
                                  className="btn-icon delete-icon"
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete"
                                >
                                  <i className="ti ti-trash" />
                                </Link>
                              </td>
                            </tr>

                            {/* Các hàng khác giữ nguyên */}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
            {/* /Order Details */}
          </div>
        </div>
      </div>

      {/* nếu file gốc có modals hoặc component phụ, giữ nguyên import */}
      <PosModals />
    </div>
  );
};

export default Pos;
