import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      message.error("⚠️ Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    setLoading(true);

    // Giả lập gọi API gửi mail
    setTimeout(() => {
      setLoading(false);
      message.success(
        `✅ Hướng dẫn đặt lại mật khẩu đã được gửi đến ${email}.`
      );
      setEmail("");
    }, 1500);
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: 8 }}>Quên mật khẩu?</h2>
        <p style={{ color: "#666", marginBottom: 24, fontSize: 15 }}>
          Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn giúp bạn đặt lại mật
          khẩu.
        </p>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            required
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                backgroundColor: "#ff9b44",
                borderColor: "#ff9b44",
                borderRadius: 8,
              }}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#888" }}>Quay lại </span>
          <Link to="/auth/login" style={{ fontWeight: 600, color: "#000" }}>
            đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
