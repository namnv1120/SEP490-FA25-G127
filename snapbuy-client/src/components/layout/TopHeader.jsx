// src/components/layout/TopHeader.jsx
import React from "react";
import {
  Navbar,
  Container,
  Form,
  FormControl,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Navbar.css";

const TopHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // nếu có token
    navigate("/login");
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="top-header shadow-sm border-bottom"
    >
      <Container>
        <Navbar.Brand href="/home" className="fw-bold text-dark">
          <img
            src="../src/assets/logo.png"
            alt="Logo"
            height="28"
            className="me-2"
          />
          Snap <span className="text-secondary">Buy</span>
        </Navbar.Brand>

        <Form className="d-flex mx-3 flex-grow-1" style={{ maxWidth: 520 }}>
          <FormControl type="search" placeholder="Search" />
        </Form>

        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-select-sm w-auto">
            <option>Freshmart</option>
            <option>Shop A</option>
          </select>

          <Button
            variant="warning"
            size="sm"
            className="fw-bold text-white px-3"
          >
            + Add New
          </Button>
          <Button variant="dark" size="sm" className="fw-bold px-3">
            POS
          </Button>

          <Button variant="light" size="sm" className="icon-btn">
            <i className="bi bi-bell"></i>
          </Button>
          <Button variant="light" size="sm" className="icon-btn">
            <i className="bi bi-gear"></i>
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="dropdown-user"
              size="sm"
              className="d-flex align-items-center"
            >
              <i className="bi bi-person-circle fs-5"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/profile")}>
                Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default TopHeader;
