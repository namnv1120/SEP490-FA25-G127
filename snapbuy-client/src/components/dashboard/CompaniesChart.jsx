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
  { name: "M", value: 400 },
  { name: "T", value: 500 },
  { name: "W", value: 300 },
  { name: "T", value: 700 },
  { name: "F", value: 600 },
  { name: "S", value: 800 },
  { name: "S", value: 750 },
];

const CompaniesChart = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Companies</h6>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#212529" />
        </BarChart>
      </ResponsiveContainer>
      <small className="text-success">+5% Companies from last month</small>
    </Card>
  );
};

export default CompaniesChart;
