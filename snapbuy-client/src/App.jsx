import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./custom.css";

// Pages
import DashboardHome from "./pages/DashboardHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Customer from "./pages/Customer";

// Layout
import Layout from "./components/layout/Layout";

// Dummy pages (placeholder)
const Billers = () => <h2>Billers Page</h2>;
const Suppliers = () => <h2>Suppliers Page</h2>;
const Stores = () => <h2>Stores Page</h2>;
const Warehouses = () => <h2>Warehouses Page</h2>;
const UserManagement = () => <h2>User Management Page</h2>;
const Docs = () => <h2>Documentation</h2>;
const Changelog = () => <h2>Changelog v2.0.7</h2>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes dùng chung Layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<DashboardHome />} />
          <Route path="/customers" element={<Customer />} />
          <Route path="/billers" element={<Billers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/changelog" element={<Changelog />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
