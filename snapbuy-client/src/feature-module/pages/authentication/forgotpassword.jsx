import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Forgot password request:", email);
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <p className="info-text">
              Please enter the email address that you used to register. We will
              send you a link to reset your password.
            </p>
            <div className="form-group">
              <input
                type="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit">
              Reset password
            </button>
          </form>
        ) : (
          <div className="reset-success">
            <p>
              A reset link has been sent to: <b>{email}</b>
            </p>
            <button className="btn" onClick={() => navigate("/login")}>
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
