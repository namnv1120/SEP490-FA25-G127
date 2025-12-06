import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { Settings, User } from "react-feather";
import { allRoutes } from "../../routes/AllRoutes";
import { getMyInfo } from "../../services/AccountService";
import { getImageUrl } from "../../utils/imageUtils";
import { avator1 } from "../../utils/imagepath";
import { getCurrentShift } from "../../services/ShiftService";

// Import images
import logoPng from "../../assets/img/logo.png";
import logoWhitePng from "../../assets/img/logo-white.png";
import logoSmallPng from "../../assets/img/logo-small.png";
import clockIcon from "../../assets/img/icons/clock-icon.svg";
import logOutIcon from "../../assets/img/icons/log-out.svg";

const PosHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftTimeText, setShiftTimeText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    fullName: "User Name",
    role: "Role",
    avatarUrl: null,
  });
  const homeRoute =
    userInfo.role === "Nhân viên bán hàng"
      ? allRoutes.saledashboard
      : userInfo.role === "Chủ cửa hàng"
      ? allRoutes.shopownerdashboard
      : userInfo.role === "Quản trị viên"
      ? allRoutes.admindashboard
      : userInfo.role === "Nhân viên kho"
      ? allRoutes.warehousedashboard
      : allRoutes.shopownerdashboard;

  const isStaff = userInfo.role === "Nhân viên bán hàng";

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadShift = async () => {
      const data = await getCurrentShift();
      setCurrentShift(data);
    };
    loadShift();
    const onShiftUpdated = (e) => {
      const data = e.detail;
      setCurrentShift(data);
    };
    window.addEventListener("shiftUpdated", onShiftUpdated);
    return () => {
      window.removeEventListener("shiftUpdated", onShiftUpdated);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (currentShift && currentShift.status === "Mở" && currentShift.openedAt) {
      const update = () => {
        const start = new Date(currentShift.openedAt).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);
        const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setShiftTimeText(`${h}:${m}:${s}`);
      };
      update();
      interval = setInterval(update, 1000);
    } else {
      setShiftTimeText("");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentShift]);

  // Format time as 24h
  const formatTime24h = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTokenType");
    localStorage.removeItem("role");
    localStorage.removeItem("roleName");
    localStorage.removeItem("fullName");
    localStorage.removeItem("accountId");
    localStorage.removeItem("username");
    setDropdownVisible(false);
    navigate(allRoutes.login);
  };

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getMyInfo();
        const userData = data.result || data;

        // Roles là List<String>, lấy role đầu tiên và bỏ prefix ROLE_ nếu có
        let roleName = "Role";
        if (
          userData.roles &&
          Array.isArray(userData.roles) &&
          userData.roles.length > 0
        ) {
          roleName = userData.roles[0].replace("ROLE_", "");
        }

        const avatarUrl = userData.avatarUrl
          ? getImageUrl(userData.avatarUrl)
          : null;

        setUserInfo({
          fullName: userData.fullName || "User Name",
          role: roleName,
          avatarUrl: avatarUrl,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUserInfo();

    const handleProfileUpdate = (event) => {
      const userData = event.detail;
      let roleName = "Role";
      if (
        userData.roles &&
        Array.isArray(userData.roles) &&
        userData.roles.length > 0
      ) {
        roleName = userData.roles[0].replace("ROLE_", "");
      }

      const avatarUrl = userData.avatarUrl
        ? getImageUrl(userData.avatarUrl)
        : null;

      setUserInfo({
        fullName: userData.fullName || "User Name",
        role: roleName,
        avatarUrl: avatarUrl,
      });
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector(".profile-nav");
      if (dropdown && !dropdown.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <>
      {/* Header */}
      <div className="header pos-header">
        {/* Logo */}
        <div className="header-left active">
          <Link to={homeRoute} className="logo logo-normal">
            <img src={logoPng} alt="Img" />
          </Link>
          <Link to={homeRoute} className="logo logo-white">
            <img src={logoWhitePng} alt="Img" />
          </Link>
          <Link to={homeRoute} className="logo-small">
            <img src={logoSmallPng} alt="Img" />
          </Link>
        </div>
        {/* Header Menu */}
        <ul className="nav user-menu">
          {/* Search */}
          <li className="nav-item time-nav">
            <span className="bg-teal text-white d-inline-flex align-items-center">
              <img src={clockIcon} alt="img" className="me-2" />
              {formatTime24h(currentTime)}
            </span>
          </li>
          {shiftTimeText && (
            <li className="nav-item time-nav">
              <span className="bg-purple text-white d-inline-flex align-items-center">
                <i className="ti ti-clock me-2" />
                Ca: {shiftTimeText}
              </span>
            </li>
          )}
          {/* /Search */}
          <li className="nav-item pos-nav">
            <Link
              to={homeRoute}
              className="btn btn-purple btn-md d-inline-flex align-items-center"
            >
              <i className="ti ti-world me-1" />
              Dashboard
            </Link>
          </li>
          {/* Only show "Đóng ca" button for staff when shift is open */}
          {isStaff && currentShift && currentShift.status === "Mở" && (
            <li className="nav-item pos-nav">
              <Link
                to="#"
                className="btn btn-danger btn-md d-inline-flex align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  // Open close shift modal
                  window.dispatchEvent(new CustomEvent("openCloseShiftModal"));
                }}
              >
                <i className="ti ti-x me-1" />
                Đóng ca
              </Link>
            </li>
          )}

          {/* <li className="nav-item nav-item-box">
            <Link
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#calculator"
              className="bg-orange border-orange text-white"
            >
              <i className="ti ti-calculator" />
            </Link>
          </li>
          <li className="nav-item nav-item-box">
            <Tooltip title="Maximize" placement="right">
              <Link
                to="#"
                id="btnFullscreen"
                className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
              >
                <i className="ti ti-maximize" />
              </Link>
            </Tooltip>
          </li>
          <li
            className="nav-item nav-item-box"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Cash Register"
          >
            <Tooltip title="Cash Register" placement="right">
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#cash-register"
              >
                <i className="ti ti-cash" />
              </Link>
            </Tooltip>
          </li>
          <li
            className="nav-item nav-item-box"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Print Last Reciept"
          >
            <Tooltip title="Print Last Reciept" placement="right">
              <Link to="#">
                <i className="ti ti-printer" />
              </Link>
            </Tooltip>
          </li>
          <li
            className="nav-item nav-item-box"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Today's Sale"
          >
            <Tooltip title="Today's Sale" placement="right">
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#today-sale"
              >
                <i className="ti ti-progress" />
              </Link>
            </Tooltip>
          </li>
          <li
            className="nav-item nav-item-box"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Today's Profit"
          >
            <Tooltip title="Today's Profit" placement="right">
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#today-profit"
              >
                <i className="ti ti-chart-infographic" />
              </Link>
            </Tooltip>
          </li>
          <li
            className="nav-item nav-item-box"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="POS Settings"
          >
            <Tooltip title="POS Settings" placement="bottom">
              <Link to={allRoutes.possettings}>
                <i className="ti ti-settings" />
              </Link>
            </Tooltip>
          </li> */}
          <li
            className="nav-item dropdown has-arrow main-drop profile-nav"
            style={{ position: "relative", marginBottom: 0, paddingBottom: 0 }}
          >
            <Link
              to="#"
              className="nav-link userset"
              onClick={(e) => {
                e.preventDefault();
                setDropdownVisible(!dropdownVisible);
              }}
            >
              <span className="user-info p-0">
                <span className="user-letter">
                  <img
                    src={userInfo.avatarUrl || avator1}
                    alt="Img"
                    className="img-fluid"
                    onError={(e) => {
                      e.target.src = avator1;
                    }}
                  />
                </span>
              </span>
            </Link>
            {dropdownVisible && (
              <div
                className="dropdown-menu menu-drop-user show pos-user-dropdown"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  left: "auto",
                  margin: "0 !important",
                  marginTop: "0 !important",
                  marginBottom: "0 !important",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  zIndex: 1050,
                  minWidth: "240px",
                  display: "block",
                  transform: "translate(0, 0) !important",
                  transition: "none !important",
                }}
              >
                <div className="profilename">
                  <div className="profileset">
                    <span className="user-img">
                      <img
                        src={userInfo.avatarUrl || avator1}
                        alt="Img"
                        onError={(e) => {
                          e.target.src = avator1;
                        }}
                      />
                      <span className="status online" />
                    </span>
                    <div
                      className="profilesets"
                      style={{ minWidth: 0, flex: 1 }}
                    >
                      <h6
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                        }}
                      >
                        {userInfo.fullName}
                      </h6>
                      <h5
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                        }}
                      >
                        {userInfo.role}
                      </h5>
                    </div>
                  </div>
                  <hr className="m-0" />
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to={allRoutes.profile}
                    onClick={() => setDropdownVisible(false)}
                  >
                    <User className="me-2" size={16} />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to={allRoutes.possystemsettings}
                    onClick={() => setDropdownVisible(false)}
                  >
                    <Settings className="me-2" size={16} />
                    Cài đặt
                  </Link>
                  <hr className="m-0" />
                  <Link
                    className="dropdown-item logout pb-0 d-flex align-items-center"
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    <img
                      src={logOutIcon}
                      className="me-2"
                      alt="img"
                      style={{ width: "16px", height: "16px" }}
                    />
                    Đăng xuất
                  </Link>
                </div>
              </div>
            )}
          </li>
        </ul>
        {/* /Header Menu */}
        {/* Mobile Menu */}
        <div className="dropdown mobile-user-menu">
          <Link
            to="#"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-ellipsis-v" />
          </Link>
          <div className="dropdown-menu dropdown-menu-right">
            <Link className="dropdown-item" to={allRoutes.profile}>
              My Profile
            </Link>
            <Link className="dropdown-item" to={allRoutes.generalsettings}>
              Settings
            </Link>
            <Link className="dropdown-item" to={allRoutes.signin}>
              Logout
            </Link>
          </div>
        </div>
        {/* /Mobile Menu */}
      </div>
      {/* Header */}
    </>
  );
};

export default PosHeader;
