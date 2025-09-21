import React from "react";
import { Nav } from "react-bootstrap";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar bg-white shadow-sm">
      <Nav defaultActiveKey="/dashboard" className="flex-column p-3">
        <Nav.Link href="/dashboard" className="fw-bold text-dark">
          <FaHome className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link href="/inventory">
          <FaBox className="me-2" /> Inventory
        </Nav.Link>
        <Nav.Link href="/sales">
          <FaShoppingCart className="me-2" /> Sales & Purchase
        </Nav.Link>
        <Nav.Link href="/customers">
          <FaUsers className="me-2" /> Customers
        </Nav.Link>
        <Nav.Link href="/reports">
          <FaChartBar className="me-2" /> Reports
        </Nav.Link>
        <Nav.Link href="/settings">
          <FaCog className="me-2" /> Settings
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
