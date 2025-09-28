import React from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavDropdown, Container } from "react-bootstrap";
import {
  BiHome,
  BiBox,
  BiCategory,
  BiPurchaseTag,
  BiUser,
  BiGroup,
  BiBarChartAlt2,
  BiCog,
  BiDotsHorizontalRounded,
} from "react-icons/bi";
import "../../styles/MainMenu.css";

const MainMenu = () => {
  return (
    <div className="main-menu border-bottom bg-white">
      <Container>
        <Nav
          className="d-flex align-items-center justify-content-start"
          variant="tabs"
        >
          {/* Dashboard */}
          <Nav.Item>
            <NavLink to="/home" className="nav-link">
              <BiHome className="me-1" /> Dashboard
            </NavLink>
          </Nav.Item>

          {/* Inventory dropdown */}
          <NavDropdown
            title={
              <>
                <BiBox className="me-1" /> Inventory
              </>
            }
            id="inventory-menu"
          >
            <NavDropdown.Item as={NavLink} to="/products">
              <BiBox className="me-1" /> Products
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/categories">
              <BiCategory className="me-1" /> Categories
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/brands">
              <BiPurchaseTag className="me-1" /> Brands
            </NavDropdown.Item>
          </NavDropdown>

          {/* Supplier */}
          <Nav.Item>
            <NavLink to="/suppliers" className="nav-link">
              <BiGroup className="me-1" /> Supplier
            </NavLink>
          </Nav.Item>

          {/* Reports */}
          <Nav.Item>
            <NavLink to="/reports" className="nav-link">
              <BiBarChartAlt2 className="me-1" /> Reports
            </NavLink>
          </Nav.Item>

          {/* Settings */}
          <Nav.Item>
            <NavLink to="/settings" className="nav-link">
              <BiCog className="me-1" /> Settings
            </NavLink>
          </Nav.Item>

          {/* More dropdown */}
          <NavDropdown
            title={
              <>
                <BiDotsHorizontalRounded className="me-1" /> More
              </>
            }
            id="more-menu"
            className="ms-0"
          >
            <NavDropdown.Item as={NavLink} to="/customers">
              <BiUser className="me-1" /> Customers
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/user-management">
              <BiGroup className="me-1" /> Users
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/suppliers">
              <BiGroup className="me-1" /> Suppliers
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </div>
  );
};

export default MainMenu;
