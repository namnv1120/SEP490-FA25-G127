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
      } catch (err) {
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
            unitPrice: p.unitPrice || 0,
          }));
        setProducts(options);
      } catch (err) {
        message.error("Không thể tải sản phẩm của nhà cung cấp này.");
      }
    };
    fetchProducts();
  }, [selectedSupplier]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "product" && value) {
      newItems[index].unitPrice = value.unitPrice;
      newItems[index].total = newItems[index].quantity * value.unitPrice;
    }

    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(newItems[index].quantity || 0);
      const price = parseFloat(newItems[index].unitPrice || 0);
      newItems[index].total = qty * price;
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
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      notes,
      taxAmount: parseFloat(taxAmount || 0),
    };

    try {
      setIsSubmitting(true);
      await createPurchaseOrder(request);
      message.success("Tạo phiếu nhập hàng thành công!");
      navigate(route.purchaseorders);
    } catch (err) {
      console.error("❌ Lỗi tạo phiếu nhập:", err);
      const res = err.response?.data;
      message.error(res?.message || "Không thể tạo phiếu nhập hàng.");
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
              <h4>Tạo phiếu nhập hàng</h4>
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
                          type="text"
                          disabled
                          className="form-control"
                          value={item.unitPrice}
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
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
