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

  useEffect(() => {
    if (customer) setForm(customer);
  }, [customer]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{customer ? "Edit Customer" : "Add Customer"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="code"
            placeholder="Code"
            value={form.code}
            onChange={handleChange}
            required
          />
          <input
            name="name"
            placeholder="Customer Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
          />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerFormModal;
