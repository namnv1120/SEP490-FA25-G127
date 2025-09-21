import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./custom.css";
import Dashboard from "./pages/Dashboard";
import RolesPermissions from "./pages/usermanagement/rolespermissions";
import Users from "./pages/usermanagement/users"; // import component Users
import AppNavbar from "./components/layout/Navbar";

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="bg-light min-vh-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roles-permissions" element={<RolesPermissions />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
