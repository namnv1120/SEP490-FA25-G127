import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./custom.css";
import Dashboard from "./pages/Dashboard";
import AppNavbar from "./components/layout/Navbar";

function App() {
  return (
    <Router>
      <AppNavbar />
      <div className="bg-light min-vh-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
