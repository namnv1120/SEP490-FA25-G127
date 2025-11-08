import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import CommonSelect from "../../components/select/common-select";
import { message } from "antd";
import { getMyInfo } from "../../services/AccountService";

const DEFAULT_COUNTRY_OPTIONS = [
  { label: "USA", value: "USA" },
  { label: "India", value: "India" },
  { label: "France", value: "France" },
  { label: "Australia", value: "Australia" },
];

const DEFAULT_STATE_OPTIONS = [
  { label: "Alaska", value: "Alaska" },
  { label: "Mexico", value: "Mexico" },
  { label: "Tasmania", value: "Tasmania" },
];

const DEFAULT_CITY_OPTIONS = [
  { label: "Anchorage", value: "Anchorage" },
  { label: "Tijuana", value: "Tijuana" },
  { label: "Hobart", value: "Hobart" },
];

const pickFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "") ?? "";

const toDropdownOption = (value) => (value ? { label: value, value } : null);

const ensureOptionExists = (option, setOptions) => {
  if (!option) {
    return;
  }
  setOptions((prev) => {
    if (prev.some((item) => item.value === option.value)) {
      return prev;
    }
    return [...prev, option];
  });
};

const deriveNameParts = (user) => {
  const firstName = pickFirstDefined(user?.firstName, user?.givenName);
  const lastName = pickFirstDefined(user?.lastName, user?.familyName);

  if (!firstName && !lastName && user?.fullName) {
    const parts = user.fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts.slice(-1).join(" "),
    };
  }

  return {
    firstName: firstName || "",
    lastName: lastName || "",
  };
};

const Profile = () => {
  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    address: "",
    country: null,
    state: null,
    city: null,
    postalCode: "",
  });
  const [countryOptions, setCountryOptions] = useState(DEFAULT_COUNTRY_OPTIONS);
  const [stateOptions, setStateOptions] = useState(DEFAULT_STATE_OPTIONS);
  const [cityOptions, setCityOptions] = useState(DEFAULT_CITY_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (field) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createSelectHandler = (field, setOptions) => (option) => {
    if (option) {
      setOptions((prev) => {
        if (prev.some((item) => item.value === option.value)) {
          return prev;
        }
        return [...prev, option];
      });
    }
    setFormData((prev) => ({
      ...prev,
      [field]: option,
    }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getMyInfo();
        const user = response?.result || response || {};
        const { firstName, lastName } = deriveNameParts(user);

        const countryOption = toDropdownOption(
          pickFirstDefined(user?.country, user?.countryName)
        );
        const stateOption = toDropdownOption(
          pickFirstDefined(user?.state, user?.stateName, user?.province)
        );
        const cityOption = toDropdownOption(
          pickFirstDefined(user?.city, user?.cityName)
        );

        ensureOptionExists(countryOption, setCountryOptions);
        ensureOptionExists(stateOption, setStateOptions);
        ensureOptionExists(cityOption, setCityOptions);

        setFormData({
          id: user?.id ?? user?.accountId ?? null,
          firstName,
          lastName,
          username: pickFirstDefined(user?.username, user?.userName),
          phone: pickFirstDefined(user?.phone, user?.phoneNumber, user?.contactNumber),
          email: pickFirstDefined(user?.email, user?.emailAddress),
          address: pickFirstDefined(
            user?.address,
            user?.addressLine,
            user?.street,
            user?.streetAddress
          ),
          country: countryOption,
          state: stateOption,
          city: cityOption,
          postalCode: pickFirstDefined(user?.postalCode, user?.zipCode, user?.zip),
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error);
        message.error(
          error?.message || "Không thể tải thông tin tài khoản. Vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <div className="page-wrapper">
        <div className="content settings-content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Settings</h4>
                <h6>Manage your settings on portal</h6>
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
                    <h4 className="fs-18 fw-bold">Profile</h4>
                  </div>
                  <div className="card-body">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <form>
                        <div className="card-title-head">
                          <h6 className="fs-16 fw-bold mb-1">
                            <span className="fs-16 me-2">
                              <i className="ti ti-user" />
                            </span>
                            Basic Information
                          </h6>
                          {formData.id && (
                            <p className="text-muted mb-3">Account ID: {formData.id}</p>
                          )}
                        </div>
                        <div className="profile-pic-upload">
                          <div className="profile-pic">
                            <span>
                              <i className="ti ti-circle-plus mb-1 fs-16" /> Add Image
                            </span>
                          </div>
                          <div className="new-employee-field">
                            <div className="mb-0">
                              <div className="image-upload mb-0">
                                <input type="file" />
                                <div className="image-uploads">
                                  <h4>Upload Image</h4>
                                </div>
                              </div>
                              <span className="fs-13 fw-medium mt-2">
                                Upload an image below 2 MB, Accepted File format JPG, PNG
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">
                                First Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.firstName}
                                onChange={handleInputChange("firstName")}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">
                                Last Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.lastName}
                                onChange={handleInputChange("lastName")}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">
                                User Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.username}
                                onChange={handleInputChange("username")}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">
                                Phone Number <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleInputChange("phone")}
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label">
                                Email <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleInputChange("email")}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="card-title-head">
                          <h6 className="fs-16 fw-bold mb-3">
                            <span className="fs-16 me-2">
                              <i className="ti ti-map-pin" />
                            </span>
                            Address Information
                          </h6>
                        </div>

                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Address <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.address}
                                onChange={handleInputChange("address")}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Country <span className="text-danger">*</span>
                              </label>
                              <CommonSelect
                                options={countryOptions}
                                value={formData.country}
                                onChange={createSelectHandler("country", setCountryOptions)}
                                placeholder="Choose"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                State <span className="text-danger">*</span>
                              </label>
                              <CommonSelect
                                options={stateOptions}
                                value={formData.state}
                                onChange={createSelectHandler("state", setStateOptions)}
                                placeholder="Choose"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                City <span className="text-danger">*</span>
                              </label>
                              <CommonSelect
                                options={cityOptions}
                                value={formData.city}
                                onChange={createSelectHandler("city", setCityOptions)}
                                placeholder="Choose"
                                filter={false}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Postal Code <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={formData.postalCode}
                                onChange={handleInputChange("postalCode")}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-end settings-bottom-btn mt-0">
                          <button type="button" className="btn btn-secondary me-2">
                            Cancel
                          </button>
                          <Link to="#" className="btn btn-primary">
                            Save Changes
                          </Link>
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

export default Profile;
