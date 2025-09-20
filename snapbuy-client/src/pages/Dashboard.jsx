import React from "react";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="container mt-4">
      <h3 className="fw-bold">Welcome, Admin</h3>
      <p className="text-muted">
        You have <span className="text-danger fw-bold">200+</span> Orders today
      </p>

      <div className="row g-3">
        {/* Total Sales */}
        <div className="col-md-3 col-sm-6">
          <div className="card stat-card sales">
            <div className="card-body">
              <h6>Total Sales</h6>
              <h4>$48,988,078</h4>
              <p className="small">+22% vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Total Sales Return */}
        <div className="col-md-3 col-sm-6">
          <div className="card stat-card sales-return">
            <div className="card-body">
              <h6>Total Sales Return</h6>
              <h4>$16,478,145</h4>
              <p className="small">-22% vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Total Purchase */}
        <div className="col-md-3 col-sm-6">
          <div className="card stat-card purchase">
            <div className="card-body">
              <h6>Total Purchase</h6>
              <h4>$24,145,789</h4>
              <p className="small">+22% vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Total Purchase Return */}
        <div className="col-md-3 col-sm-6">
          <div className="card stat-card purchase-return">
            <div className="card-body">
              <h6>Total Purchase Return</h6>
              <h4>$18,458,747</h4>
              <p className="small">+22% vs Last Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
