import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    console.log("Đã gửi yêu cầu đặt lại mật khẩu cho:", email);
    alert("Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn!");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f9fafb" }}
    >
      <div
        className="p-4 shadow-sm rounded-3"
        style={{
          width: "400px",
          backgroundColor: "#fff",
          border: "1px solid #eee",
        }}
      >
        <h4 className="fw-bold mb-2">Quên mật khẩu?</h4>
        <p className="text-secondary mb-4" style={{ fontSize: "15px" }}>
          Nếu bạn quên mật khẩu, vui lòng nhập email. Chúng tôi sẽ gửi hướng dẫn
          giúp bạn đặt lại mật khẩu.
        </p>

        <Form onSubmit={handleSubmit}>
          {/* Email */}
          <Form.Group className="mb-4" controlId="formEmail">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type="email"
                value={email}
                placeholder="Nhập địa chỉ email"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: "8px",
                  paddingRight: "35px",
                }}
              />
              <i
                className="bi bi-envelope position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                style={{ pointerEvents: "none" }}
              />
            </div>
          </Form.Group>

          {/* Nút gửi yêu cầu */}
          <Button
            type="submit"
            className="w-100 fw-semibold border-0"
            style={{
              backgroundColor: "#ff9b44",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 0",
            }}
          >
            Gửi yêu cầu
          </Button>

          {/* Quay lại đăng nhập */}
          <div className="text-center mt-3">
            <span className="text-muted">Quay lại </span>
            <Link to="/auth/login" className="fw-semibold text-dark">
              đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
