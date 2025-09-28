import { useState } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import { user49 } from "../../utils/imagepath";

const Profile = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [avatar, setAvatar] = useState(user49);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
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
                  <label className="form-label">
                    First Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" defaultValue="Jeffry" />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">
                    Last Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" defaultValue="Jordan" />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label>
                    Email<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="email" className="form-control" defaultValue="jeffry@example.com" />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">
                    Phone Number<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" defaultValue="+17468314286" className="form-control" />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">
                    User Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input type="text" className="form-control" defaultValue="Jeffry Jordan" />
                </div>
              </div>

              <div className="col-lg-6 col-sm-12">
                <div className="mb-3">
                  <label className="form-label">
                    Password<span className="text-danger ms-1">*</span>
                  </label>
                  <div className="pass-group">
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      className="pass-input form-control"
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
                <Link to="#" className="btn btn-primary shadow-none">
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