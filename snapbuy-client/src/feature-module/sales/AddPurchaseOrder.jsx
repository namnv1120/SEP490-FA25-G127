import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { allRoutes } from "../../routes/AllRoutes";
import CommonSelect from "../../components/select/common-select";
import { getAllSuppliers } from "../../services/SupplierService";
import { getProductsBySupplierId } from "../../services/ProductService";
import { createPurchaseOrder } from "../../services/PurchaseOrderService";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const route = allRoutes;

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { product: null, quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [taxAmount, setTaxAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Load danh sách nhà cung cấp
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        const options = data
          .filter((s) => s.active === true || s.active === 1)
          .map((s) => ({
            value: s.supplierId,
            label: s.supplierName,
          }));
        setSuppliers(options);
      } catch {
        message.error("Không thể tải danh sách nhà cung cấp.");
      }
    };
    fetchSuppliers();
  }, []);

  // ✅ Load sản phẩm theo nhà cung cấp
  useEffect(() => {
    if (!selectedSupplier) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      try {
        const data = await getProductsBySupplierId(selectedSupplier.value);
        const options = data
          .filter((p) => p.active === true || p.active === 1)
          .map((p) => ({
            value: p.productId,
            label: p.productName,
            unitPrice: p.costPrice || 0, // Sử dụng giá nhập (costPrice) thay vì giá bán (unitPrice)
          }));
        setProducts(options);
      } catch {
        message.error("Không thể tải sản phẩm của nhà cung cấp này.");
      }
    };
    fetchProducts();
  }, [selectedSupplier]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const currentItem = newItems[index];

    if (field === "product" && value) {
      // Kiểm tra xem có phải chọn lại cùng một sản phẩm không
      const isSameProduct = currentItem.product && currentItem.product.value === value.value;

      // Nếu chọn lại cùng sản phẩm và đơn giá đã được chỉnh sửa (khác 0 và khác giá mặc định), giữ lại giá đó
      // Nếu chọn sản phẩm khác hoặc đơn giá là 0, map giá mới
      if (isSameProduct && currentItem.unitPrice > 0 && currentItem.unitPrice !== value.unitPrice) {
        // Giữ lại giá đã chỉnh sửa
        newItems[index] = { ...currentItem, product: value };
      } else {
        // Map giá mới
        newItems[index] = { ...currentItem, product: value, unitPrice: value.unitPrice };
      }
      // Tính lại tổng tiền
      const priceToUse = newItems[index].unitPrice;
      newItems[index].total = newItems[index].quantity * priceToUse;
    } else {
      newItems[index] = { ...currentItem, [field]: value };

      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(newItems[index].quantity || 0);
        const price = parseFloat(newItems[index].unitPrice || 0);
        newItems[index].total = qty * price;
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: null, quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(
      newItems.length
        ? newItems
        : [{ product: null, quantity: 1, unitPrice: 0, total: 0 }]
    );
  };

  const subtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalAmount = subtotal + subtotal * (parseFloat(taxAmount || 0) / 100);


  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      message.warning("Vui lòng chọn nhà cung cấp.");
      return;
    }

    if (!items.every((i) => i.product && i.quantity > 0 && i.unitPrice > 0)) {
      message.warning(
        "Vui lòng chọn đầy đủ sản phẩm, số lượng và đơn giá hợp lệ."
      );
      return;
    }

    const request = {
      supplierId: selectedSupplier.value,
      items: items.map((i) => ({
        productId: i.product.value,
        quantity: parseFloat(i.quantity) || 0,
        unitPrice: parseFloat(i.unitPrice) || 0,
      })),
      notes,
      taxAmount: parseFloat(taxAmount || 0),
    };

    // Validate notes length
    if (notes && notes.length > 500) {
      message.error("Ghi chú không được vượt quá 500 ký tự. Vui lòng rút ngắn ghi chú.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPurchaseOrder(request);
      message.success("Tạo phiếu nhập hàng thành công!");
      navigate(route.purchaseorders);
    } catch (err) {
      console.error("❌ Lỗi tạo phiếu nhập:", err);
      const res = err.response?.data;
      let errorMessage = "Không thể tạo phiếu nhập hàng.";

      // Xử lý lỗi validation từ backend
      if (res?.message) {
        errorMessage = res.message;
      } else if (res?.errors && Array.isArray(res.errors)) {
        // Lỗi validation từ Bean Validation
        const validationErrors = res.errors
          .map((e) => e.defaultMessage || e.message)
          .join(", ");
        errorMessage = validationErrors || errorMessage;
      } else if (err.message && err.message.includes("truncated")) {
        // Lỗi SQL truncation
        errorMessage = "Ghi chú quá dài. Vui lòng nhập tối đa 500 ký tự.";
      }

      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Tạo phiếu nhập hàng</h4>
              <h6>Tạo đơn nhập hàng mới</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <RefreshIcon />
            <CollapesIcon />
            <li>
              <div className="page-btn">
                <Link to={route.purchaseorders} className="btn btn-secondary">
                  <i className="feather icon-arrow-left me-2" />
                  Trở về danh sách
                </Link>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-purchase">
            {/* NHÀ CUNG CẤP */}
            <div className="mb-4">
              <label className="form-label">
                Nhà cung cấp <span className="text-danger">*</span>
              </label>
              <CommonSelect
                options={suppliers}
                value={selectedSupplier}
                onChange={(opt) => {
                  setSelectedSupplier(opt);
                  setItems([
                    { product: null, quantity: 1, unitPrice: 0, total: 0 },
                  ]);
                }}
                placeholder="Chọn nhà cung cấp"
                width={350}
              />
            </div>

            {/* DANH SÁCH SẢN PHẨM */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "35%" }}>Sản phẩm</th>
                    <th style={{ width: "15%" }}>Số lượng</th>
                    <th style={{ width: "20%" }}>Đơn giá</th>
                    <th style={{ width: "20%" }}>Thành tiền</th>
                    <th style={{ width: "10%" }}>#</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <CommonSelect
                          options={products}
                          value={item.product}
                          onChange={(opt) => updateItem(index, "product", opt)}
                          placeholder="Chọn sản phẩm"
                          width={350}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, "unitPrice", e.target.value)
                          }
                        />
                      </td>
                      <td>{item.total.toLocaleString("vi-VN")} ₫</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          <i className="feather icon-x" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addItem}
              >
                <i className="feather icon-plus me-2" /> Thêm sản phẩm
              </button>
            </div>

            {/* THUẾ & GHI CHÚ */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">
                  Ghi chú <small className="text-muted">(tối đa 500 ký tự)</small>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={notes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setNotes(value);
                    } else {
                      message.warning("Ghi chú không được vượt quá 500 ký tự.");
                    }
                  }}
                  placeholder="Nhập ghi chú (tối đa 500 ký tự)"
                />
                <small className="text-muted">
                  {notes.length}/500 ký tự
                </small>
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-column align-items-end">
                  <div className="mb-2 w-50 d-flex justify-content-between">
                    <span>Tổng tiền hàng:</span>
                    <strong>{subtotal.toLocaleString("vi-VN")} ₫</strong>
                  </div>
                  <div className="mb-2 w-50 d-flex justify-content-between align-items-center">
                    <span>Thuế (%):</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="form-control w-50 text-end"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                    />
                  </div>

                  <div className="mt-3 w-50 d-flex justify-content-between border-top pt-2">
                    <span>Tổng cộng:</span>
                    <strong>{totalAmount.toLocaleString("vi-VN")} ₫</strong>
                  </div>

                </div>
              </div>
            </div>

            {/* NÚT SUBMIT */}
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate(route.purchaseorders)}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Tạo phiếu nhập"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseOrder;
