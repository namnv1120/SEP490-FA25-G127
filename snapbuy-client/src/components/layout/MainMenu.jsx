import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import "../../styles/MainMenu.css";

export default function MainMenu() {
  return (
    <Navbar bg="white" expand="lg" className="mainmenu-navbar border-bottom">
      <Container fluid>
        <Nav className="me-auto align-items-center mainmenu-links">
          <Nav.Link href="#">
            <i className="bi bi-grid me-1"></i> Main Menu
          </Nav.Link>

          <NavDropdown
            title={
              <>
                <i className="bi bi-box me-1"></i> Inventory
              </>
            }
            id="nav-inventory"
          >
            <NavDropdown.Item href="#">Products</NavDropdown.Item>
            <NavDropdown.Item href="#">Categories</NavDropdown.Item>
          </NavDropdown>

          <NavDropdown
            title={
              <>
                <i className="bi bi-cart me-1"></i> Sales & Purchase
              </>
            }
            id="nav-sales"
          >
            <NavDropdown.Item href="#">Sales</NavDropdown.Item>
            <NavDropdown.Item href="#">Purchase</NavDropdown.Item>
          </NavDropdown>

          <Nav.Link href="#">
            <i className="bi bi-layers me-1"></i> UI Interface
          </Nav.Link>
          <Nav.Link href="#">
            <i className="bi bi-person me-1"></i> Profile
          </Nav.Link>
          <Nav.Link href="#">
            <i className="bi bi-graph-up me-1"></i> Reports
          </Nav.Link>
          <Nav.Link href="#">
            <i className="bi bi-gear me-1"></i> Settings
          </Nav.Link>

          <NavDropdown
            title={
              <>
                <i className="bi bi-three-dots me-1"></i> More
              </>
            }
            id="nav-more"
          >
            <NavDropdown.Item href="#">Help</NavDropdown.Item>
            <NavDropdown.Item href="#">About</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
