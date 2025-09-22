import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Auth.css";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.userData) {
      setFormData({
        email: location.state.userData.email,
        password: location.state.userData.password,
      });
      setSuccessMsg(location.state.message || "");
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập email và mật khẩu!");
      return;
    }

    setError("");
    console.log("Login thành công với: ", formData);

    // ✅ Điều hướng sang Dashboard
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h3>Login</h3>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && <div className="text-danger mb-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>

        {/* 👇 Các link điều hướng */}
        <div className="switch-link mt-3">
          <span onClick={() => navigate("/register")}>Register</span>
        </div>
        <div className="switch-link mt-2">
          <span onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
