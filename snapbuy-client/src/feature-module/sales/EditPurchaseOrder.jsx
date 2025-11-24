import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { allRoutes } from "../../routes/AllRoutes";
import CommonSelect from "../../components/select/common-select";
import { getAllSuppliers } from "../../services/SupplierService";
import { getProductsBySupplierId } from "../../services/ProductService";
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
} from "../../services/PurchaseOrderService";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";

const EditPurchaseOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const route = allRoutes;

  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { product: null, quantity: 1, unitPrice: 0, total: 0, receiveQuantity: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [taxAmount, setTaxAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");

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

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrderById(id);
      setOrderData(data);
      setOrderStatus(data.status || "");

      if (data.supplierId) {
        const supplier = suppliers.find((s) => s.value === data.supplierId);
        if (supplier) {
          setSelectedSupplier(supplier);
        }
      }

      if (data.details && data.details.length > 0) {
        const isApproved = data.status?.toLowerCase() === "đã duyệt";
        const isWaitingConfirmation =
          data.status?.toLowerCase() === "chờ xác nhận";
        const isReceived = data.status?.toLowerCase() === "đã nhận hàng";
        const formattedItems = data.details.map((item) => {
          const receiveQty = item.receiveQuantity || item.receivedQuantity || 0;
          const quantity = item.quantity || 1;
          const unitPrice = item.unitPrice || 0;

          const total =
            (isApproved || isWaitingConfirmation || isReceived) &&
              receiveQty > 0
              ? receiveQty * unitPrice
              : quantity * unitPrice;

          return {
            product: item.productId
              ? {
                value: item.productId,
                label: item.productName,
                unitPrice: unitPrice,
              }
              : null,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
            receiveQuantity: receiveQty,
          };
        });
        setItems(
          formattedItems.length > 0
            ? formattedItems
            : [
              {
                product: null,
                quantity: 1,
                unitPrice: 0,
                total: 0,
                receiveQuantity: 0,
              },
            ]
        );
      } else {
        setItems([
          {
            product: null,
            quantity: 1,
            unitPrice: 0,
            total: 0,
            receiveQuantity: 0,
          },
        ]);
      }

      setNotes(data.notes || "");
      setTaxAmount(data.taxAmount || 0);
    } catch {
      message.error("Không thể tải chi tiết đơn hàng.");
      navigate(route.purchaseorders);
    } finally {
      setLoading(false);
    }
  }, [id, suppliers, navigate, route.purchaseorders]);

  // ✅ Gọi fetchOrderDetail khi có id và suppliers
  useEffect(() => {
    if (id && suppliers.length > 0) {
      fetchOrderDetail();
    }
  }, [id, suppliers, fetchOrderDetail]);

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

        if (
          orderData &&
          orderData.details &&
          selectedSupplier.value === orderData.supplierId
        ) {
          const isApproved = orderData.status?.toLowerCase() === "đã duyệt";
          const isWaitingConfirmation =
            orderData.status?.toLowerCase() === "chờ xác nhận";
          const isReceived = orderData.status?.toLowerCase() === "đã nhận hàng";

          const mappedItems = orderData.details.map((item) => {
            const productOption = options.find(
              (p) => p.value === item.productId
            );
            const receiveQty =
              item.receiveQuantity || item.receivedQuantity || 0;
            const quantity = item.quantity || 1;
            // Luôn sử dụng giá đã lưu trong database, không map lại từ giá nhập
            const unitPrice = item.unitPrice || 0;

            const total =
              (isApproved || isWaitingConfirmation || isReceived) &&
                receiveQty > 0
                ? receiveQty * unitPrice
                : quantity * unitPrice;

            return {
              product: productOption || {
                value: item.productId,
                label: item.productName,
                unitPrice: unitPrice,
              },
              quantity: quantity,
              unitPrice: unitPrice,
              total: total,
              receiveQuantity: receiveQty,
            };
          });

          setItems(
            mappedItems.length > 0
              ? mappedItems
              : [
                {
                  product: null,
                  quantity: 1,
                  unitPrice: 0,
                  total: 0,
                  receiveQuantity: 0,
                },
              ]
          );
        }
      } catch {
        message.error("Không thể tải sản phẩm của nhà cung cấp này.");
      }
    };
    fetchProducts();
  }, [selectedSupplier, orderData]);

  // ✅ Update items khi supplier thay đổi (nếu supplier khác supplier ban đầu)
  useEffect(() => {
    if (
      selectedSupplier &&
      orderData &&
      orderData.details &&
      selectedSupplier.value !== orderData.supplierId
    ) {
      // Nếu supplier thay đổi, reset items
      setItems([{ product: null, quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [selectedSupplier, orderData]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];

    if (field === "receiveQuantity") {
      const maxQty = newItems[index].quantity || 0;
      const receiveQty = Math.min(parseFloat(value || 0), maxQty);
      newItems[index].receiveQuantity = Math.max(0, receiveQty);

      if (
        orderStatus?.toLowerCase() === "đã duyệt" ||
        orderStatus?.toLowerCase() === "chờ xác nhận"
      ) {
        const price = parseFloat(newItems[index].unitPrice || 0);
        const receiveQty = parseFloat(newItems[index].receiveQuantity || 0);
        // Cho phép receiveQuantity = 0, tính tổng tiền theo receiveQuantity (kể cả = 0)
        newItems[index].total = receiveQty * price;
      }
    } else {
      if (field === "product" && value) {
        // Kiểm tra xem có phải chọn lại cùng một sản phẩm không
        const isSameProduct =
          newItems[index].product &&
          newItems[index].product.value === value.value;

        // Nếu chọn lại cùng sản phẩm và đơn giá đã được chỉnh sửa (khác giá mặc định), giữ lại giá đó
        // Nếu chọn sản phẩm khác hoặc đơn giá chưa được chỉnh sửa, map giá mới
        if (
          isSameProduct &&
          newItems[index].unitPrice > 0 &&
          newItems[index].unitPrice !== value.unitPrice
        ) {
          // Giữ lại giá đã chỉnh sửa
          newItems[index] = { ...newItems[index], product: value };
        } else {
          // Map giá mới (lần đầu chọn hoặc chọn sản phẩm khác)
          newItems[index] = {
            ...newItems[index],
            product: value,
            unitPrice: value.unitPrice,
          };
        }
        // Tính lại tổng tiền
        const priceToUse = newItems[index].unitPrice;
        const qty = parseFloat(newItems[index].quantity || 0);
        // Nếu đơn đã duyệt hoặc chờ xác nhận, tính theo số lượng thực nhận
        if (
          orderStatus?.toLowerCase() === "đã duyệt" ||
          orderStatus?.toLowerCase() === "chờ xác nhận"
        ) {
          const receiveQty = parseFloat(newItems[index].receiveQuantity || 0);
          newItems[index].total =
            receiveQty > 0 ? receiveQty * priceToUse : qty * priceToUse;
        } else {
          newItems[index].total = qty * priceToUse;
        }
      } else {
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === "quantity" || field === "unitPrice") {
          const qty = parseFloat(newItems[index].quantity || 0);
          const price = parseFloat(newItems[index].unitPrice || 0);

          // Nếu đơn đã duyệt hoặc chờ xác nhận, tính theo số lượng thực nhận (kể cả = 0)
          if (
            orderStatus?.toLowerCase() === "đã duyệt" ||
            orderStatus?.toLowerCase() === "chờ xác nhận"
          ) {
            const receiveQty = parseFloat(newItems[index].receiveQuantity || 0);
            // Cho phép receiveQuantity = 0, tính tổng tiền theo receiveQuantity
            newItems[index].total = receiveQty * price;
          } else {
            newItems[index].total = qty * price;
          }
        }
      }
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product: null,
        quantity: 1,
        unitPrice: 0,
        total: 0,
        receiveQuantity: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(
      newItems.length
        ? newItems
        : [
          {
            product: null,
            quantity: 1,
            unitPrice: 0,
            total: 0,
            receiveQuantity: 0,
          },
        ]
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

    const isApproved = orderStatus?.toLowerCase() === "đã duyệt";
    const isWaitingConfirmation = orderStatus?.toLowerCase() === "chờ xác nhận";

    const request = {
      items: items.map((i) => ({
        productId: i.product.value,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        ...((isApproved || isWaitingConfirmation) && {
          receiveQuantity: i.receiveQuantity || 0,
        }),
      })),
      notes,
      taxAmount: parseFloat(taxAmount || 0),
    };

    try {
      setIsSubmitting(true);
      await updatePurchaseOrder(id, request);
      message.success("Cập nhật phiếu nhập hàng thành công!");
      navigate(route.purchaseorders);
    } catch (err) {
      const res = err.response?.data;
      message.error(res?.message || "Không thể cập nhật phiếu nhập hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center vh-100">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Chỉnh sửa phiếu nhập hàng</h4>
              <h6>Cập nhật đơn nhập hàng</h6>
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
                  if (!orderData) {
                    setSelectedSupplier(opt);
                    setItems([
                      { product: null, quantity: 1, unitPrice: 0, total: 0 },
                    ]);
                  }
                }}
                placeholder="Chọn nhà cung cấp"
                disabled={!!orderData}
              />
              {orderData && (
                <small className="text-muted d-block mt-1">
                  Không thể thay đổi nhà cung cấp sau khi tạo đơn
                </small>
              )}
            </div>

            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th
                      style={{
                        width:
                          orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận"
                            ? "30%"
                            : "35%",
                      }}
                    >
                      Sản phẩm
                    </th>
                    <th style={{ width: "15%" }}>Số lượng</th>
                    {(orderStatus?.toLowerCase() === "đã duyệt" ||
                      orderStatus?.toLowerCase() === "chờ xác nhận") && (
                        <th style={{ width: "15%" }}>Số lượng thực nhận</th>
                      )}
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
                          disabled={orderStatus?.toLowerCase() === "đã duyệt"}
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
                          disabled={
                            orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận"
                          }
                          readOnly={
                            orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận"
                          }
                        />
                      </td>
                      {(orderStatus?.toLowerCase() === "đã duyệt" ||
                        orderStatus?.toLowerCase() === "chờ xác nhận") && (
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={item.quantity}
                              step="1"
                              className="form-control"
                              value={item.receiveQuantity || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const maxVal = item.quantity || 0;
                                if (val > maxVal) {
                                  message.warning(
                                    `Số lượng thực nhận không được vượt quá ${maxVal}`
                                  );
                                }
                                updateItem(
                                  index,
                                  "receiveQuantity",
                                  e.target.value
                                );
                              }}
                              placeholder={`Tối đa: ${item.quantity}`}
                              title={`Số lượng thực nhận (tối đa ${item.quantity})`}
                              disabled={
                                orderStatus?.toLowerCase() === "chờ xác nhận"
                              }
                              readOnly={
                                orderStatus?.toLowerCase() === "chờ xác nhận"
                              }
                            />
                          </td>
                        )}
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          className="form-control"
                          value={item.unitPrice || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            updateItem(index, "unitPrice", value);
                          }}
                          disabled={
                            orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận" ||
                            orderStatus?.toLowerCase() === "đã nhận hàng"
                          }
                          readOnly={
                            orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận" ||
                            orderStatus?.toLowerCase() === "đã nhận hàng"
                          }
                        />
                      </td>
                      <td>{item.total.toLocaleString("vi-VN")} ₫</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeItem(index)}
                          disabled={
                            orderStatus?.toLowerCase() === "đã duyệt" ||
                            orderStatus?.toLowerCase() === "chờ xác nhận"
                          }
                        >
                          <i className="feather icon-x" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orderStatus?.toLowerCase() !== "đã duyệt" &&
                orderStatus?.toLowerCase() !== "chờ xác nhận" &&
                orderStatus?.toLowerCase() !== "đã hủy" &&
                orderStatus?.toLowerCase() !== "đã nhận hàng" && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addItem}
                  >
                    <i className="feather icon-plus me-2" /> Thêm sản phẩm
                  </button>
                )}
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
                  disabled={
                    orderStatus?.toLowerCase() === "đã hủy" ||
                    orderStatus?.toLowerCase() === "đã nhận hàng" ||
                    orderStatus?.toLowerCase() === "chờ xác nhận"
                  }
                  readOnly={
                    orderStatus?.toLowerCase() === "đã hủy" ||
                    orderStatus?.toLowerCase() === "đã nhận hàng" ||
                    orderStatus?.toLowerCase() === "chờ xác nhận"
                  }
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
                      disabled={
                        orderStatus?.toLowerCase() === "đã duyệt" ||
                        orderStatus?.toLowerCase() === "chờ xác nhận" ||
                        orderStatus?.toLowerCase() === "đã hủy" ||
                        orderStatus?.toLowerCase() === "đã nhận hàng"
                      }
                      readOnly={
                        orderStatus?.toLowerCase() === "đã duyệt" ||
                        orderStatus?.toLowerCase() === "chờ xác nhận" ||
                        orderStatus?.toLowerCase() === "đã hủy" ||
                        orderStatus?.toLowerCase() === "đã nhận hàng"
                      }
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
                {orderStatus?.toLowerCase() === "đã hủy" ||
                  orderStatus?.toLowerCase() === "đã nhận hàng"
                  ? "Quay lại"
                  : "Huỷ"}
              </button>
              {orderStatus?.toLowerCase() !== "đã hủy" &&
                orderStatus?.toLowerCase() !== "đã nhận hàng" &&
                orderStatus?.toLowerCase() !== "chờ xác nhận" && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang lưu..." : "Cập nhật phiếu nhập"}
                  </button>
                )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseOrder;
