import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Lấy previous location từ sessionStorage
    const previousPath = sessionStorage.getItem("previous_authorized_location");

    if (previousPath && previousPath !== "/404") {
      // Nếu có previous path hợp lệ, navigate về đó
      navigate(previousPath, { replace: true });
    } else {
      // Nếu không, quay về bằng history
      navigate(-1);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div className="text-center p-5">
        <div className="mb-4">
          <i
            className="ti ti-alert-circle"
            style={{ fontSize: "120px", color: "#dc3545" }}
          ></i>
        </div>
        <h1 className="display-4 fw-bold mb-3" style={{ color: "#212529" }}>
          404
        </h1>
        <h2 className="h4 mb-3" style={{ color: "#6c757d" }}>
          Trang không tìm thấy
        </h2>
        <p className="lead mb-4" style={{ color: "#6c757d" }}>
          Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy
          cập.
          <br />
          Vui lòng quay lại trang trước hoặc liên hệ quản trị viên nếu bạn cần
          hỗ trợ.
        </p>
        <button onClick={handleGoBack} className="btn btn-primary btn-lg">
          <i className="ti ti-arrow-left me-2"></i>
          Quay về
        </button>
      </div>
    </div>
  );
};

export default NotFound;
