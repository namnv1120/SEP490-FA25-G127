import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { MailOutlined, NumberOutlined, SyncOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, requestPasswordReset } from "../../../services/AuthService";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialEmail = state?.email || "";
  const initialExpires = state?.otpExpiresAt || Date.now() + 2 * 60 * 1000;
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(initialExpires);
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((initialExpires - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const codeValid = useMemo(() => /^\d{6}$/.test(code), [code]);

  const handleSubmit = async () => {
    setEmailError("");
    setCodeError("");
    if (!emailValid) {
      setEmailError("Email không hợp lệ");
      return;
    }
    if (!codeValid) {
      setCodeError("Mã OTP phải gồm 6 chữ số");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, code);
      navigate("/reset-password", { state: { email, code } });
    } catch (err) {
      const msg = err.message || "Mã OTP không hợp lệ hoặc đã hết hạn";
      setCodeError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || !emailValid) return;
    setResendLoading(true);
    try {
      await requestPasswordReset(email);
      message.success(`Mã OTP đã được gửi đến ${email}.`);
      const nextExpires = Date.now() + 2 * 60 * 1000;
      setOtpExpiresAt(nextExpires);
    } catch (err) {
      const msg = err.message || "Không thể gửi lại OTP";
      setEmailError(msg.toLowerCase().includes("email") ? msg : "");
      setCodeError(!msg.toLowerCase().includes("email") ? msg : "");
    } finally {
      setResendLoading(false);
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
        <h2 style={{ marginBottom: 10, textAlign: "center", color: "#0f172a", fontWeight: 700 }}>Nhập mã OTP</h2>
        <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 15, textAlign: "center" }}>
          Vui lòng nhập mã OTP đã được gửi đến email của bạn.
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
              disabled={!!initialEmail || loading}
              style={{ borderRadius: 10, height: 44, ...(initialEmail ? { backgroundColor: "#f3f4f6", color: "#6b7280" } : {}) }}
              type="email"
            />
          </Form.Item>
          
          <Form.Item
            label="Mã xác nhận (6 chữ số)"
            required
            validateStatus={codeError ? "error" : undefined}
            help={codeError || undefined}
            extra={timeLeft > 0 ? `Gửi lại sau ${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}` : "Bạn có thể gửi lại OTP"}
          >
            <Input
              prefix={<NumberOutlined />}
              placeholder="Nhập mã OTP 6 chữ số"
              value={code}
              onChange={(e) => {
                const raw = e.target.value || "";
                const sanitized = raw.replace(/\D+/g, "").slice(0, 6);
                setCode(sanitized);
                if (codeError) setCodeError("");
              }}
              disabled={loading}
              style={{ borderRadius: 10, height: 44, letterSpacing: "6px", textAlign: "center", fontSize: "16px", fontWeight: "bold", maxWidth: 200, width: 200 }}
              maxLength={6}
              suffix={(() => { const disabled = timeLeft > 0 || resendLoading || loading || !emailValid; return (
                <span
                  onClick={() => { if (disabled) return; handleResend(); }}
                  style={{ display: "inline-flex", alignItems: "center", color: disabled ? "#9ca3af" : "#ff6a00", cursor: disabled ? "not-allowed" : "pointer" }}
                  aria-label="Gửi lại OTP"
                >
                  <SyncOutlined spin={resendLoading} />
                </span>
              ); })()}
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
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#9ca3af" }}>Quay lại </span>
          <Link to="/forgot-password" style={{ fontWeight: 600, color: "#111827" }}>
            Quên mật khẩu
          </Link>
        </div>
      </Card>
    </div>
  );
}