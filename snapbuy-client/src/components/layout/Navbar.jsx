import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm px-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Bên trái: Logo + Search */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand d-flex align-items-center me-3" to="/">
            <img
              src="/logo.png"
              alt="DreamsPOS"
              style={{ height: "35px", marginRight: "8px" }}
            />
            <span className="fw-bold text-primary fs-5">
              Dreams<span className="text-warning">POS</span>
            </span>
          </Link>
          <div className="input-group" style={{ width: "250px" }}>
            <input
              type="text"
              className="form-control border border-secondary bg-white"
              placeholder="Search..."
            />
            <button className="btn btn-outline-secondary">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* Chính giữa: Menu */}
        <div className="collapse navbar-collapse justify-content-center">
          <ul className="navbar-nav gap-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/product">
                Product
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/supplier">
                Supplier
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-dark" to="/user">
                User
              </Link>
            </li>
          </ul>
        </div>

        {/* Bên phải: Dropdown + Button + Icon */}
        <div className="d-flex align-items-center">
          <select
            className="form-select form-select-sm me-2 border-primary text-primary fw-semibold"
            style={{ width: "140px" }}
          >
            <option>Freshmart</option>
            <option>Shop A</option>
            <option>Shop B</option>
          </select>
          <button className="btn btn-warning fw-bold text-white me-2">
            + Add New
          </button>

          {/* POS màu xanh đậm */}
          <button
            className="btn fw-bold me-2"
            style={{ backgroundColor: "#003049", color: "#fff" }}
          >
            POS
          </button>

          <button className="btn btn-outline-primary me-2">
            <i className="bi bi-bell"></i>
          </button>
          <button className="btn btn-outline-secondary me-2">
            <i className="bi bi-gear"></i>
          </button>
          <button className="btn btn-outline-dark">
            <i className="bi bi-person"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;