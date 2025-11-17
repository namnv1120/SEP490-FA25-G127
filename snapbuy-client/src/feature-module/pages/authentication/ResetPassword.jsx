import React, { useState, useMemo } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../../services/AuthService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialEmail = state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(state?.code || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const codeValid = useMemo(() => /^\d{6}$/.test(code), [code]);

  const handleSubmit = async () => {
    setEmailError("");
    setNewPasswordError("");
    setConfirmError("");
    if (!emailValid) {
      setEmailError("Email không hợp lệ");
      return;
    }
    if (!codeValid) {
      navigate("/verify-otp", { state: { email } });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setNewPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (/\s/.test(newPassword)) {
      setNewPasswordError("Mật khẩu không được chứa khoảng trắng");
      return;
    }
    if (newPassword !== confirm) {
      setConfirmError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (/\s/.test(confirm)) {
      setConfirmError("Mật khẩu không được chứa khoảng trắng");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword, confirm);
      message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (err) {
      const msg = err.message || "Không thể đổi mật khẩu";
      const lower = msg.toLowerCase();
      if (lower.includes("email")) setEmailError(msg);
      else if (lower.includes("khớp")) setConfirmError(msg);
      else if (lower.includes("mật khẩu")) setNewPasswordError(msg);
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
        style={{ width: 460, borderRadius: 16, boxShadow: "0 12px 24px rgba(17, 24, 39, 0.08)", border: "1px solid #e5e7eb", padding: 8, background: "#fff" }}
      >
        <h2 style={{ marginBottom: 10, textAlign: "center", color: "#0f172a", fontWeight: 700 }}>Đặt lại mật khẩu</h2>
        <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 15, textAlign: "center" }}>
          Nhập mật khẩu mới và xác nhận để hoàn tất đặt lại mật khẩu.
        </p>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Email" required validateStatus={emailError ? "error" : undefined} help={emailError || undefined}>
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email"
              value={email}
              readOnly
              disabled
              style={{
                borderRadius: 10,
                height: 44,
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                borderColor: "#e5e7eb",
              }}
              type="email"
            />
          </Form.Item>
          {/* Mã OTP đã được nhập ở màn trước; nếu thiếu sẽ điều hướng về Verify OTP */}
          <Form.Item label="Mật khẩu mới" required validateStatus={newPasswordError ? "error" : undefined} help={newPasswordError || undefined}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (newPasswordError) setNewPasswordError("");
              }}
              disabled={loading}
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới" required validateStatus={confirmError ? "error" : undefined} help={confirmError || undefined}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu mới"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (confirmError) setConfirmError("");
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
              style={{ background: "linear-gradient(90deg, #ff9b44 0%, #ff6a00 100%)", border: "none", borderRadius: 10, height: 44, boxShadow: "0 8px 16px rgba(255, 155, 68, 0.25)" }}
            >
              Đổi mật khẩu
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