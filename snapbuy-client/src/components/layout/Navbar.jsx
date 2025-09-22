import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Navbar.css";

export default function Navbar() {
  return (
    <header className="site-navbar bg-white shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between py-2">
        {/* Logo + Search */}
        <div className="d-flex align-items-center">
          <Link to="/" className="d-flex align-items-center me-3 logo">
            <img
              src="/logo.png"
              alt="Snapbuy"
              style={{ height: 36, marginRight: 8 }}
            />
            <span style={{ fontWeight: 700, color: "#0b5ed7" }}>
              Snap<span style={{ color: "#ff9f43" }}>Buy</span>
            </span>
          </Link>

          <div
            className="input-group search-box d-none d-md-flex"
            style={{ width: 360 }}
          >
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
            />
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* Top-right controls */}
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm me-2"
            style={{ width: 140 }}
          >
            <option>Freshmart</option>
            <option>Shop A</option>
          </select>

          <button className="btn btn-warning btn-sm fw-bold d-flex align-items-center">
            <i className="bi bi-plus-circle me-1"></i> Add New
          </button>

          <button className="btn btn-dark btn-sm fw-bold d-flex align-items-center ms-2">
            <i className="bi bi-laptop me-1"></i> POS
          </button>

          <button className="btn btn-outline-secondary btn-sm ms-2">
            <i className="bi bi-bell"></i>
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-gear"></i>
          </button>

          <div className="dropdown ms-2">
            <button
              className="btn btn-outline-dark btn-sm dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-fill"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link to="/profile" className="dropdown-item">
                  User Profile
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link to="/logout" className="dropdown-item text-danger">
                  Log out
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hàng menu thứ 2 */}
      <nav className="main-nav d-flex align-items-center gap-3 px-3 py-1">
        <Link to="/dashboard" className="nav-link small">
          Dashboard
        </Link>
        <Link to="/product" className="nav-link small">
          Product
        </Link>
        <Link to="/supplier" className="nav-link small">
          Supplier
        </Link>
        <Link to="/reports" className="nav-link small">
          Reports
        </Link>
        <Link to="/settings" className="nav-link small">
          Settings
        </Link>

        {/* More dropdown */}
        <div className="dropdown">
          <span className="nav-link small dropdown-toggle" role="button">
            More
          </span>
          <ul className="dropdown-menu">
            <li>
              <Link to="/customers" className="dropdown-item">
                Customer
              </Link>
            </li>
            <li>
              <Link to="/user" className="dropdown-item">
                User
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
