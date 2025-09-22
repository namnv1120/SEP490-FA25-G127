import React from "react";
import { Card, Table } from "react-bootstrap";

const data = [
  { company: "Stellar Dynamics", amount: "+$245", plan: "Basic" },
  { company: "Quantum Nexus", amount: "+$395", plan: "Enterprise" },
  { company: "Aurora Technologies", amount: "-$145", plan: "Advanced" },
  { company: "Terafusion Energy", amount: "-$145", plan: "Enterprise" },
  { company: "Epicurean Delights", amount: "-$977", plan: "Premium" },
];

const RecentTransactions = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Recent Transactions</h6>
      <Table hover responsive className="mb-0">
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.company}</td>
              <td>{item.plan}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default RecentTransactions;
