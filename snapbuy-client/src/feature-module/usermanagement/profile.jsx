import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/layouts/footer";
import { user49 } from "../../utils/imagepath";
import { getAccount, updateAccount } from "../../services/accountService";

const Profile = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [avatar, setAvatar] = useState(user49);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    const userId = 1;
    getAccount(userId)
      .then((res) => {
        const data = res.data;
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          username: data.username || "",
          password: data.password || "",
        });
        if (data.image) setAvatar(data.image);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const userId = 1; // tạm thời fix cứng
    updateAccount(userId, { ...user, image: avatar })
      .then(() => alert("Profile updated successfully!"))
      .catch(() => alert("Failed to update profile!"));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>User Profile</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4>Profile</h4>
          </div>

          <div className="card-body profile-body">
            <h5 className="mb-2">
              <i className="ti ti-user text-primary me-1" />
              Basic Information
            </h5>

            <div className="profile-pic-upload image-field profile-pic-upload-new">
              <div className="profile-pic p-2">
                <img
                  src={avatar}
                  className="object-fit-cover h-100 rounded-1"
                  alt="user"
                />
                <button
                  type="button"
                  className="close rounded-1"
                  onClick={() => setAvatar(user49)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="mb-3">
                <div className="image-upload mb-0 d-inline-flex">
                  <input type="file" onChange={handleImageChange} />
                  <div className="btn btn-primary fs-13">Change Image</div>
                </div>
                <p className="mt-2">
                  Upload an image below 2 MB, Accepted File format JPG, PNG
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={user.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={user.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={user.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={user.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">User Name</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={user.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      className="pass-input form-control"
                      value={user.password}
                      onChange={handleChange}
                    />
                    <span
                      className={`ti toggle-password text-gray-9 ${
                        isPasswordVisible ? "ti-eye" : "ti-eye-off"
                      }`}
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-end">
                <Link to="#" className="btn btn-secondary me-2 shadow-none">
                  Cancel
                </Link>
                <Link
                  to="#"
                  onClick={handleSave}
                  className="btn btn-primary shadow-none"
                >
                  Save Changes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default Profile;
