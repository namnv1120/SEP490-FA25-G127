import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./custom.css";
import DashboardHome from "./pages/DashboardHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Customer from "./pages/Customer";
import Layout from "./components/layout/Layout"; // 👉 thêm Layout

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
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes dùng chung Layout */}
        <Route
          path="/home"
          element={
            <Layout>
              <DashboardHome />
            </Layout>
          }
        />
        <Route
          path="/customers"
          element={
            <Layout>
              <Customer />
            </Layout>
          }
        />
        <Route
          path="/billers"
          element={
            <Layout>
              <Billers />
            </Layout>
          }
        />
        <Route
          path="/suppliers"
          element={
            <Layout>
              <Suppliers />
            </Layout>
          }
        />
        <Route
          path="/stores"
          element={
            <Layout>
              <Stores />
            </Layout>
          }
        />
        <Route
          path="/warehouses"
          element={
            <Layout>
              <Warehouses />
            </Layout>
          }
        />
        <Route
          path="/user-management"
          element={
            <Layout>
              <UserManagement />
            </Layout>
          }
        />
        <Route
          path="/docs"
          element={
            <Layout>
              <Docs />
            </Layout>
          }
        />
        <Route
          path="/changelog"
          element={
            <Layout>
              <Changelog />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
