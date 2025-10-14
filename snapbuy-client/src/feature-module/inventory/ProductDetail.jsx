import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { barcodeImg1, printer, product69 } from "../../utils/imagepath";
import { getProductById } from "../../services/productService";

const ProductDetail = () => {
  const { id } = useParams(); // ✅ Lấy id từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Gọi API lấy chi tiết sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res);
      } catch (err) {
        console.error("❌ Lỗi khi load chi tiết sản phẩm:", err);
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
            <h4>Product Details</h4>
            <h6>Full details of a product</h6>
          </div>
          <Link to="/product-list" className="btn btn-secondary">
            ← Back to List
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
                      <h4>Code</h4>
                      <h6>{product.productCode}</h6>
                    </li>
                    <li>
                      <h4>Product</h4>
                      <h6>{product.productName || "—"}</h6>
                    </li>
                    <li>
                      <h4>Category</h4>
                      <h6>{product.categoryName || "—"}</h6>
                    </li>
                    <li>
                      <h4>Unit</h4>
                      <h6>{product.unit || "—"}</h6>
                    </li>
                    <li>
                      <h4>Price</h4>
                      <h6>{product.unitPrice?.toLocaleString()} ₫</h6>
                    </li>
                    <li>
                      <h4>Status</h4>
                      <h6>{product.active ? "Active" : "Inactive"}</h6>
                    </li>
                    <li>
                      <h4>Description</h4>
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
