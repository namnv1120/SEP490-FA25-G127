import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../ViewCustomerPage.scss";

const STORAGE_KEY = "customers_v1";

export default function ViewCustomerPage() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (location.state && location.state.customer) {
      setCustomer(location.state.customer);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const customers = JSON.parse(saved);
        const found = customers.find((c) => c.code === code);
        if (found) {
          setCustomer(found);
          return;
        }
      }
    } catch (e) {}
    navigate("/customers", { replace: true });
  }, [code, location.state, navigate]);

  if (!customer) return null;

  return (
    <div className="view-container">
      <div className="view-card">
        <h2 className="view-title">👤 View Customer</h2>

        <div className="view-info">
          <p>
            <span>Code:</span> {customer.code}
          </p>
          <p>
            <span>Name:</span> {customer.name}
          </p>
          <p>
            <span>Email:</span> {customer.email}
          </p>
          <p>
            <span>Phone:</span> {customer.phone}
          </p>
          <p>
            <span>Country:</span> {customer.country}
          </p>
          <p>
            <span>Status:</span>
            <span
              className={
                customer.status === "Active" ? "badge active" : "badge inactive"
              }
            >
              {customer.status}
            </span>
          </p>
        </div>

        <div className="view-actions">
          <button className="btn back" onClick={() => navigate("/customers")}>
            ⬅ Back
          </button>
          <button
            className="btn edit"
            onClick={() =>
              navigate(`/customers/edit/${customer.code}`, {
                state: { customer },
              })
            }
          >
            ✏️ Edit
          </button>
          <button
            className="btn delete"
            onClick={() => alert("Delete " + customer.name)}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
