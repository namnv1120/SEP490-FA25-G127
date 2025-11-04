import { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { createCustomer } from "../../../services/CustomerService";

const AddCustomerModal = ({ isOpen, initialPhone, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: null,
  });

  // Reset và set phone khi modal mở
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        phone: initialPhone || "",
        gender: null,
      });
    }
  }, [isOpen, initialPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      message.warning("Vui lòng nhập tên khách hàng (tối thiểu 2 ký tự)");
      return;
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      message.warning("Vui lòng nhập số điện thoại");
      return;
    }

    // Validate phone format (10-15 digits, optional +)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      message.warning("Số điện thoại không đúng định dạng (10-15 chữ số)");
      return;
    }

    try {
      setLoading(true);

      const customerData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender || null,
      };

      const newCustomer = await createCustomer(customerData);
      message.success("Tạo khách hàng thành công!");

      if (onSuccess) {
        onSuccess(newCustomer);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi tạo khách hàng:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể tạo khách hàng";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm khách hàng mới"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      width={600}
      centered
    >
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">
              Tên khách hàng <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập tên khách hàng"
              maxLength={50}
              autoFocus
            />
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">
              Số điện thoại <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              maxLength={20}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCustomerModal;

