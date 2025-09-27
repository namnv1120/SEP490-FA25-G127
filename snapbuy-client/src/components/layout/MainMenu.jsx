import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../../styles/MainMenu.css";

const MainMenu = () => {
  return (
    <Nav className="main-menu px-3 shadow-sm border-bottom bg-white">
      <Nav.Item>
        <NavLink to="/home" className="nav-link">
          Dashboard
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/products" className="nav-link">
          Product
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/suppliers" className="nav-link">
          Supplier
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/reports" className="nav-link">
          Reports
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/settings" className="nav-link">
          Settings
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/customers" className="nav-link">
          Customers
        </NavLink>
      </Nav.Item>
      <Nav.Item>
        <NavLink to="/more" className="nav-link">
          More
        </NavLink>
      </Nav.Item>
    </Nav>
  );
};

export default MainMenu;
