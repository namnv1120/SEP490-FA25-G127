import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../../services/AuthService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      setEmailError("Vui lòng nhập email");
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      setEmailError("Email không hợp lệ");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      message.success(`Mã OTP đã được gửi đến ${email}.`);
      navigate("/verify-otp", { state: { email, otpExpiresAt: Date.now() + 2 * 60 * 1000 } });
    } catch (error) {
      setEmailError(error.message || "Không thể gửi yêu cầu đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 440,
          borderRadius: 16,
          boxShadow: "0 12px 24px rgba(17, 24, 39, 0.08)",
          border: "1px solid #e5e7eb",
          padding: 8,
          background: "#fff",
        }}
      >
        <h2 style={{ marginBottom: 10, textAlign: "center", color: "#0f172a", fontWeight: 700 }}>Quên mật khẩu?</h2>
        <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 15, textAlign: "center" }}>
          Nhập email để nhận mã OTP xác minh đặt lại mật khẩu.
        </p>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            required
            validateStatus={emailError ? "error" : undefined}
            help={emailError || undefined}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              disabled={loading}
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: "linear-gradient(90deg, #ff9b44 0%, #ff6a00 100%)",
                border: "none",
                borderRadius: 10,
                height: 44,
                boxShadow: "0 8px 16px rgba(255, 155, 68, 0.25)",
              }}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#9ca3af" }}>Quay lại </span>
          <Link to="/login" style={{ fontWeight: 600, color: "#111827" }}>
            đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
