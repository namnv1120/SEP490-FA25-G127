import React, { useState } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../components/select/common-select";
import { createAccount } from "../../../services/accountService";

const AddAccount = ({ onUserAdded }) => {
  const status = [
    { value: "Choose", label: "Choose" },
    { value: "Manager", label: "Manager" },
    { value: "Admin", label: "Admin" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    description: "",
    avatar: null,
  });

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const tokenType = localStorage.getItem("authTokenType") || "Bearer";
      if (!token) {
        alert("Unauthorized: No token found");
        return;
      }

      const form = new FormData();
      form.append("username", formData.username);
      form.append("phone", formData.phone);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("role", formData.role);
      form.append("description", formData.description);
      if (formData.avatar) {
        form.append("file", formData.avatar);
      }

      await createAccount(form, {
        headers: {
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (onUserAdded) onUserAdded();

      setFormData({
        username: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        description: "",
        avatar: null,
      });
      setSelectedStatus(null);
      setPreview(null);

      const modalElement = document.getElementById("add-account");
      if (modalElement) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }

      alert("Account created successfully!");
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account!");
    }
  };

  return (
    <div>
      <div className="modal fade" id="add-account">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Add Account</h4>
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
                          <div className="profile-pic-upload mb-2">
                            <div className="profile-pic">
                              {preview ? (
                                <img
                                  src={preview}
                                  alt="preview"
                                  style={{ width: "80px", borderRadius: "8px" }}
                                />
                              ) : (
                                <span>
                                  <i className="feather icon-plus-circle plus-down-add" />
                                  Profile Photo
                                </span>
                              )}
                            </div>
                            <div className="input-blocks mb-0">
                              <div className="image-upload mb-0">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setFormData({ ...formData, avatar: file });
                                    setPreview(file ? URL.createObjectURL(file) : null);
                                  }}
                                />
                                <div className="image-uploads">
                                  <h4>Change Image</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Username */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>User Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) =>
                              setFormData({ ...formData, username: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Phone</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
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
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Role</label>
                          <CommonSelect
                            className="w-100"
                            options={status}
                            value={selectedStatus}
                            onChange={(e) => {
                              setSelectedStatus(e.value);
                              setFormData((prev) => ({ ...prev, role: e.value }));
                            }}
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
                              className="pass-input"
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                            />
                            <span
                              className={`ti toggle-password text-gray-9 ${
                                showPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                              onClick={handleTogglePassword}
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
                              className="pass-input"
                              placeholder="Enter your password"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmPassword: e.target.value,
                                })
                              }
                            />
                            <span
                              className={`ti toggle-password ${
                                showConfirmPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                              onClick={handleToggleConfirmPassword}
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
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                          />
                          <p>Maximum 600 Characters</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
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

export default AddAccount;