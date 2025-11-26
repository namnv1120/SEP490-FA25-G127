import { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { updateInventory } from "../../../services/InventoryService";

const EditInventory = ({ visible, onClose, inventory, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    minimumStock: "",
    maximumStock: "",
    reorderPoint: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inventory && visible) {
      setFormData({
        minimumStock: inventory.minimumStock || "",
        maximumStock: inventory.maximumStock || "",
        reorderPoint: inventory.reorderPoint || "",
      });
      setErrors({});
    }
  }, [inventory, visible]);

  // 🧩 Validate dữ liệu
  const validateForm = () => {
    const newErrors = {};

    // Validate minimumStock
    if (formData.minimumStock === "" || formData.minimumStock === null || formData.minimumStock === undefined) {
      newErrors.minimumStock = "Vui lòng nhập tồn kho tối thiểu.";
    } else {
      const minStock = Number(formData.minimumStock);
      if (isNaN(minStock) || minStock < 0) {
        newErrors.minimumStock = "Tồn kho tối thiểu phải lớn hơn hoặc bằng 0.";
      }
    }

    // Validate maximumStock
    if (formData.maximumStock === "" || formData.maximumStock === null || formData.maximumStock === undefined) {
      newErrors.maximumStock = "Vui lòng nhập tồn kho tối đa.";
    } else {
      const maxStock = Number(formData.maximumStock);
      if (isNaN(maxStock) || maxStock < 0) {
        newErrors.maximumStock = "Tồn kho tối đa phải lớn hơn hoặc bằng 0.";
      }
    }

    // Validate reorderPoint
    if (formData.reorderPoint === "" || formData.reorderPoint === null || formData.reorderPoint === undefined) {
      newErrors.reorderPoint = "Vui lòng nhập điểm đặt hàng lại.";
    } else {
      const reorder = Number(formData.reorderPoint);
      if (isNaN(reorder) || reorder < 0) {
        newErrors.reorderPoint = "Điểm đặt hàng lại phải lớn hơn hoặc bằng 0.";
      }
    }

    // Validate relationships between values
    const minStock = Number(formData.minimumStock);
    const maxStock = Number(formData.maximumStock);
    const reorder = Number(formData.reorderPoint);

    if (!isNaN(minStock) && !isNaN(maxStock) && minStock >= maxStock) {
      newErrors.maximumStock = "Tồn kho tối đa phải lớn hơn tồn kho tối thiểu.";
    }

    if (!isNaN(minStock) && !isNaN(reorder) && reorder <= minStock) {
      newErrors.reorderPoint = "Điểm đặt hàng lại phải lớn hơn tồn kho tối thiểu.";
    }

    if (!isNaN(maxStock) && !isNaN(reorder) && reorder >= maxStock) {
      newErrors.reorderPoint = "Điểm đặt hàng lại phải nhỏ hơn tồn kho tối đa.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Chặn nhập số âm - chỉ cho phép số dương hoặc rỗng
    let numericValue = value;
    if (value !== "" && value !== "-") {
      const num = parseFloat(value);
      if (!isNaN(num) && num < 0) {
        return; // Không cho phép số âm
      }
      // Chỉ lưu nếu là số hợp lệ hoặc rỗng
      if (value === "" || (!isNaN(num) && num >= 0)) {
        numericValue = value;
      } else {
        return;
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const values = {
        minimumStock: parseInt(formData.minimumStock) || 0,
        maximumStock: parseInt(formData.maximumStock) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || 0,
      };

      await updateInventory(inventory.inventoryId, values);
      message.success("Cập nhật tồn kho thành công!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
      const res = err.response?.data;
      if (res?.code === 4000 && res?.message) {
        const messages = res.message
          .split(";")
          .map((msg) => msg.trim())
          .filter(Boolean);
        messages.forEach((msg) => message.error(msg));
      } else if (res?.message) {
        message.error(res.message);
      } else {
        message.error("Cập nhật thất bại! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      footer={null}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      title={`Cập nhật tồn kho: ${inventory?.productName || ""}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">
            Tồn kho tối thiểu <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="minimumStock"
            className={`form-control ${errors.minimumStock ? "is-invalid" : ""}`}
            value={formData.minimumStock}
            onChange={handleInputChange}
            min="0"
            step="1"
            disabled={loading}
            onKeyDown={(e) => {
              // Chặn nhập dấu trừ và dấu cộng
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault();
              }
            }}
          />
          {errors.minimumStock && (
            <div className="invalid-feedback">
              {errors.minimumStock}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Tồn kho tối đa <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="maximumStock"
            className={`form-control ${errors.maximumStock ? "is-invalid" : ""}`}
            value={formData.maximumStock}
            onChange={handleInputChange}
            min="0"
            step="1"
            disabled={loading}
            onKeyDown={(e) => {
              // Chặn nhập dấu trừ và dấu cộng
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault();
              }
            }}
          />
          {errors.maximumStock && (
            <div className="invalid-feedback">
              {errors.maximumStock}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Điểm đặt hàng lại <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="reorderPoint"
            className={`form-control ${errors.reorderPoint ? "is-invalid" : ""}`}
            value={formData.reorderPoint}
            onChange={handleInputChange}
            min="0"
            step="1"
            disabled={loading}
            onKeyDown={(e) => {
              // Chặn nhập dấu trừ và dấu cộng
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault();
              }
            }}
          />
          {errors.reorderPoint && (
            <div className="invalid-feedback">
              {errors.reorderPoint}
            </div>
          )}
        </div>

        <div className="modal-footer-btn mt-4 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-cancel me-2"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditInventory;
