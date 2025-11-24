import { useState } from "react";
import { login } from "../../../services/AuthService";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (/\s/.test(password)) {
      setPasswordError("Mật khẩu không được chứa khoảng trắng");
      return;
    }
    try {
      await login(username, password);
      const role = localStorage.getItem("role");
      if (role === "Nhân viên bán hàng") {
        window.location.href = "/sale-dashboard";
      } else if (role === "Chủ cửa hàng") {
        window.location.href = "/shopowner-dashboard";
      } else if (role === "Quản trị viên") {
        window.location.href = "/admin-dashboard";
      } else if (role === "Nhân viên kho") {
        window.location.href = "/warehouse-dashboard";
      } else {
        window.location.href = "/shopowner-dashboard";
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title fw-bold">Đăng nhập</h2>
                <p className="text-muted">Vui lòng nhập thông tin của bạn</p>
              </div>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${passwordError ? "is-invalid" : ""}`}
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                    required
                  />
                  {passwordError && (
                    <div className="invalid-feedback">{passwordError}</div>
                  )}
                </div>

                {/* ✅ Quên mật khẩu và Đăng ký hiển thị cùng dòng */}
                <div className="mb-3 d-flex justify-content-between">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none small"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Đăng nhập
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
