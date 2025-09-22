import React from "react";
import { Card } from "react-bootstrap";

const StatCard = ({ title, value, change }) => {
  return (
    <Card className="stat-card shadow-sm border-0 p-3">
      <h6 className="text-muted">{title}</h6>
      <h4>{value}</h4>
      <span className={change.startsWith("-") ? "text-danger" : "text-success"}>
        {change}
      </span>
    </Card>
  );
};

export default StatCard;
