import logoImg from "../../assets/img/logo.png";

const AdminLoading = ({ message = "Đang tải..." }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: "2rem",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        <img
          src={logoImg}
          alt="SnapBuy"
          style={{
            width: "300px",
            height: "auto",
          }}
        />
      </div>

      {/* Loading Spinner */}
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(99, 102, 241, 0.2)",
          borderTop: "4px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1.5rem",
        }}
      />

      {/* Message */}
      <p
        style={{
          color: "#9ca3af",
          fontSize: "0.875rem",
          fontWeight: "500",
          letterSpacing: "0.05em",
        }}
      >
        {message}
      </p>

      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.05);
                        opacity: 0.8;
                    }
                }
            `}</style>
    </div>
  );
};

export default AdminLoading;
