import { useEffect, useState } from "react";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getMyInfo } from "../../services/AccountService";
import axios from "axios";

const REST_API_BASE_URL = 'http://localhost:8080/api/accounts';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');
  return { Authorization: `${tokenType} ${token}` };
};

const PasswordSettings = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setPasswordErrors({});

    if (!formData.oldPassword) {
      setPasswordErrors({ oldPassword: "Vui lòng nhập mật khẩu cũ" });
      message.error("Vui lòng nhập mật khẩu cũ");
      return;
    }

    if (!formData.newPassword) {
      setPasswordErrors({ newPassword: "Vui lòng nhập mật khẩu mới" });
      message.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      message.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Mật khẩu xác nhận không khớp" });
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setSavingPassword(true);
      const passwordData = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword,
      };

      const response = await axios.put(
        `${REST_API_BASE_URL}/me/change-password`,
        passwordData,
        { headers: getAuthHeader() }
      );

      message.success("Đổi mật khẩu thành công!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.";
      message.error(errorMsg);
      if (errorMsg.includes("mật khẩu cũ")) {
        setPasswordErrors({ oldPassword: errorMsg });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content settings-content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Cài đặt</h4>
                <h6>Quản lý cài đặt phần mềm</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <RefreshIcon />
              <CollapesIcon />
            </ul>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="settings-wrapper d-flex">
                <SettingsSideBar />
                <div className="card flex-fill mb-0">
                  <div className="card-header">
                    <h4 className="fs-18 fw-bold">Mật khẩu</h4>
                  </div>
                  <div className="card-body">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} noValidate>
                        <div className="card-title-head mb-3">
                          <h6 className="fs-16 fw-bold mb-1">
                            <span className="fs-16 me-2">
                              <i className="ti ti-lock" />
                            </span>
                            Thay đổi Mật khẩu
                          </h6>
                        </div>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Mật khẩu cũ <span className="text-danger">*</span>
                              </label>
                              <div className="pass-group position-relative">
                                <input
                                  type={showOldPassword ? "text" : "password"}
                                  className={`form-control ${passwordErrors.oldPassword ? "is-invalid" : ""}`}
                                  value={formData.oldPassword}
                                  onChange={(e) => {
                                    handleInputChange("oldPassword")(e);
                                    setPasswordErrors((prev) => ({ ...prev, oldPassword: "" }));
                                  }}
                                  disabled={savingPassword}
                                />
                                <span
                                  className={`ti toggle-password position-absolute end-0 top-50 translate-middle-y me-2 ${showOldPassword ? "ti-eye" : "ti-eye-off"}`}
                                  onClick={() => setShowOldPassword(!showOldPassword)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                              {passwordErrors.oldPassword && (
                                <div className="invalid-feedback">{passwordErrors.oldPassword}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Mật khẩu mới <span className="text-danger">*</span>
                              </label>
                              <div className="pass-group position-relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                                  value={formData.newPassword}
                                  onChange={(e) => {
                                    handleInputChange("newPassword")(e);
                                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                                  }}
                                  disabled={savingPassword}
                                />
                                <span
                                  className={`ti toggle-password position-absolute end-0 top-50 translate-middle-y me-2 ${showNewPassword ? "ti-eye" : "ti-eye-off"}`}
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                              {passwordErrors.newPassword && (
                                <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                              )}
                              {!passwordErrors.newPassword && (
                                <small className="text-muted d-block mt-1">Mật khẩu phải có ít nhất 6 ký tự</small>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Xác nhận mật khẩu mới <span className="text-danger">*</span>
                              </label>
                              <div className="pass-group position-relative">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                                  value={formData.confirmPassword}
                                  onChange={(e) => {
                                    handleInputChange("confirmPassword")(e);
                                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                  }}
                                  disabled={savingPassword}
                                />
                                <span
                                  className={`ti toggle-password position-absolute end-0 top-50 translate-middle-y me-2 ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`}
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                              {passwordErrors.confirmPassword && (
                                <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                            {savingPassword ? "Đang lưu..." : "Đổi Mật khẩu"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
    </>
  );
};

export default PasswordSettings;

