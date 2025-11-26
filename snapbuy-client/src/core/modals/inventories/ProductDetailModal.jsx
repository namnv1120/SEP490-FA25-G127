import { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message } from "antd";
import { getProductById } from "../../../services/ProductService";
import { getImageUrl } from "../../../utils/imageUtils";
import { product69 } from "../../../utils/imagepath";
import {
  downloadBarcode,
  displayBarcodePreview,
} from "../../../utils/barcodeUtils";

const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);

  const fetchProductDetail = useCallback(async () => {
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

      if (
        error.message?.includes("Status: 404") ||
        error.message?.includes("Status: 500")
      ) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, onClose]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail();
    }
  }, [isOpen, productId, fetchProductDetail]);

  // Hiển thị barcode preview khi product thay đổi
  useEffect(() => {
    const updateBarcodePreview = async () => {
      const container = document.getElementById("barcode-preview-detail");
      if (!container) return;

      if (product?.barcode?.trim()) {
        await displayBarcodePreview(
          product.barcode,
          "barcode-preview-detail",
          310,
          110
        );

        // Đảm bảo image vừa khung
        setTimeout(() => {
          const img = container.querySelector("img");
          if (img) {
            img.style.maxWidth = "100%";
            img.style.width = "100%";
            img.style.height = "auto";
            img.style.display = "block";
            img.style.margin = "0 auto";
            img.style.objectFit = "contain";
          }
        }, 100);
      } else {
        container.innerHTML =
          '<div class="text-center text-muted"><small>Sản phẩm chưa có barcode</small></div>';
      }
    };

    updateBarcodePreview();
  }, [product?.barcode]);

  const productImageUrl = product
    ? getImageUrl(product.imageUrl) || product69
    : product69;

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
          {product && <span className="text-muted">{product.productCode}</span>}
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
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className="bar-code-view"
                      style={{ flex: 1, maxWidth: "350px" }}
                    >
                      <div
                        id="barcode-preview-detail"
                        style={{
                          width: "100%",
                          minHeight: "110px",
                          aspectRatio: "3 / 1", // Tỷ lệ hình chữ nhật dài hơn
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#fff",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                          padding: "15px 20px", // Tăng padding để text không bị cắt
                          overflow: "visible", // Đổi thành visible để text không bị cắt
                          boxSizing: "border-box",
                        }}
                      >
                        {!product?.barcode?.trim() && (
                          <div className="text-center text-muted">
                            <small>Sản phẩm chưa có barcode</small>
                          </div>
                        )}
                      </div>
                    </div>
                    {product?.barcode?.trim() && (
                      <button
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                        onClick={async () => {
                          try {
                            await downloadBarcode(
                              product.barcode,
                              product.productName || "SanPham"
                            );
                            message.success("Đã tải barcode về máy");
                          } catch (error) {
                            message.error(
                              error.message || "Không thể tải barcode"
                            );
                          }
                        }}
                        title="Tải barcode về máy"
                        style={{
                          minWidth: "45px",
                          height: "45px",
                          padding: "0",
                        }}
                      >
                        <i
                          className="ti ti-download"
                          style={{ fontSize: "20px" }}
                        />
                      </button>
                    )}
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
                        <h6>{product.parentCategoryName || product.categoryName || "—"}</h6>
                      </li>
                      <li>
                        <h4>Danh mục con</h4>
                        <h6>{product.subCategoryName || "—"}</h6>
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
                        <h4>Đơn vị</h4>
                        <h6>{product.unit || "—"}</h6>
                      </li>
                      <li>
                        <h4>Kích thước</h4>
                        <h6>{product.dimensions || "—"}</h6>
                      </li>
                      <li>
                        <h4>Nhà cung cấp</h4>
                        <h6>{product.supplierName || "—"}</h6>
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
