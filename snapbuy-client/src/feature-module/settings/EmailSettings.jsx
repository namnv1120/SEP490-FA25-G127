import { useEffect, useState } from "react";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getMyInfo, requestEmailVerification, verifyEmailOtp } from "../../services/AccountService";

const EmailSettings = () => {
  const [formData, setFormData] = useState({
    id: null,
    email: "",
  });
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [emailErrors, setEmailErrors] = useState({});
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getMyInfo();
        const user = response?.result || response || {};

        setFormData({
          id: user?.id ?? user?.accountId ?? null,
          email: user?.email || "",
        });
      } catch (error) {
        message.error(
          error?.message || "Không thể tải thông tin tài khoản. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setTimeLeft(left);
    }, 500);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setEmailErrors({});

    if (!newEmail.trim()) {
      setEmailErrors({ newEmail: "Vui lòng nhập email mới" });
      message.error("Vui lòng nhập email mới");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailErrors({ newEmail: "Email không hợp lệ" });
      message.error("Email không hợp lệ");
      return;
    }

    try {
      setSavingEmail(true);
      await requestEmailVerification(newEmail.trim());
      message.success("Đã gửi mã xác nhận đến email! Vui lòng kiểm tra hộp thư.");
      setShowOtpForm(true);
      setOtpExpiresAt(Date.now() + 2 * 60 * 1000);
      setEmailErrors({});
    } catch (error) {
      message.error(error.message || "Không thể gửi mã xác nhận");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setEmailErrors({});

    if (!otpCode.trim() || otpCode.length !== 6) {
      setEmailErrors({ otpCode: "Vui lòng nhập mã xác nhận 6 chữ số" });
      message.error("Vui lòng nhập mã xác nhận 6 chữ số");
      return;
    }

    try {
      setVerifying(true);
      await verifyEmailOtp(newEmail.trim(), otpCode.trim());
      message.success("Xác nhận email thành công!");
      setShowOtpForm(false);
      setNewEmail("");
      setOtpCode("");
      setEmailErrors({});
      const response = await getMyInfo();
      const user = response?.result || response || {};
      setFormData((prev) => ({
        ...prev,
        email: user?.email || "",
      }));
    } catch (error) {
      message.error(error.message || "Xác nhận email thất bại");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || resendLoading || verifying || savingEmail) return;
    try {
      setResendLoading(true);
      await requestEmailVerification(newEmail.trim());
      message.success("Đã gửi lại mã xác nhận đến email!");
      setOtpExpiresAt(Date.now() + 2 * 60 * 1000);
    } catch (error) {
      message.error(error.message || "Không thể gửi lại OTP");
    } finally {
      setResendLoading(false);
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
                    <h4 className="fs-18 fw-bold">Email</h4>
                  </div>
                  <div className="card-body">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={showOtpForm ? handleVerifyOtp : handleRequestOtp} noValidate>
                        <div className="card-title-head mb-3">
                          <h6 className="fs-16 fw-bold mb-1">
                            <span className="fs-16 me-2">
                              <i className="ti ti-mail" />
                            </span>
                            Thay đổi Email
                          </h6>
                        </div>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Email hiện tại
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                readOnly
                                disabled
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Email mới <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className={`form-control ${emailErrors.newEmail ? "is-invalid" : ""}`}
                                value={newEmail}
                                onChange={(e) => {
                                  setNewEmail(e.target.value);
                                  setEmailErrors((prev) => ({ ...prev, newEmail: "" }));
                                }}
                                disabled={savingEmail || showOtpForm}
                                placeholder="Nhập email mới"
                              />
                              {emailErrors.newEmail && (
                                <div className="invalid-feedback">{emailErrors.newEmail}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        {showOtpForm && (
                          <div className="row mb-4">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Mã xác nhận (6 chữ số) <span className="text-danger">*</span>
                                </label>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <input
                                    type="text"
                                    className={`form-control ${emailErrors.otpCode ? "is-invalid" : ""}`}
                                    value={otpCode}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                      setOtpCode(value);
                                      setEmailErrors((prev) => ({ ...prev, otpCode: "" }));
                                    }}
                                    disabled={verifying}
                                    maxLength={6}
                                    style={{
                                      letterSpacing: '6px',
                                      textAlign: 'center',
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      maxWidth: '200px',
                                      width: '200px',
                                      paddingRight: '2rem'
                                    }}
                                  />
                                  <span
                                    onClick={handleResendOtp}
                                    style={{
                                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                      color: timeLeft > 0 || resendLoading || verifying ? '#9ca3af' : '#ff6a00',
                                      cursor: timeLeft > 0 || resendLoading || verifying ? 'not-allowed' : 'pointer'
                                    }}
                                    title="Gửi lại OTP"
                                  >
                                    <i className={`bi ${resendLoading ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'}`} />
                                  </span>
                                </div>
                                {emailErrors.otpCode && (
                                  <div className="invalid-feedback">{emailErrors.otpCode}</div>
                                )}
                                <small className="text-muted d-block mt-1">
                                  Mã xác nhận đã được gửi đến {newEmail}. {timeLeft > 0 ? `Gửi lại sau ${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}` : 'Bạn có thể gửi lại OTP'}
                                </small>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-end mb-4">
                          {showOtpForm && (
                            <button
                              type="button"
                              className="btn btn-secondary me-2"
                              onClick={() => {
                                setShowOtpForm(false);
                                setOtpCode("");
                              }}
                              disabled={verifying}
                            >
                              Hủy
                            </button>
                          )}
                          <button type="submit" className="btn btn-primary" disabled={savingEmail || verifying}>
                            {verifying ? "Đang xác nhận..." : savingEmail ? "Đang gửi..." : showOtpForm ? "Xác nhận" : "Gửi mã xác nhận"}
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

export default EmailSettings;

