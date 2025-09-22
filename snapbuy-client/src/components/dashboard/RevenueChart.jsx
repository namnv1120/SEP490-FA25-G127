import React from "react";
import { Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 20000 },
  { name: "Feb", revenue: 30000 },
  { name: "Mar", revenue: 40000 },
  { name: "Apr", revenue: 50000 },
  { name: "May", revenue: 60000 },
  { name: "Jun", revenue: 70000 },
  { name: "Jul", revenue: 80000 },
  { name: "Aug", revenue: 75000 },
  { name: "Sep", revenue: 65000 },
  { name: "Oct", revenue: 60000 },
  { name: "Nov", revenue: 70000 },
  { name: "Dec", revenue: 85000 },
];

const RevenueChart = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Revenue</h6>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#ff9f43" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;
