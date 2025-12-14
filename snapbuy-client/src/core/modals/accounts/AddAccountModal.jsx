import { useState, useEffect } from "react";
import { Modal, message, Spin } from "antd";
import { Dropdown } from "primereact/dropdown";
import { createAccount } from "../../../services/AccountService";

const AddAccount = ({
  isOpen,
  onClose,
  onSuccess,
  availableRoles,
  onCreate,
}) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);

  // Load roles khi modal mở
  useEffect(() => {
    if (isOpen && availableRoles) {
      const roleOptions = availableRoles.map((role) => ({
        value: role.roleName,
        label: role.roleName,
      }));
      setRoles(roleOptions);
    }
  }, [isOpen, availableRoles]);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        roles: [],
      });
      setErrors({});
      setSelectedRole(null);
    }
  }, [isOpen]);

  // Hàm kiểm tra hợp lệ dữ liệu dựa trên backend validation
  const validateForm = () => {
    const newErrors = {};

    // Họ và tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = "Họ và tên không được vượt quá 100 ký tự.";
    }

    // Tên đăng nhập
    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Tên đăng nhập phải từ 3 đến 50 ký tự.";
    } else if (!/^[A-Za-z0-9._-]+$/.test(formData.username)) {
      newErrors.username =
        "Tên đăng nhập chỉ được gồm chữ, số, dấu chấm (.), gạch dưới (_) hoặc gạch ngang (-), không có khoảng trắng.";
    }

    // Mật khẩu
    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    // Xác nhận mật khẩu
    if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    // Vai trò
    if (!selectedRole) {
      newErrors.roles = "Vui lòng chọn một vai trò.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleChange = (e) => {
    const selected = e.value;
    setSelectedRole(selected);
    // Lấy role name từ selected object (có thể là {value, label} hoặc string)
    const roleName = selected?.value || selected?.label || selected;
    setFormData((prev) => ({
      ...prev,
      roles: roleName ? [roleName] : [],
    }));
    setErrors((prev) => ({ ...prev, roles: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      // Đảm bảo roles là array và không có giá trị null/undefined
      const rolesArray =
        formData.roles && formData.roles.length > 0
          ? formData.roles.filter((r) => r != null && r !== "")
          : [];

      const newAccount = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        roles: rolesArray,
        active: true,
      };

      if (typeof onCreate === "function") {
        await onCreate(newAccount);
      } else {
        await createAccount(newAccount);
      }
      message.success("Thêm tài khoản thành công!");

      // Reset form
      setFormData({
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        roles: [],
      });
      setErrors({});
      setSelectedRole(null);

      // Đóng modal
      if (onClose) onClose();

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể thêm tài khoản.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      footer={null}
      width={700}
      closable={true}
      title={
        <div>
          <h4 className="mb-0">Thêm tài khoản</h4>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Họ và tên */}
        <div className="mb-3">
          <label className="form-label">
            Họ và tên<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            disabled={loading}
          />
          {errors.fullName && (
            <div className="invalid-feedback">{errors.fullName}</div>
          )}
        </div>

        {/* Tên đăng nhập */}
        <div className="mb-3">
          <label className="form-label">
            Tên đăng nhập<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="username"
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Nhập tên đăng nhập (3-50 ký tự, chỉ chữ, số, ., _, -)"
            disabled={loading}
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>

        {/* Vai trò */}
        <div className="mb-3">
          <label className="form-label">
            Vai trò<span className="text-danger">*</span>
          </label>
          <Dropdown
            value={selectedRole}
            options={roles}
            onChange={handleRoleChange}
            placeholder="Chọn vai trò"
            className={`w-100 ${errors.roles ? "is-invalid" : ""}`}
            disabled={loading}
            filter
            appendTo={document.body}
            panelStyle={{ zIndex: 9999 }}
          />
          {errors.roles && (
            <div className="invalid-feedback d-block">{errors.roles}</div>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="mb-3">
          <label className="form-label">
            Mật khẩu<span className="text-danger">*</span>
          </label>
          <div className="pass-group position-relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              disabled={loading}
              style={{
                paddingRight: errors.password ? "3rem" : "2.5rem",
              }}
            />
            <span
              className={`ti toggle-password position-absolute top-50 translate-middle-y ${
                showPassword ? "ti-eye" : "ti-eye-off"
              }`}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                cursor: "pointer",
                right: errors.password ? "2rem" : "0.75rem",
                zIndex: 10,
              }}
            />
          </div>
          {errors.password && (
            <div className="invalid-feedback d-block">{errors.password}</div>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="mb-3">
          <label className="form-label">
            Xác nhận mật khẩu<span className="text-danger">*</span>
          </label>
          <div className="pass-group position-relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={`form-control ${
                errors.confirmPassword ? "is-invalid" : ""
              }`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
              style={{
                paddingRight: errors.confirmPassword ? "3rem" : "2.5rem",
              }}
            />
            <span
              className={`ti toggle-password position-absolute top-50 translate-middle-y ${
                showConfirmPassword ? "ti-eye" : "ti-eye-off"
              }`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                cursor: "pointer",
                right: errors.confirmPassword ? "2rem" : "0.75rem",
                zIndex: 10,
              }}
            />
          </div>
          {errors.confirmPassword && (
            <div className="invalid-feedback d-block">
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="modal-footer-btn mt-4 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-cancel me-2"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Thêm tài khoản"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAccount;
export { AddAccount };
