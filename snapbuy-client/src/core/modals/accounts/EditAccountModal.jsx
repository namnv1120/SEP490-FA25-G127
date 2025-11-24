import { useState, useEffect, useCallback } from "react";
import { Modal, message, Spin } from "antd";
import { Dropdown } from "primereact/dropdown";
import {
  getAccountById,
  updateAccount,
} from "../../../services/AccountService";
import { getAllRoles } from "../../../services/RoleService";

const EditAccount = ({
  isOpen,
  accountId,
  onSuccess,
  onUpdated,
  onClose,
  allowedRoles,
  onUpdate,
  onUpdateRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRoleValue, setSelectedRoleValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });

  const [errors, setErrors] = useState({});

  const loadRoles = useCallback(async () => {
    try {
      const rolesData = await getAllRoles();
      let filtered = rolesData.filter(
        (role) => role.active === true || role.active === 1
      );
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        filtered = filtered.filter((role) =>
          allowedRoles.includes(role.roleName)
        );
      }
      const roleOptions = filtered.map((role) => ({
        value: role.roleName,
        label: role.roleName,
      }));
      setRoles(roleOptions);
    } catch (error) {
      console.error("Lỗi khi tải danh sách vai trò:", error);
    }
  }, [allowedRoles]);

  const loadAccountData = useCallback(async () => {
    try {
      setLoading(true);
      const account = await getAccountById(accountId);
      const accountData = account.result || account;

      // Lấy role đầu tiên nếu có (roles là mảng string roleName)
      const accountRoles = accountData.roles || [];
      const firstRoleName = accountRoles.length > 0 ? accountRoles[0] : null;

      setFormData({
        fullName: accountData.fullName || "",
        email: accountData.email || "",
        phone: accountData.phone || "",
        password: "",
        confirmPassword: "",
        roles: firstRoleName ? [firstRoleName] : [],
      });

      // Set selectedRole value (string) để Dropdown có thể hiển thị
      if (firstRoleName) {
        setSelectedRoleValue(firstRoleName);
      }
    } catch (error) {
      console.error("Không thể tải dữ liệu tài khoản", error);
      message.error("Không thể tải dữ liệu tài khoản");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  }, [accountId, onClose]);

  // Load roles và account data khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen, loadRoles]);

  // Load account data khi modal mở
  useEffect(() => {
    if (isOpen && accountId) {
      loadAccountData();
    }
  }, [isOpen, accountId, loadAccountData]);

  // Map selectedRole sau khi formData.roles đã được set
  useEffect(() => {
    if (
      isOpen &&
      formData.roles &&
      formData.roles.length > 0 &&
      roles.length > 0
    ) {
      const roleName = formData.roles[0];
      const foundRole = roles.find(
        (r) => r.value === roleName || r.label === roleName
      );
      if (foundRole) {
        // Chỉ set nếu chưa được set hoặc đang khác với role hiện tại
        if (!selectedRoleValue || selectedRoleValue !== roleName) {
          setSelectedRoleValue(roleName);
        }
      } else {
        // Vẫn set value để hiển thị
        if (!selectedRoleValue || selectedRoleValue !== roleName) {
          setSelectedRoleValue(roleName);
        }
      }
    }
  }, [isOpen, formData.roles, roles, selectedRoleValue]);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        roles: [],
      });
      setErrors({});
      setSelectedRoleValue(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Hàm kiểm tra hợp lệ dữ liệu dựa trên backend validation
  const validateForm = () => {
    const newErrors = {};

    const name = (formData.fullName || "").trim();
    if (!name) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (name.length < 2 || name.length > 100) {
      newErrors.fullName = "Họ và tên phải từ 2 đến 100 ký tự.";
    } else if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name)) {
      newErrors.fullName = "Họ và tên chỉ gồm chữ, khoảng trắng, ', -, .";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ. Vui lòng kiểm tra lại.";
    }

    if (formData.phone && !/^$|^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải gồm đúng 10 chữ số.";
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      }
    }

    if (formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
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
    // selected có thể là object hoặc string
    const roleName =
      typeof selected === "string"
        ? selected
        : selected?.value || selected?.label || selected;
    setSelectedRoleValue(roleName);
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

      const updateData = {};

      if (formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim();
      }
      if (formData.email.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.password) {
        updateData.password = formData.password;
      }
      const hasRoles = formData.roles && formData.roles.length > 0;
      if (onUpdateRole && onUpdate) {
        await onUpdate(accountId, updateData);
        if (hasRoles) {
          await onUpdateRole(accountId, formData.roles);
        }
      } else if (onUpdate) {
        if (hasRoles) updateData.roles = formData.roles;
        await onUpdate(accountId, updateData);
      } else {
        if (hasRoles) updateData.roles = formData.roles;
        await updateAccount(accountId, updateData);
      }
      message.success("Cập nhật tài khoản thành công!");

      if (onUpdated) onUpdated();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật tài khoản. Vui lòng thử lại.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!accountId) return null;

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
          <h4 className="mb-0">Sửa tài khoản</h4>
        </div>
      }
    >
      {loading && !formData.fullName ? (
        <div className="d-flex justify-content-center p-4">
          <Spin size="large" />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
        >
          {/* Họ và tên */}
          <div className="mb-3">
            <label className="form-label">Họ và tên</label>
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

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              disabled={loading}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại (10 chữ số)"
              disabled={loading}
              maxLength={10}
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>

          {/* Vai trò */}
          <div className="mb-3">
            <label className="form-label">Vai trò</label>
            <Dropdown
              value={selectedRoleValue}
              options={roles}
              onChange={handleRoleChange}
              placeholder="Chọn vai trò"
              className={`w-100 ${errors.roles ? "is-invalid" : ""}`}
              disabled={loading}
              filter
              appendTo={document.body}
              panelStyle={{ zIndex: 9999 }}
              optionLabel="label"
              optionValue="value"
            />
            {errors.roles && (
              <div className="invalid-feedback d-block">{errors.roles}</div>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="mb-3">
            <label className="form-label">
              Mật khẩu mới (để trống nếu không đổi)
            </label>
            <div className="pass-group position-relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                disabled={loading}
              />
              <span
                className={`ti toggle-password position-absolute end-0 top-50 translate-middle-y me-2 ${
                  showPassword ? "ti-eye" : "ti-eye-off"
                }`}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              />
            </div>
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          {formData.password && (
            <div className="mb-3">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div className="pass-group position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={loading}
                />
                <span
                  className={`ti toggle-password position-absolute end-0 top-50 translate-middle-y me-2 ${
                    showConfirmPassword ? "ti-eye" : "ti-eye-off"
                  }`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: "pointer" }}
                />
              </div>
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>
          )}

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
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditAccount;
