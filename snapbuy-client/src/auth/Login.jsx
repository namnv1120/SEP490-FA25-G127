import React, { useState } from "react";
import "../styles/Auth.scss";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Login with: ${email}`);
    navigate("/dashboard"); // chuyển sau khi login thành công
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit">
            Login
          </button>
        </form>
        <a className="link" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </a>
        <a className="link" onClick={() => navigate("/register")}>
          Create Account
        </a>
      </div>
    </div>
  );
}
