import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getMyInfo } from "../../services/AccountService";
import { getImageUrl } from "../../utils/imageUtils";
import { API_ENDPOINTS } from "../../services/apiConfig";
import PageLoader from "../../components/loading/PageLoader.jsx";

const pickFirstDefined = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && value !== ""
  ) ?? "";

const Profile = () => {
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    phone: "",
    email: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEditEmail, setCanEditEmail] = useState(false);

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error("Kích thước file phải nhỏ hơn 2MB");
        return;
      }
      if (!file.type.match(/^image\/(jpg|jpeg|png)$/)) {
        message.error("Chỉ chấp nhận file JPG, PNG");
        return;
      }
      setAvatarFile(file);
      setIsImageVisible(true);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsImageVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      message.error("Vui lòng nhập họ và tên");
      return;
    }

    if (canEditEmail && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = formData.email.trim();
      if (!trimmedEmail) {
        message.error("Vui lòng nhập email");
        return;
      }
      if (!emailRegex.test(trimmedEmail)) {
        message.error("Email không hợp lệ");
        return;
      }
    }

    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName.trim());
      if (formData.phone) {
        formDataToSend.append("phone", formData.phone);
      }
      if (canEditEmail && formData.email) {
        formDataToSend.append("email", formData.email.trim());
      }

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      } else if (!isImageVisible && formData.avatarUrl) {
        formDataToSend.append("removeAvatar", "true");
      }

      const response = await fetch(`${API_ENDPOINTS.ACCOUNTS}/${formData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật thông tin");
      }

      message.success("Cập nhật thông tin thành công!");

      const fetchProfile = async () => {
        try {
          const response = await getMyInfo();
          const user = response?.result || response || {};

          const avatarUrl = user?.avatarUrl || "";
          const userEmail = user?.email || "";
          setFormData((prev) => ({
            ...prev,
            avatarUrl: avatarUrl,
            email: userEmail,
          }));

          if (avatarUrl) {
            const fullImageUrl = getImageUrl(avatarUrl);
            setAvatarPreview(fullImageUrl);
            setIsImageVisible(true);
          } else {
            setAvatarPreview(null);
            setIsImageVisible(false);
          }

          setCanEditEmail(!userEmail || userEmail.trim() === "");
          window.dispatchEvent(
            new CustomEvent("profileUpdated", { detail: user })
          );
        } catch (error) {
          message.error(error.message || "Không thể tải thông tin tài khoản");
        }
      };

      await fetchProfile();
      setAvatarFile(null);
    } catch (error) {
      message.error(error.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getMyInfo();
        const user = response?.result || response || {};

        const avatarUrl = user?.avatarUrl || "";
        const userEmail =
          pickFirstDefined(user?.email, user?.emailAddress) || "";
        setFormData({
          id: user?.id ?? user?.accountId ?? null,
          fullName: user?.fullName || "",
          phone:
            pickFirstDefined(
              user?.phone,
              user?.phoneNumber,
              user?.contactNumber
            ) || "",
          email: userEmail,
          avatarUrl: avatarUrl,
        });

        setCanEditEmail(!userEmail || userEmail.trim() === "");

        if (avatarUrl) {
          const fullImageUrl = getImageUrl(avatarUrl);
          setAvatarPreview(fullImageUrl);
          setIsImageVisible(true);
        } else {
          setAvatarPreview(null);
          setIsImageVisible(false);
        }
      } catch (error) {
        message.error(
          error?.message ||
            "Không thể tải thông tin tài khoản. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }
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
                    <h4 className="fs-18 fw-bold">Trang cá nhân</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="card-title-head">
                        <h6 className="fs-16 fw-bold mb-1">
                          <span className="fs-16 me-2">
                            <i className="ti ti-user" />
                          </span>
                          Thông tin cơ bản
                        </h6>
                      </div>
                      <div className="profile-pic-upload">
                        <div className="add-choosen">
                          <div className="mb-3">
                            <div className="image-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                              <div className="image-uploads">
                                <i className="feather icon-plus-circle plus-down-add me-0" />
                                <h4 className="fw-bold">Thêm ảnh</h4>
                              </div>
                            </div>
                          </div>
                          {isImageVisible && avatarPreview && (
                            <div className="phone-img">
                              <img src={avatarPreview} alt="avatar" />
                              <Link to="#">
                                <i
                                  className="feather icon-x x-square-add remove-product"
                                  onClick={handleRemoveAvatar}
                                />
                              </Link>
                            </div>
                          )}
                        </div>
                        <span className="fs-13 fw-medium mt-2">
                          Định dạng file: JPG, PNG. Kích thước tối đa 2MB.
                        </span>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Họ và tên <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.fullName}
                              onChange={handleInputChange("fullName")}
                              required
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.phone}
                              onChange={handleInputChange("phone")}
                              placeholder="Nhập số điện thoại"
                              disabled={saving}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Email{" "}
                              {canEditEmail && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            {canEditEmail ? (
                              <>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={formData.email || ""}
                                  onChange={handleInputChange("email")}
                                  placeholder="Nhập email"
                                  disabled={saving}
                                />
                                <small className="text-muted">
                                  Email dùng để lấy lại mật khẩu
                                </small>
                              </>
                            ) : (
                              <>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={formData.email || ""}
                                  readOnly
                                  disabled
                                  style={{
                                    backgroundColor: "#f5f5f5",
                                    cursor: "not-allowed",
                                  }}
                                />
                                <small className="text-muted">
                                  Email chỉ có thể thay đổi ở phần Email
                                </small>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-end settings-bottom-btn mt-0">
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          disabled={saving}
                        >
                          Huỷ
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </form>
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

export default Profile;
