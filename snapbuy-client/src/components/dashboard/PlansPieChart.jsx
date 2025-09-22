import React from "react";
import { Card } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Basic", value: 60 },
  { name: "Premium", value: 20 },
  { name: "Enterprise", value: 20 },
];

const COLORS = ["#ff9f43", "#0d6efd", "#20c997"];

const PlansPieChart = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Top Plans</h6>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ul className="list-inline mt-2">
        <li>Basic - 60%</li>
        <li>Premium - 20%</li>
        <li>Enterprise - 20%</li>
      </ul>
    </Card>
  );
};

export default PlansPieChart;
