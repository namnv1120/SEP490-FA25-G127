import { useEffect, useState } from "react";
import CommonSelect from "../../../components/select/common-select";
import { getAccount, updateAccount } from "../../../services/accountService";

const EditAccount = ({ accountId, onClose, onUpdated }) => {
  const statusOptions = [
    { value: "Choose", label: "Choose" },
    { value: "Manager", label: "Manager" },
    { value: "Admin", label: "Admin" },
  ];

  const [avatar, setAvatar] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accountData, setAccountData] = useState({
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
  });

  useEffect(() => {
    if (accountId) {
      getAccount(accountId)
        .then((account) => {
          const data = account.result || account;

          setAccountData({
            phone: data.phone || "",
            email: data.email || "",
            password: "********",
            confirmPassword: "",
            description: data.description || "",
          });

          // Lấy role hiện tại từ dữ liệu và tìm option tương ứng
          const currentRoleOption = statusOptions.find(
            (opt) => opt.value === data.role
          );
          // Nếu không tìm thấy thì mặc định chọn "Choose"
          setSelectedStatus(currentRoleOption || statusOptions[0]);

          if (data.avatarUrl) setAvatar(data.avatarUrl);
        })
        .catch((err) => console.error("Error fetching account data:", err));
    }
  }, [accountId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      accountData.password !== "********" &&
      accountData.password !== accountData.confirmPassword
    ) {
      alert("Passwords do not match!");
      return;
    }

    const updatedData = {
      phone: accountData.phone,
      email: accountData.email,
      role: selectedStatus.value,
      password:
        accountData.password === "********" ? undefined : accountData.password,
      description: accountData.description,
      avatarUrl: avatar,
    };

    try {
      await updateAccount(accountId, updatedData);
      alert("Account updated successfully!");
      if (onUpdated) onUpdated();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error updating account:", error);
      alert("Failed to update account. Please try again!");
    }
  };

  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="modal fade" id="edit-account">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Edit Account</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Avatar */}
                      <div className="col-lg-12">
                        <div className="new-employee-field">
                          <span>Avatar</span>
                          <div className="profile-pic-upload edit-pic">
                            <div className="profile-pic">
                              <span>
                                <img
                                  src={avatar}
                                  className="user-editer"
                                  alt="User"
                                />
                              </span>
                              <div className="close-img">
                                <i className="feather icon-x info-img" />
                              </div>
                            </div>
                            <div className="input-blocks mb-0">
                              <div className="image-upload mb-0">
                                <input
                                  type="file"
                                  onChange={handleChangeAvatar}
                                />
                                <div className="image-uploads">
                                  <h4>Change Image</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Phone</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={accountData.phone}
                            onChange={handleChange}
                            placeholder="+12163547758"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={accountData.email}
                            onChange={handleChange}
                            placeholder="example@example.com"
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Role</label>
                          <CommonSelect
                            className="w-100"
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e)}
                            placeholder="Choose"
                            filter={false}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Password</label>
                          <div className="pass-group">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control pass-input"
                              name="password"
                              value={accountData.password}
                              onChange={handleChange}
                              placeholder="Enter new password"
                            />
                            <span
                              className={`ti toggle-password text-gray-9 ${
                                showPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Confirm Password</label>
                          <div className="pass-group">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="form-control pass-input"
                              name="confirmPassword"
                              value={accountData.confirmPassword}
                              onChange={handleChange}
                              placeholder="Re-enter your password"
                            />
                            <span
                              className={`ti toggle-password ${
                                showConfirmPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="col-lg-12">
                        <div className="mb-0 input-blocks">
                          <label className="form-label">Descriptions</label>
                          <textarea
                            className="form-control mb-1"
                            name="description"
                            value={accountData.description}
                            onChange={handleChange}
                          />
                          <p>Maximum 600 Characters</p>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;
