import React from "react";
import { Card, ListGroup } from "react-bootstrap";

const data = [
  { company: "Pitch", users: 150 },
  { company: "Initech", users: 200 },
  { company: "Umbrella Corp", users: 129 },
  { company: "Capital Partners", users: 103 },
  { company: "Massive Dynamic", users: 108 },
];

const RecentlyRegistered = () => {
  return (
    <Card className="shadow-sm border-0 p-3">
      <h6>Recently Registered</h6>
      <ListGroup variant="flush">
        {data.map((item, idx) => (
          <ListGroup.Item key={idx} className="d-flex justify-content-between">
            <span>{item.company}</span>
            <span>{item.users} Users</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default RecentlyRegistered;
