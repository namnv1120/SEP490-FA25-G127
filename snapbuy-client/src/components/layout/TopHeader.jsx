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
    // Xóa token, session... nếu bạn có
    // localStorage.removeItem("token");

    navigate("/login"); // chuyển hướng về login
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm border-bottom">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand
          href="/home"
          className="fw-bold text-primary d-flex align-items-center"
        >
          <img
            src="../../src/assets/logo.png"
            alt="Logo"
            width={150}
            className="me-4"
          />
          SnapBuy
        </Navbar.Brand>

        {/* Ô search */}
        <Form className="d-flex mx-auto w-50">
          <FormControl type="search" placeholder="Search..." className="me-2" />
          <Button variant="outline-primary">Search</Button>
        </Form>

        {/* Nút chức năng */}
        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-select-sm">
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
          <Button variant="dark" size="sm">
            POS
          </Button>
          <Button variant="light" size="sm">
            <i className="bi bi-bell"></i>
          </Button>
          <Button variant="light" size="sm">
            <i className="bi bi-gear"></i>
          </Button>

          {/* User Avatar Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              size="sm"
              className="d-flex align-items-center"
            >
              <i className="bi bi-person-circle fs-5"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/profile")}>
                User Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                Log out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default TopHeader;
