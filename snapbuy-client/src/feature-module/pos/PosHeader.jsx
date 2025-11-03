import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { Settings, User } from 'react-feather';
import { all_routes } from '../../routes/all_routes';

const PosHeader = () => {
  const [isFullscreen] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="header pos-header">
        {/* Logo */}
        <div className="header-left active">
          <Link to={all_routes.newdashboard} className="logo logo-normal">
            <img src="src/assets/img/logo.png" alt="Img" />
          </Link>
          <Link to={all_routes.newdashboard} className="logo logo-white">
            <img src="src/assets/img/logo-white.png" alt="Img" />
          </Link>
          <Link to={all_routes.newdashboard} className="logo-small">
            <img src="src/assets/img/logo-small.png" alt="Img" />
          </Link>
        </div>
        {/* Header Menu */}
        <ul className="nav user-menu">
          {/* Search */}
          <li className="nav-item time-nav">
            <span className="bg-teal text-white d-inline-flex align-items-center">
              <img
                src="src/assets/img/icons/clock-icon.svg"
                alt="img"
                className="me-2"
              />
              {new Date().toLocaleTimeString()}
            </span>
          </li>
          {/* /Search */}
          <li className="nav-item pos-nav">
            <Link
              to={all_routes.dashboard}
              className="btn btn-purple btn-md d-inline-flex align-items-center"
            >
              <i className="ti ti-world me-1" />
              Dashboard
            </Link>
          </li>
          
          <li className="nav-item nav-item-box">
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
              <Link to={all_routes.possettings}>
                <i className="ti ti-settings" />
              </Link>
            </Tooltip>
          </li>
          <li className="nav-item dropdown has-arrow main-drop profile-nav">
            <Link
              to="#"
              className="nav-link userset"
              data-bs-toggle="dropdown"
            >
              <span className="user-info p-0">
                <span className="user-letter">
                  <img
                    src="src/assets/img/profiles/avator1.jpg"
                    alt="Img"
                    className="img-fluid"
                  />
                </span>
              </span>
            </Link>
            <div className="dropdown-menu menu-drop-user">
              <div className="profilename">
                <div className="profileset">
                  <span className="user-img">
                    <img src="src/assets/img/profiles/avator1.jpg" alt="Img" />
                    <span className="status online" />
                  </span>
                  <div className="profilesets">
                    <h6>User Name</h6>
                    <h5>Role</h5>
                  </div>
                </div>
                <hr className="m-0" />
                <Link className="dropdown-item" to={all_routes.profile}>
                  <User className="me-2" />
                  
                </Link>
                <Link
                  className="dropdown-item"
                  to={all_routes.generalsettings}
                >
                  <Settings className="me-2" />
                  Cài đặt
                </Link>
                <hr className="m-0" />
                <Link
                  className="dropdown-item logout pb-0"
                  to={all_routes.signin}
                >
                  <img
                    src="src/assets/img/icons/log-out.svg"
                    className="me-2"
                    alt="img"
                  />
                  Đăng xuất
                </Link>
              </div>
            </div>
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
            <Link className="dropdown-item" to={all_routes.profile}>
              My Profile
            </Link>
            <Link className="dropdown-item" to={all_routes.generalsettings}>
              Settings
            </Link>
            <Link className="dropdown-item" to={all_routes.signin}>
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

