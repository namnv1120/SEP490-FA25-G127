import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customerService from "../../services/customerService";
import "../../ViewCustomerPage.scss";

export default function ViewCustomerPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customerService.getByCode(code);
        setCustomer(data);
      } catch (err) {
        console.error("Customer not found", err);
        navigate("/customers", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [code, navigate]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure to delete ${customer.name}?`)) {
      try {
        await customerService.delete(code);
        navigate("/customers", { state: { deletedCustomer: code } });
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete customer.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
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
          <button className="btn delete" onClick={handleDelete}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
