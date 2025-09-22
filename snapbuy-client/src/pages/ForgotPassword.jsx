import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Vui lòng nhập email!");
      return;
    }

    // ✅ Tạm thời hiển thị thông báo (sau này bạn gọi API gửi mail reset password)
    setMessage(`Một liên kết đặt lại mật khẩu đã được gửi tới: ${email}`);
    setEmail("");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h3>Reset Password</h3>
        <p className="text-muted">
          Please enter the email address that you used to register, <br />
          and we will send you a link to reset your password via Email.
        </p>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="youremail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary w-100">
            Reset password
          </button>
        </form>

        <div className="switch-link mt-3">
          <span onClick={() => navigate("/login")}>Return to Sign In</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
