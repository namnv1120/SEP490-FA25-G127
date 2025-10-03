// src/feature-module/customers/EditCustomerPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../CustomerList.scss";

const STORAGE_KEY = "customers_v1";

export default function EditCustomerPage() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "Active",
    avatar: "",
  });

  useEffect(() => {
    // priority: location.state.customer (when navigated from list)
    if (location.state && location.state.customer) {
      setForm(location.state.customer);
      return;
    }

    // fallback: try to read from localStorage by code
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const customers = JSON.parse(saved);
        const found = customers.find((c) => c.code === code);
        if (found) {
          setForm(found);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // if not found, go back to list
    navigate("/customers", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // send updated object back to list via location.state
    navigate("/customers", { state: { updatedCustomer: form } });
  };

  const handleCancel = () => {
    navigate("/customers");
  };

  return (
    <div className="edit-page" style={{ padding: 20 }}>
      <div className="edit-card">
        <h2>Edit Customer</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Code</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={handleCancel}>
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
