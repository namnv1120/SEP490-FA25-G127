import React, { useState, useEffect } from "react";

function CustomerFormModal({ show, onClose, onSave, customer }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "Active",
  });

  // Load dữ liệu khi mở modal
  useEffect(() => {
    if (customer) {
      setForm(customer);
    } else {
      setForm({
        code: "",
        name: "",
        email: "",
        phone: "",
        country: "",
        status: "Active",
      });
    }
  }, [customer, show]);

  if (!show) return null;

  // 📝 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Save
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="customer-modal">
        <div className="modal-header">
          <h2>{customer ? "Edit Customer" : "Add Customer"}</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <label>Code</label>
            <input
              name="code"
              placeholder="Code"
              value={form.code}
              onChange={handleChange}
              required
              disabled={!!customer} // không cho sửa code khi edit
            />
          </div>

          <div className="form-row">
            <label>Name</label>
            <input
              name="name"
              placeholder="Customer Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Phone</label>
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Country</label>
            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerFormModal;
