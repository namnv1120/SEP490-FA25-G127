// src/feature-module/customers/CustomerList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import customerService from "../../services/customerService"; // 👈 service gọi API
import "../../CustomerList.scss";

const CustomerList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "Active",
    avatar: "",
  });

  // ✅ Fetch từ backend khi load trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Nếu có state từ navigate (edit / add / delete)
  useEffect(() => {
    if (location.state) {
      const { updatedCustomer, newCustomer, deletedCustomer } = location.state;
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
        );
      } else if (newCustomer) {
        setCustomers((prev) => [...prev, newCustomer]);
      } else if (deletedCustomer) {
        setCustomers((prev) => prev.filter((c) => c.id !== deletedCustomer));
      }
      navigate("/customers", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // Search filter
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // Modal open/close
  const openModal = (mode, customer = null) => {
    setModalMode(mode);
    setFormData(
      customer || {
        code: "",
        name: "",
        email: "",
        phone: "",
        country: "",
        status: "Active",
        avatar: "",
      }
    );
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        const newCustomer = await customerService.create(formData);
        setCustomers((prev) => [...prev, newCustomer]);
      } else if (modalMode === "edit") {
        const updated = await customerService.update(formData.id, formData);
        setCustomers((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      }
      closeModal();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerService.delete(id);
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // Routing (nếu vẫn muốn tách view/edit page riêng)
  const goEditPage = (customer) =>
    navigate(`/customers/edit/${customer.id}`, { state: { customer } });

  const goViewPage = (customer) =>
    navigate(`/customers/view/${customer.id}`, { state: { customer } });

  return (
    <div className="customer-page">
      <div className="header-bar">
        <h3>Customers</h3>
        <div className="actions">
          <button className="btn">PDF</button>
          <button className="btn">Excel</button>
          <button className="btn add" onClick={() => openModal("add")}>
            + Add Customer
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className="subtitle">Manage your customers</p>

          <div className="toolbar">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <table className="customer-table">
            <thead>
              <tr>
                <th></th>
                <th>Code</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{c.code}</td>
                  <td>
                    <div className="customer-info">
                      <img src={c.avatar} alt={c.name} />
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.country}</td>
                  <td>
                    <span className={`status ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn view"
                      onClick={() => goViewPage(c)}
                    >
                      👁
                    </button>
                    <button
                      className="icon-btn edit"
                      onClick={() => goEditPage(c)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Modal giữ nguyên nhưng dùng handleFormSubmit gọi API */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="customer-modal">
            <div className="modal-header">
              <h4>
                {modalMode === "add" && "Add Customer"}
                {modalMode === "edit" && "Edit Customer"}
                {modalMode === "view" && "View Customer"}
              </h4>
              <button onClick={closeModal}>✖</button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              {/* Các input giữ nguyên */}
              <div className="form-row">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {/* ... thêm các field khác */}

              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Close
                </button>
                {modalMode !== "view" && (
                  <button type="submit" className="btn primary">
                    Save
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
