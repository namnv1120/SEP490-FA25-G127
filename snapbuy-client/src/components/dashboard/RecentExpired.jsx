import React from "react";
import { Card, Table } from "react-bootstrap";

const data = [
  { company: "Silicon Corp", expired: "10 Apr 2025" },
  { company: "Hubspot", expired: "12 Jun 2025" },
  { company: "Licon Industries", expired: "16 Jun 2025" },
  { company: "Terafusion Energy", expired: "12 May 2025" },
  { company: "Epicurean Delights", expired: "15 May 2025" },
];

const RecentExpired = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Recent Plan Expired</h6>
      <Table hover responsive className="mb-0">
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.company}</td>
              <td>{item.expired}</td>
              <td className="text-primary">Send Reminder</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default RecentExpired;
