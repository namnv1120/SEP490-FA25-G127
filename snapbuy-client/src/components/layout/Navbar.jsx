import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 👉 Xóa dữ liệu login (nếu có, ví dụ localStorage / sessionStorage)
    // localStorage.removeItem("user");
    // sessionStorage.clear();

    // 👉 Điều hướng về trang Login
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm px-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo + Search */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand d-flex align-items-center me-3" to="/">
            <img
              src="/logo.png"
              alt="SnapBuy"
              style={{ height: 35, marginRight: 8 }}
            />
            <span className="fw-bold text-primary fs-5">
              Snap<span className="text-warning">Buy</span>
            </span>
          </Link>

          {/* Search box */}
          <div className="input-group d-none d-md-flex" style={{ width: 260 }}>
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search..."
            />
            <button className="btn btn-outline-secondary">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* Toggle button for mobile */}
        <button
          className="navbar-toggler ms-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul className="navbar-nav gap-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/product">
                Product
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/supplier">
                Supplier
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/user">
                User
              </Link>
            </li>
          </ul>
        </div>

        {/* Right section */}
        <div className="d-flex align-items-center">
          {/* Dropdown chọn shop */}
          <select
            className="form-select form-select-sm me-3 border-primary text-primary fw-semibold"
            style={{ width: 140 }}
          >
            <option>Freshmart</option>
            <option>Shop A</option>
            <option>Shop B</option>
          </select>

          {/* Buttons */}
          <button className="btn btn-warning fw-bold text-white me-2">
            <i className="bi bi-plus-circle me-1" /> Add New
          </button>

          <button className="btn btn-dark fw-bold text-white me-3">
            <i className="bi bi-laptop me-1" /> POS
          </button>

          {/* User dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-dark dropdown-toggle"
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-fill"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li>
                <Link className="dropdown-item" to="/profile">
                  User Profile
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                {/* Dùng button thay vì Link */}
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
