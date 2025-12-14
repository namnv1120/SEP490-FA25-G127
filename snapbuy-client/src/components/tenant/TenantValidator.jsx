import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTenantInfo } from "../../utils/tenantUtils";
import TenantService from "../../services/TenantService";
import PageLoader from "../loading/PageLoader";

/**
 * Component validate tenant khi app khởi động
 * Wrap ở TenantAppRouter để check tenant có tồn tại không
 */
const TenantValidator = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const tenantInfo = getTenantInfo();

  useEffect(() => {
    const validateTenant = async () => {
      console.log("🔍 TenantValidator - Tenant Info:", tenantInfo);

      // Nếu là admin hoặc đang ở localhost (không có subdomain), skip validation
      if (tenantInfo.isAdmin || !tenantInfo.tenantSlug) {
        console.log("✅ Skipping validation (admin or no subdomain)");
        setIsValid(true);
        setIsValidating(false);
        return;
      }

      console.log("🌐 Validating tenant:", tenantInfo.tenantSlug);

      try {
        const result = await TenantService.validateTenant(
          tenantInfo.tenantSlug
        );

        console.log("📡 Validation result:", result);

        if (result.success) {
          // Tenant hợp lệ, lưu thông tin vào localStorage
          console.log("✅ Tenant valid:", result.data);
          localStorage.setItem("tenantId", result.data.tenantId);
          localStorage.setItem("tenantCode", result.data.tenantCode);
          localStorage.setItem("tenantName", result.data.tenantName);
          setIsValid(true);
        } else {
          // Tenant không tồn tại
          console.log("❌ Tenant invalid:", result.error);
          setIsValid(false);
          setErrorMessage(
            result.error || "Cửa hàng không tồn tại hoặc đã bị vô hiệu hóa"
          );
        }
      } catch (error) {
        console.error("❌ Tenant validation error:", error);
        setIsValid(false);
        setErrorMessage("Không thể kết nối đến máy chủ");
      } finally {
        setIsValidating(false);
      }
    };

    validateTenant();
  }, [tenantInfo.tenantSlug, tenantInfo.isAdmin]);

  // Đang validate
  if (isValidating) {
    return <PageLoader />;
  }

  // Tenant không hợp lệ
  if (!isValid) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "50px 60px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            maxWidth: "700px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            style={{ margin: "0 auto 20px" }}
          >
            <circle cx="12" cy="12" r="10" stroke="#ff4d4f" strokeWidth="2" />
            <path
              d="M12 8V12"
              stroke="#ff4d4f"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1" fill="#ff4d4f" />
          </svg>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#262626",
              marginBottom: "12px",
            }}
          >
            Cửa hàng không tồn tại
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#595959",
              marginBottom: "24px",
              lineHeight: "1.6",
            }}
          >
            {errorMessage}
          </p>

          <div
            style={{
              background: "#f5f5f5",
              padding: "20px 24px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "15px",
              color: "#595959",
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <div>
              <strong>Domain:</strong>
            </div>
            <div>{tenantInfo.hostname}</div>
            <div>
              <strong>Tenant:</strong>
            </div>
            <div>{tenantInfo.tenantSlug}</div>
          </div>

          <button
            onClick={() => (window.location.href = "http://localhost:5173")}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#5568d3")}
            onMouseLeave={(e) => (e.target.style.background = "#667eea")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Tenant hợp lệ, render children
  return <>{children}</>;
};

export default TenantValidator;
