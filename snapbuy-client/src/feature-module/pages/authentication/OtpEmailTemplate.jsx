import React from "react";

export default function OtpEmailTemplate({ username = "người dùng", code = "000000", expiresAt = new Date() }) {
  const formatExpire = (dt) => {
    const d = dt instanceof Date ? dt : new Date(dt);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  };
  const digits = String(code).padStart(6, "0").split("");
  return (
    <div style={{ background: "#f6f9fc", padding: 24, fontFamily: "Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, boxShadow: "0 12px 24px rgba(17,24,39,.08)" }}>
        <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0f172a" }}>SnapBuy</div>
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>Xác nhận đặt lại mật khẩu</div>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ color: "#0f172a", fontSize: 16, margin: "0 0 8px" }}>Xin chào {username},</p>
          <p style={{ color: "#475569", fontSize: 14, margin: "0 0 16px" }}>Mã OTP của bạn:</p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, margin: "12px 0 20px" }}>
            {digits.map((d, i) => (
              <div key={i} style={{ width: 44, height: 44, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff", color: "#0f172a", fontWeight: 700, fontSize: 20, lineHeight: "44px", textAlign: "center" }}>{d}</div>
            ))}
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", color: "#334155", fontSize: 14 }}>OTP có hiệu lực đến: {formatExpire(expiresAt)}</div>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 16 }}>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>© {new Date().getFullYear()} SnapBuy</div>
      </div>
    </div>
  );
}