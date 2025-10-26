import { useState } from "react";
import { Modal } from "bootstrap";
import { message } from "antd";
import { createSupplier } from "../../services/SupplierService";

const AddSupplier = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    city: "",
    active: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      active: e.target.checked,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplierCode.trim()) {
      message.warning("Hãy nhập mã nhà cung cấp");
      return;
    }
    if (!formData.supplierName.trim()) {
      message.warning("Hãy nhập tên nhà cung cấp");
      return;
    }
    if (!formData.email.trim()) {
      message.warning("Hãy nhập email");
      return;
    }
    if (!formData.phone.trim()) {
      message.warning("Hãy nhập số điện thoại");
      return;
    }
    if (!formData.address.trim()) {
      message.warning("Hãy nhập địa chỉ");
      return;
    }

    try {
      setLoading(true);

      // ✅ Gửi JSON object thay vì FormData
      const submitData = {
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        ward: formData.ward || "",
        city: formData.city || "",
        active: formData.active === true,
      };

      await createSupplier(submitData);
      message.success("Thêm nhà cung cấp thành công!");

      const modalElement = document.getElementById("add-supplier");
      let modal = Modal.getInstance(modalElement);
      if (!modal) modal = new Modal(modalElement);
      modal.hide();

      setTimeout(() => {
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 100);

      setFormData({
        supplierCode: "",
        supplierName: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        city: "",
        active: true,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi thêm nhà cung cấp", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi thêm nhà cung cấp";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <div className="modal fade" id="add-supplier">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Thêm nhà cung cấp</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body custom-modal-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Mã nhà cung cấp <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="supplierCode"
                        className="form-control"
                        value={formData.supplierCode}
                        onChange={handleInputChange}
                        placeholder="Nhập mã nhà cung cấp"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Tên nhà cung cấp <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        className="form-control"
                        value={formData.supplierName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên nhà cung cấp"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Địa chỉ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">Quận/Phường</label>
                      <input
                        type="text"
                        name="ward"
                        className="form-control"
                        value={formData.ward}
                        onChange={handleInputChange}
                        placeholder="Nhập quận/phường"
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nhập thành phố"
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">Trạng thái</span>
                        <input
                          type="checkbox"
                          id="add-supplier-status"
                          className="check"
                          checked={formData.active}
                          onChange={handleStatusChange}
                        />
                        <label htmlFor="add-supplier-status" className="checktoggle mb-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer modal-footer-btn">
                <button
                  type="button"
                  className="btn btn-cancel me-2"
                  data-bs-dismiss="modal"
                  disabled={loading}
                >
                  Huỷ
                </button>
                <button type="submit" className="btn btn-submit" disabled={loading}>
                  {loading ? "Đang lưu ..." : "Thêm nhà cung cấp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplier;
