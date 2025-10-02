import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./custom.css";
import DashboardHome from "./pages/DashboardHome";
import AppNavbar from "./components/layout/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Customer from "./pages/Customer";

// Inventory imports
import Product from "./inventory/Product"; 
import Category from "./inventory/category";
import Suppliers from "./feature-module/people/SuppliersList"; 

// Dummy pages
const Billers = () => <h2>Billers Page</h2>;
const SupplierList = () => <h2>Suppliers Page</h2>;
const Stores = () => <h2>Stores Page</h2>;
const Warehouses = () => <h2>Warehouses Page</h2>;
const UserManagement = () => <h2>User Management Page</h2>;
const Docs = () => <h2>Documentation</h2>;
const Changelog = () => <h2>Changelog v2.0.7</h2>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/customers" element={<Customer />} />

        {/* Product route */}
        <Route
          path="/product"
          element={
            <>
              <AppNavbar />
              <div className="d-flex">
                <div className="flex-grow-1 p-3">
                  <Product />
                </div>
              </div>
            </>
          }
        />

        {/* Category route - chỉ cần một route duy nhất */}
        <Route
          path="/category"
          element={
            <>
              <AppNavbar />
              <div className="d-flex">
                <div className="flex-grow-1 p-3">
                  <Category />
                </div>
              </div>
            </>
          }
        />

        {/* Supplier route */}
        <Route
          path="/supplier"
          element={
            <>
              <AppNavbar />
              <div className="d-flex">
                <div className="flex-grow-1 p-3">
                  <Suppliers />
                </div>
              </div>
            </>
          }
        />

        {/* Home route */}
        <Route
          path="/home"
          element={
            <>
              <AppNavbar />
              <div className="d-flex">
                <div className="flex-grow-1 p-3">
                  <DashboardHome />
                </div>
              </div>
            </>
          }
        />

        {/* Other routes */}
        <Route path="/billers" element={<Billers />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/changelog" element={<Changelog />} />
      </Routes>
    </Router>
  );
}

export default App;