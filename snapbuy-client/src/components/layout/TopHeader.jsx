import React from "react";
import { Navbar, Container, Form, Button, Nav } from "react-bootstrap";
import { FiPlusSquare } from "react-icons/fi";

export default function TopHeader() {
  return (
    <Navbar bg="white" expand="lg" className="top-header shadow-sm py-2">
      <Container fluid className="align-items-center">
        <Navbar.Brand className="d-flex align-items-center gap-2">
          <div className="brand-logo">
            {" "}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#ff8a00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              D
            </div>
          </div>
          <div className="d-none d-md-block brand-text">
            <span style={{ fontWeight: 700, fontSize: 18 }}>Dreams</span>
            <small className="text-muted ms-1">POS</small>
          </div>
        </Navbar.Brand>
        <Form className="mx-3 flex-grow-1 d-none d-md-flex">
          <Form.Control placeholder="Search" className="search-input" />
        </Form>

        <Nav className="ms-auto align-items-center gap-2">
          <Button variant="outline-secondary" size="sm">
            Freshmart ▾
          </Button>
          <Button variant="warning" className="btn-add-header" size="sm">
            <FiPlusSquare /> Add New
          </Button>
          <Button variant="dark" size="sm">
            POS
          </Button>
          <div className="d-none d-md-flex align-items-center gap-2 ms-2">
            <div className="icon-round"></div>
            <div className="icon-round"></div>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}
