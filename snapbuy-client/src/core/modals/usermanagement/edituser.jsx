import { useState } from "react";
import { Link } from "react-router-dom";
import CommonSelect from "../../../components/select/common-select";
import { editUser } from "../../../utils/imagepath";

const EditUser = () => {
  const statusOptions = [
    { value: "Choose", label: "Choose" },
    { value: "Manager", label: "Manager" },
    { value: "Admin", label: "Admin" },
  ];

  // State
  const [avatar, setAvatar] = useState(editUser);
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0].value);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handlers
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <div>
      {/* Edit User */}
      <div className="modal fade" id="edit-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                {/* Modal Header */}
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Edit User</h4>
                  </div>
                  <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body custom-modal-body">
                  <form>
                    <div className="row">
                      {/* Avatar */}
                      <div className="col-lg-12">
                        <div className="new-employee-field">
                          <span>Avatar</span>
                          <div className="profile-pic-upload edit-pic">
                            <div className="profile-pic">
                              <span>
                                <img src={avatar} className="user-editer" alt="User" />
                              </span>
                              <div className="close-img">
                                <i className="feather icon-x info-img" />
                              </div>
                            </div>
                            <div className="input-blocks mb-0">
                              <div className="image-upload mb-0">
                                <input type="file" onChange={handleChangeAvatar} />
                                <div className="image-uploads">
                                  <h4>Change Image</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User Name */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>User Name</label>
                          <input type="text" placeholder="Thomas" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Phone</label>
                          <input type="text" placeholder="+12163547758" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Email</label>
                          <input type="email" placeholder="thomas@example.com" />
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
                            onChange={(e) => setSelectedStatus(e.value)}
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
                            />
                            <span
                              className={`ti toggle-password text-gray-9 ${showPassword ? "ti-eye" : "ti-eye-off"}`}
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
                            />
                            <span
                              className={`ti toggle-password ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`}
                              onClick={handleToggleConfirmPassword}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="col-lg-12">
                        <div className="mb-0 input-blocks">
                          <label className="form-label">Descriptions</label>
                          <textarea className="form-control mb-1" defaultValue="" />
                          <p>Maximum 600 Characters</p>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer-btn">
                      <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">
                        Cancel
                      </button>
                      <Link to="#" className="btn btn-submit">
                        Submit
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit User */}
    </div>
  );
};

export default EditUser;