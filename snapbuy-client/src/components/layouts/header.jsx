import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Nav,
  NavDropdown,
  Dropdown,
  Button,
  Form
} from "react-bootstrap";
import { all_routes } from "../../routes/all_routes";
import {
  avatar_02,
  avatar_03,
  avatar_13,
  avatar_17,
  avator1,
  commandSvg,
  logoPng,
  logoSmallPng,
  logoWhitePng,
} from "../../utils/imagepath";

const Header = () => {
  const route = all_routes;
  const [toggle, SetToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navigate = useNavigate();

  const { expandMenus } = useSelector(
    (state) => state.themeSetting.expandMenus
  );
  const dataLayout = useSelector((state) => state.themeSetting.dataLayout);

  const isElementVisible = (element) => {
    return element.offsetWidth > 0 || element.offsetHeight > 0;
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTokenType");
    navigate(route.login);
  };

  useEffect(() => {
    const handleMouseover = (e) => {
      e.stopPropagation();
      const body = document.body;
      const toggleBtn = document.getElementById("toggle_btn");

      if (
        body.classList.contains("mini-sidebar") &&
        isElementVisible(toggleBtn)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("mouseover", handleMouseover);
    return () => {
      document.removeEventListener("mouseover", handleMouseover);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    SetToggle((current) => !current);
  };

  const location = useLocation();

  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };

  useEffect(() => {
    document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    document.querySelector("html")?.classList.remove("menu-opened");
  }, [location.pathname]);

  const pathname = location.pathname;

  const exclusionArray = [
    "/reactjs/template/dream-pos/index-three",
    "/reactjs/template/dream-pos/index-one",
  ];

  if (exclusionArray.indexOf(window.location.pathname) >= 0) {
    return "";
  }

  const toggleFullscreen = (elem) => {
    const doc = document;
    elem = elem || document.documentElement;
    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(1);
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };

  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };

  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };

  return (
    <div className="header">
      <div className="main-header">
        <div
          className={`header-left
             ${toggle ? "" : "active"}
             ${expandMenus || dataLayout === "layout-hovered" ? "expand-menu" : ""}
             `}
          onMouseLeave={expandMenu}
          onMouseOver={expandMenuOpen}
        >
          <Link to="/dashboard" className="logo logo-normal">
            <img src={logoPng} alt="img" />
          </Link>
          <Link to="/dashboard" className="logo logo-white">
            <img src={logoWhitePng} alt="img" />
          </Link>
          <Link to="/dashboard" className="logo-small">
            <img src={logoSmallPng} alt="img" />
          </Link>
          <Link
            id="toggle_btn"
            to="#"
            style={{
              display:
                pathname.includes("tasks") || pathname.includes("pos")
                  ? "none"
                  : pathname.includes("compose")
                    ? "none"
                    : "",
            }}
            onClick={handlesidebar}
          >
            <i className="feather icon-chevrons-left feather-16" />
          </Link>
        </div>

        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#"
          onClick={sidebarOverlay}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>

        <Nav as="ul" className="nav user-menu">

          <Nav.Item as="li" className="nav-searchinputs">
            <div className="top-nav-search">
              <Link to="#" className="responsive-search">
                <i className="feather icon-search" />
              </Link>

              <Dropdown
                show={showSearchDropdown}
                onToggle={(isOpen) => setShowSearchDropdown(isOpen)}
              >
                <div className="searchinputs input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search"
                    onClick={() => setShowSearchDropdown(true)}
                  />
                  <div className="search-addon">
                    <span>
                      <i className="ti ti-search" />
                    </span>
                  </div>
                  <span className="input-group-text">
                    <kbd className="d-flex align-items-center">
                      <img src={commandSvg} alt="img" className="me-1" />K
                    </kbd>
                  </span>
                </div>
              </Dropdown>
            </div>
          </Nav.Item>

          <Nav.Item as="li" className="nav-item pos-nav">
            <Link
              to={route.pos}
              className="btn btn-dark btn-md d-inline-flex align-items-center"
            >
              <i className="ti ti-device-laptop me-1" />
              POS
            </Link>
          </Nav.Item>

          <Nav.Item as="li" className="nav-item nav-item-box">
            <Nav.Link
              href="#"
              id="btnFullscreen"
              onClick={() => toggleFullscreen()}
              className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            >
              <i className="ti ti-maximize"></i>
            </Nav.Link>
          </Nav.Item>

          {/* <Nav.Item as="li" className="nav-item nav-item-box">
            <Nav.Link as={Link} to="/email">
              <i className="ti ti-mail"></i>
            </Nav.Link>
          </Nav.Item> */}

          <NavDropdown
            as="li"
            className="nav-item dropdown nav-item-box"
            title={<i className="ti ti-bell"></i>}
            id="notifications-dropdown"
            align="end"
          >
            <div className="topnav-dropdown-header">
              <h5 className="notification-title">Notifications</h5>
              <Link to="#" className="clear-noti">
                Mark all as read
              </Link>
            </div>
            <div className="noti-content">
              <ul className="notification-list">
                <li className="notification-message">
                  <Link to={route.activities}>
                    <div className="media d-flex">
                      <span className="avatar flex-shrink-0">
                        <img alt="Img" src={avatar_13} />
                      </span>
                      <div className="flex-grow-1">
                        <p className="noti-details">
                          <span className="noti-title">James Kirwin</span>{" "}
                          confirmed his order. Order No: #78901.Estimated delivery: 2 days
                        </p>
                        <p className="noti-time">4 mins ago</p>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="notification-message">
                  <Link to={route.activities}>
                    <div className="media d-flex">
                      <span className="avatar flex-shrink-0">
                        <img alt="Img" src={avatar_03} />
                      </span>
                      <div className="flex-grow-1">
                        <p className="noti-details">
                          <span className="noti-title">Leo Kelly</span>{" "}
                          cancelled his order scheduled for 17 Jan 2025
                        </p>
                        <p className="noti-time">10 mins ago</p>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="notification-message">
                  <Link to={route.activities} className="recent-msg">
                    <div className="media d-flex">
                      <span className="avatar flex-shrink-0">
                        <img alt="Img" src={avatar_17} />
                      </span>
                      <div className="flex-grow-1">
                        <p className="noti-details">
                          Payment of $50 received for Order #67890 from{" "}
                          <span className="noti-title">Antonio Engle</span>
                        </p>
                        <p className="noti-time">05 mins ago</p>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="notification-message">
                  <Link to={route.activities} className="recent-msg">
                    <div className="media d-flex">
                      <span className="avatar flex-shrink-0">
                        <img alt="Img" src={avatar_02} />
                      </span>
                      <div className="flex-grow-1">
                        <p className="noti-details">
                          <span className="noti-title">Andrea</span> confirmed his order. Order No: #73401.Estimated delivery: 3 days
                        </p>
                        <p className="noti-time">4 mins ago</p>
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="topnav-dropdown-footer d-flex align-items-center gap-3">
              <Button as={Link} to="#" variant="secondary" size="md" className="w-100">
                Cancel
              </Button>
              <Button as={Link} to={route.activities} variant="primary" size="md" className="w-100">
                View all
              </Button>
            </div>
          </NavDropdown>

          {/* Settings Link */}
          <Nav.Item as="li" className="nav-item nav-item-box">
            <Nav.Link as={Link} to="/general-settings">
              <i className="feather icon-settings"></i>
            </Nav.Link>
          </Nav.Item>

          <NavDropdown
            as="li"
            className="nav-item dropdown has-arrow main-drop profile-nav"
            title={
              <span className="user-info p-0">
                <span className="user-letter">
                  <img src={avator1} alt="Img" className="img-fluid" />
                </span>
              </span>
            }
            id="profile-dropdown"
            align="end"
          >
            <div className="profileset d-flex align-items-center">
              <span className="user-img me-2">
                <img src={avator1} alt="Img" />
              </span>
              <div>
                <h6 className="fw-medium">John Smilga</h6>
                <p>Admin</p>
              </div>
            </div>
            <NavDropdown.Item as={Link} to={route.profile}>
              <i className="ti ti-user-circle me-2" />
              Thông tin cá nhân
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to={route.generalsettings}>
              <i className="ti ti-settings-2 me-2" />
              Cài đặt
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item
              as="button"
              className="logout pb-0 border-0 bg-transparent w-100 text-start"
              onClick={handleLogout}
            >
              <i className="ti ti-logout me-2" />
              Đăng xuất
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    </div>
  );
};

export default Header;
