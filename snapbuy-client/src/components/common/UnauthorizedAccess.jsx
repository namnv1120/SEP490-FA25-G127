import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="text-center p-5">
        <div className="mb-4">
          <i className="ti ti-shield-x" style={{ fontSize: '120px', color: '#dc3545' }}></i>
        </div>
        <h1 className="display-4 fw-bold mb-3" style={{ color: '#212529' }}>
          Bạn không có quyền
        </h1>
        <p className="lead mb-4" style={{ color: '#6c757d' }}>
          Tài khoản của bạn không có quyền truy cập trang này.
          <br />
          Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/login")}
        >
          <i className="ti ti-arrow-left me-2"></i>
          Quay về đăng nhập
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;





