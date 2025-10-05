import React, { useState } from "react";
import "../styles/Auth.scss";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Sau này thay bằng API call Spring Boot
    // const res = await fetch("http://localhost:8080/api/auth/login", {...})
    // const data = await res.json()

    if (form.email && form.password) {
      console.log("Login success:", form);
      navigate("/dashboard"); // đổi route tùy backend
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn" type="submit">
            Login
          </button>
        </form>

        {/* ✅ sửa lại để không bị reload trang */}
        <button
          type="button"
          className="link"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </button>
        <button
          type="button"
          className="link"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
