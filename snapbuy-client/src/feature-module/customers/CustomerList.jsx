// src/feature-module/customers/CustomerList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../CustomerList.scss";

const initialCustomers = [
  {
    code: "CU001",
    name: "Carl Evans",
    email: "carlevans@example.com",
    phone: "+12163547758",
    country: "Germany",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    code: "CU002",
    name: "Minerva Rameriz",
    email: "rameriz@example.com",
    phone: "+11367529510",
    country: "Japan",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    code: "CU003",
    name: "Robert Lamon",
    email: "robert@example.com",
    phone: "+15362789414",
    country: "USA",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    code: "CU004",
    name: "Patricia Lewis",
    email: "patricia@example.com",
    phone: "+18513094627",
    country: "Austria",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=4",
  },
  {
    code: "CU005",
    name: "Mark Joslyn",
    email: "markjoslyn@example.com",
    phone: "+14678219025",
    country: "Turkey",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
];

const STORAGE_KEY = "customers_v1";

const CustomerList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch (e) {
      return initialCustomers;
    }
  });

  // modal logic (bạn muốn giữ modal add/view/edit inline? ta giữ modal-add as before)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view | edit | add
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "Active",
    avatar: "",
  });

  // persist customers -> localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      // ignore storage errors
    }
  }, [customers]);

  // If returning from Edit page via navigate('/customers', { state: { updatedCustomer } })
  useEffect(() => {
    if (location.state) {
      const { updatedCustomer, newCustomer, deletedCustomer } = location.state;
      if (updatedCustomer) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.code === updatedCustomer.code ? { ...updatedCustomer } : c
          )
        );
        // replace state to avoid repeated handling
        navigate("/customers", { replace: true, state: null });
      } else if (newCustomer) {
        setCustomers((prev) => [...prev, newCustomer]);
        navigate("/customers", { replace: true, state: null });
      } else if (deletedCustomer) {
        setCustomers((prev) => prev.filter((c) => c.code !== deletedCustomer));
        navigate("/customers", { replace: true, state: null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const generateNewCode = () =>
    `CU${String(customers.length + 1).padStart(3, "0")}`;

  // --- modal handlers (we keep add modal inline for minimal change) ---
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newCustomer = {
        ...formData,
        code: formData.code?.trim() || generateNewCode(),
        avatar:
          formData.avatar?.trim() ||
          `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70) + 1}`,
      };
      setCustomers((prev) => [...prev, newCustomer]);
    } else if (modalMode === "edit") {
      setCustomers((prev) =>
        prev.map((c) => (c.code === formData.code ? { ...formData } : c))
      );
    }
    closeModal();
  };

  const handleDelete = (code) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers((prev) => prev.filter((c) => c.code !== code));
    }
  };

  // ---- ROUTE navigation for view/edit pages ----
  const goEditPage = (customer) =>
    navigate(`/customers/edit/${customer.code}`, { state: { customer } });

  const goViewPage = (customer) =>
    navigate(`/customers/view/${customer.code}`, { state: { customer } });

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

      <p className="subtitle">Manage your customers</p>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select>
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
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
            <tr key={c.code}>
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
                <span
                  className={`status ${
                    c.status === "Active" ? "active" : "inactive"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td>
                <button className="icon-btn view" onClick={() => goViewPage(c)}>
                  👁
                </button>
                <button className="icon-btn edit" onClick={() => goEditPage(c)}>
                  ✏️
                </button>
                <button
                  className="icon-btn delete"
                  onClick={() => handleDelete(c.code)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <select>
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
        <span>
          Showing 1 to {filtered.length} of {customers.length} entries
        </span>
        <div className="pages">
          <button>{"<<"}</button>
          <button>{"<"}</button>
          <button className="active">1</button>
          <button>{">"}</button>
          <button>{">>"}</button>
        </div>
      </div>

      {/* Inline modal (add/edit/view) - giữ nguyên logic modal của bạn */}
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
              <div className="form-row">
                <label>Code</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  placeholder="CU001"
                  disabled={modalMode !== "add"}
                />
              </div>

              <div className="form-row">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={modalMode === "view"}
                  required
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={modalMode === "view"}
                />
              </div>

              <div className="form-row">
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={modalMode === "view"}
                />
              </div>

              <div className="form-row">
                <label>Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  disabled={modalMode === "view"}
                />
              </div>

              <div className="form-row">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  disabled={modalMode === "view"}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

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
