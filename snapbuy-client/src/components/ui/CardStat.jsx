import React from "react";
import { Card } from "react-bootstrap";

const CardStat = ({ title, value, color, icon, percent, trend }) => {
  return (
    <Card className="stat-card shadow-sm border-0">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="fw-bold">{title}</h6>
          <div className="stat-icon">{icon}</div>
        </div>
        <h4 className="fw-bold my-2" style={{ color }}>
          {value}
        </h4>
        <small className={trend === "up" ? "text-success" : "text-danger"}>
          {trend === "up" ? "↑" : "↓"} {percent} vs Last Month
        </small>
      </Card.Body>
    </Card>
  );
};

export default CardStat;
