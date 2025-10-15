import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // ✅ trạng thái thông báo
  const [error, setError] = useState(""); // ⚠️ lỗi nếu chưa nhập email
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset trạng thái
    setMessage("");
    setError("");

    if (!email) {
      setError("⚠️ Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    setIsSubmitting(true);

    // Giả lập gửi yêu cầu qua API (3 giây)
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage(
        `✅ Hướng dẫn đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn!`
      );
      setEmail("");
    }, 1500);
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
          Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn giúp bạn đặt lại mật
          khẩu.
        </p>

        {/* ✅ Hiển thị thông báo */}
        {error && (
          <Alert
            variant="danger"
            className="py-2 mb-3 text-center"
            style={{ fontSize: "14px" }}
          >
            {error}
          </Alert>
        )}
        {message && (
          <Alert
            variant="success"
            className="py-2 mb-3 text-center"
            style={{ fontSize: "14px" }}
          >
            {message}
          </Alert>
        )}

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
                disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-100 fw-semibold border-0"
            style={{
              backgroundColor: "#ff9b44",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 0",
            }}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
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
