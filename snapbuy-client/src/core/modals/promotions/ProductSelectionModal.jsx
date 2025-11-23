import { useState, useEffect } from "react";
import { Modal, Input } from "antd";

const { Search } = Input;

const ProductSelectionModal = ({ isOpen, onClose, products, selectedProductIds, onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedProductIds || []);
      setFilteredProducts(products);
      setSearchTerm("");
    }
  }, [isOpen, selectedProductIds, products]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.productName?.toLowerCase().includes(lowerSearch) ||
        p.productCode?.toLowerCase().includes(lowerSearch)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleToggle = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.productId));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  const isAllSelected = filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  return (
    <Modal
      title={
        <div className="d-flex align-items-center">
          <span>Chọn sản phẩm áp dụng</span>
          <span className="badge bg-primary ms-2" style={{ fontSize: '12px' }}>
            Đã chọn: {selectedIds.length}
          </span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleConfirm}
      width={800}
      centered
      okText="Xác nhận"
      cancelText="Hủy"
      bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
    >
      <div className="mb-3">
        <Search
          placeholder="Tìm kiếm theo tên, mã sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-hover">
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Mã sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th style={{ textAlign: 'right' }}>Giá bán</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product.productId}
                  onClick={() => handleToggle(product.productId)}
                  style={{ cursor: 'pointer' }}
                  className={selectedIds.includes(product.productId) ? 'table-active' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(product.productId)}
                      onChange={() => handleToggle(product.productId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td style={{ textAlign: 'right' }}>
                    {product.unitPrice ? product.unitPrice.toLocaleString() : '0'} đ
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-3 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>Đã chọn {selectedIds.length} sản phẩm</strong>
            {filteredProducts.length > 0 && ` / ${filteredProducts.length} sản phẩm hiển thị`}
          </small>
        </div>
      )}
    </Modal>
  );
};

export default ProductSelectionModal;

