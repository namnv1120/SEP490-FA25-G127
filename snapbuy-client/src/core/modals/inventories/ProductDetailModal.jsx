import { useState, useEffect } from "react";
import { Modal, Spin, message } from "antd";
import { getProductById } from "../../../services/ProductService";
import { getImageUrl } from "../../../utils/imageUtils";
import { barcodeImg1, printer, product69 } from "../../../utils/imagepath";

const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail();
    }
  }, [isOpen, productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);

      if (!data) {
        message.warning("Không tìm thấy dữ liệu sản phẩm!");
        onClose();
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("❌ Lỗi chi tiết:", error);
      const errorMessage = error.message || "Không thể tải chi tiết sản phẩm!";
      message.error(errorMessage);

      if (error.message?.includes("Status: 404") || error.message?.includes("Status: 500")) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const productImageUrl = product ? (getImageUrl(product.imageUrl) || product69) : product69;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered={true}
      closable={true}
      title={
        <div>
          <h4 className="mb-1">Chi tiết sản phẩm</h4>
          {product && (
            <span className="text-muted">
              {product.productCode}
            </span>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Spin size="large" />
        </div>
      ) : product ? (
        <div className="product-detail-modal">
          <div className="row">
            <div className="col-lg-8 col-sm-12">
              <div className="card mb-3">
                <div className="card-body">
                  <div className="bar-code-view">
                    <img src={barcodeImg1} alt="barcode" />
                    <button className="printimg border-0 bg-transparent">
                      <img src={printer} alt="print" />
                    </button>
                  </div>

                  <div className="productdetails">
                    <ul className="product-bar">
                      <li>
                        <h4>Mã sản phẩm</h4>
                        <h6>{product.productCode || "—"}</h6>
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
                        <h6>{product.unitPrice?.toLocaleString() || "0"} ₫</h6>
                      </li>
                      <li>
                        <h4>Giá nhập</h4>
                        <h6>{product.costPrice?.toLocaleString() || "0"} ₫</h6>
                      </li>
                      <li>
                        <h4>Nhà cung cấp</h4>
                        <h6>{product.supplierName || "—"}</h6>
                      </li>
                      <li>
                        <h4>Ngày tạo</h4>
                        <h6>{formatDateTime(product.createdDate)}</h6>
                      </li>
                      <li>
                        <h4>Ngày cập nhật</h4>
                        <h6>{formatDateTime(product.updatedDate)}</h6>
                      </li>
                      <li>
                        <h4>Mô tả</h4>
                        <h6>{product.description || "Không có mô tả"}</h6>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Image section */}
            <div className="col-lg-4 col-sm-12">
              <div className="card mb-3">
                <div className="card-body text-center">
                  <div className="slider-product-details">
                    <div className="slider-product">
                      <img
                        src={productImageUrl}
                        alt={product.productName}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src = product69;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NÚT ACTION */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-5">
          <p className="text-muted">Không tìm thấy thông tin sản phẩm</p>
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailModal;


