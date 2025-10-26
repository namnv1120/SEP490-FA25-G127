import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { barcodeImg1, printer, product69 } from "../../utils/imagepath";
import { getProductById } from "../../services/ProductService";
import { all_routes } from "../../routes/all_routes";

const ProductDetail = () => {
  const route = all_routes;
  const { id } = useParams(); // ✅ Lấy id từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res);
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <h5>Không tìm thấy sản phẩm!</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header d-flex justify-content-between align-items-center">
          <div className="page-title">
            <h4>Chi tiết sản phẩm</h4>
            <h6>Chi tiết tất cả của sản phẩm</h6>
          </div>
          <Link to={route.products} className="btn btn-primary">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>

        {/* Product info */}
        <div className="row">
          <div className="col-lg-8 col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="bar-code-view">
                  <img src={barcodeImg1} alt="barcode" />
                  <Link to="#" className="printimg">
                    <img src={printer} alt="print" />
                  </Link>
                </div>

                <div className="productdetails">
                  <ul className="product-bar">
                    <li>
                      <h4>Mã sản phẩm</h4>
                      <h6>{product.productCode}</h6>
                    </li>
                    <li>
                      <h4>Tên sản phẩm</h4>
                      <h6>{product.productName || "—"}</h6>
                    </li>
                    <li>
                      <h4>Danh mục</h4>
                      <h6>{product.categoryName || "—"}</h6>
                    </li>
                    <li>
                      <h4>Đơn vị</h4>
                      <h6>{product.unit || "—"}</h6>
                    </li>
                    <li>
                      <h4>Kích thước</h4>
                      <h6>{product.dimensions || "—"}</h6>
                    </li>
                    <li>
                      <h4>Giá bán</h4>
                      <h6>{product.unitPrice?.toLocaleString()} ₫</h6>
                    </li>
                    <li>
                      <h4>Giá nhập</h4>
                      <h6>{product.costPrice?.toLocaleString()} ₫</h6>
                    </li>
                    <li>
                      <h4>Nhà cung cấp</h4>
                      <h6>{product.supplierName || "—"}</h6>
                    </li>
                    <li>
                      <h4>Ngày tạo</h4>
                      <h6>
                        {product.createdDate
                          ? new Date(product.createdDate).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "—"}
                      </h6>
                    </li>
                    <li>
                      <h4>Ngày cập nhật</h4>
                      <h6>
                        {product.updatedDate
                          ? new Date(product.updatedDate).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "—"}
                      </h6>
                    </li>
                    <li>
                      <h4>Mô tả</h4>
                      <h6>{product.description || "No description"}</h6>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Image section */}
          <div className="col-lg-4 col-sm-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="slider-product-details">
                  <div className="slider-product">
                    <img
                      src={product.productImage || product69}
                      alt="img"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                      onError={(e) => (e.target.src = product69)}
                    />
                    <h4>{product.productImage?.split("/").pop() || "image.jpg"}</h4>
                    <h6>—</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /row */}
      </div>
    </div>
  );
};

export default ProductDetail;
