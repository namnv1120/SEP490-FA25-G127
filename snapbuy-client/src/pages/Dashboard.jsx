import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard() {
  return (
    <div className="container mt-4">
      <h3 className="fw-bold">Welcome, Admin</h3>
      <p className="text-muted">You have <span className="text-danger fw-bold">200+</span> Orders today</p>

      {/* Cards */}
      <div className="row g-4 mt-3">
        <div className="col-md-3">
          <div className="card shadow-sm text-white" style={{ backgroundColor: "#f77f00" }}>
            <div className="card-body">
              <h6 className="fw-semibold">Total Sales</h6>
              <h4>$48,988,078</h4>
              <small className="text-light">+22% vs Last Month</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-white" style={{ backgroundColor: "#003049" }}>
            <div className="card-body">
              <h6 className="fw-semibold">Total Sales Return</h6>
              <h4>$16,478,145</h4>
              <small className="text-light">-22% vs Last Month</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-white" style={{ backgroundColor: "#2a9d8f" }}>
            <div className="card-body">
              <h6 className="fw-semibold">Total Purchase</h6>
              <h4>$24,145,789</h4>
              <small className="text-light">+22% vs Last Month</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm text-white" style={{ backgroundColor: "#1d4ed8" }}>
            <div className="card-body">
              <h6 className="fw-semibold">Total Purchase Return</h6>
              <h4>$18,458,747</h4>
              <small className="text-light">+22% vs Last Month</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;