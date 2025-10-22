import { useState, useEffect } from "react";
import { Modal } from "bootstrap";
import { message } from "antd";
import { getSupplierById, updateSupplier } from "../../services/SupplierService";

const EditSupplier = ({ supplierId, onSuccess, onClose }) => {
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

  useEffect(() => {
    if (!supplierId) return;

    const loadSupplierData = async () => {
      try {
        setLoading(true);
        const supplier = await getSupplierById(supplierId);

        setFormData({
          supplierCode: supplier.supplierCode || "",
          supplierName: supplier.supplierName || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          ward: supplier.ward || "",
          city: supplier.city || "",
          active: supplier.active === 1 || supplier.active === true,
        });


        const modalElement = document.getElementById("edit-supplier");
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      } catch (error) {
        console.error("Error loading supplier:", error);
        message.error("Failed to load supplier data");
        if (onClose) onClose();
      } finally {
        setLoading(false);
      }
    };

    loadSupplierData();
  }, [supplierId]);

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
      message.warning("Please enter supplier code");
      return;
    }
    if (!formData.supplierName.trim()) {
      message.warning("Please enter supplier name");
      return;
    }
    if (!formData.email.trim()) {
      message.warning("Please enter email");
      return;
    }

    try {
      setLoading(true);

      // ✅ Gửi JSON object thay vì FormData
      const submitData = {
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address,
        ward: formData.ward || "",
        city: formData.city || "",
        active: formData.active === true,
      };

      console.log("🟢 Submit data:", submitData);


      await updateSupplier(supplierId, submitData);
      message.success("Supplier updated successfully!");

      const modalElement = document.getElementById("edit-supplier");
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }

      setTimeout(() => {
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 100);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error updating supplier:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update supplier";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleModalClose = () => {
    const modalElement = document.getElementById("edit-supplier");
    const modal = Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }, 100);

    if (onClose) onClose();
  };

  if (!supplierId) return null;

  return (
    <div>
      <div className="modal fade" id="edit-supplier">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Edit Supplier</h4>
              </div>
              <button
                type="button"
                className="close"
                onClick={handleModalClose}
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="modal-body custom-modal-body">
                  <div className="row">

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Supplier Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplierCode"
                          className="form-control"
                          value={formData.supplierCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Supplier Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplierName"
                          className="form-control"
                          value={formData.supplierName}
                          onChange={handleInputChange}
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
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Phone <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          className="form-control"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Ward</label>
                        <input
                          type="text"
                          name="ward"
                          className="form-control"
                          value={formData.ward}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 col-sm-10 col-10">
                      <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="mb-0">
                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                          <span className="status-label">Status</span>
                          <input
                            type="checkbox"
                            id="edit-supplier-status"
                            className="check"
                            checked={formData.active}
                            onChange={handleStatusChange}
                          />
                          <label htmlFor="edit-supplier-status" className="checktoggle mb-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-footer-btn">
                  <button
                    type="button"
                    className="btn btn-cancel me-2"
                    onClick={handleModalClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSupplier;
