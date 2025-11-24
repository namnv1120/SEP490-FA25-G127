import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Nav, NavDropdown, Dropdown, Button, Form } from "react-bootstrap";
import { allRoutes } from "../../routes/AllRoutes";
import { getMyInfo } from "../../services/AccountService";
import { getImageUrl } from "../../utils/imageUtils";
import usePermission from "../../hooks/usePermission";
import { SidebarDataAdmin } from "../../core/json/sidebarDataAdmin";
import { SidebarDataOwner } from "../../core/json/sidebarDataOwner";
import { SidebarDataWarehouse } from "../../core/json/sidebarDataWarehouse";
import { SidebarDataSales } from "../../core/json/sidebarDataSales";
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
  const route = allRoutes;
  const [toggle, SetToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    fullName: "John Smilga",
    role: "Admin",
    avatarUrl: null,
  });

  const expandMenus = useSelector((state) => state.themeSetting.expandMenus);
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
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    SetToggle((current) => !current);
  };

  const location = useLocation();
  const { userRole } = usePermission();
  let sidebarData;
  switch (userRole) {
    case "Quản trị viên":
      sidebarData = SidebarDataAdmin;
      break;
    case "Chủ cửa hàng":
      sidebarData = SidebarDataOwner;
      break;
    case "Nhân viên kho":
      sidebarData = SidebarDataWarehouse;
      break;
    case "Nhân viên bán hàng":
      sidebarData = SidebarDataSales;
      break;
    default:
      sidebarData = [];
  }

  // Flatten all routes from SidebarData1
  const flattenRoutes = (data, parentTitle = "") => {
    const routes = [];
    data.forEach((item) => {
      if (item.subRoutes && item.subRoutes.length > 0) {
        item.subRoutes.forEach((subItem) => {
          if (subItem.route) {
            routes.push({
              title: subItem.tittle,
              route: subItem.route,
              parentTitle: item.tittle,
              fullPath: parentTitle
                ? `${parentTitle} > ${item.tittle} > ${subItem.tittle}`
                : `${item.tittle} > ${subItem.tittle}`,
            });
          }
          // Handle nested subRoutes
          if (subItem.subRoutes && subItem.subRoutes.length > 0) {
            subItem.subRoutes.forEach((nestedItem) => {
              if (nestedItem.route) {
                routes.push({
                  title: nestedItem.tittle,
                  route: nestedItem.route,
                  parentTitle: `${item.tittle} > ${subItem.tittle}`,
                  fullPath: `${item.tittle} > ${subItem.tittle} > ${nestedItem.tittle}`,
                });
              }
            });
          }
        });
      }
    });
    return routes;
  };

  // Search routes based on query
  useEffect(() => {
    if (searchQuery.trim()) {
      const flattenedRoutes = flattenRoutes(sidebarData);
      const query = searchQuery.toLowerCase().trim();
      const filtered = flattenedRoutes.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.parentTitle.toLowerCase().includes(query) ||
          item.route.toLowerCase().includes(query)
      );
      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setShowSearchDropdown(filtered.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, userRole, sidebarData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRouteClick = (route) => {
    navigate(route);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };

  useEffect(() => {
    document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    document.querySelector("html")?.classList.remove("menu-opened");
  }, [location.pathname, sidebarData]);

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getMyInfo();
        const userData = data.result || data;

        let roleName = "Admin";
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
          fullName: userData.fullName || "John Smilga",
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
      let roleName = "Admin";
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
        fullName: userData.fullName || "John Smilga",
        role: roleName,
        avatarUrl: avatarUrl,
      });
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

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
             ${expandMenus || dataLayout === "layout-hovered"
              ? "expand-menu"
              : ""
            }
             `}
          onMouseLeave={expandMenu}
          onMouseOver={expandMenuOpen}
        >
          <Link
            to={
              userRole === "Nhân viên bán hàng"
                ? route.saledashboard
                : userRole === "Chủ cửa hàng"
                  ? route.shopownerdashboard
                  : userRole === "Quản trị viên"
                    ? route.admindashboard
                    : userRole === "Nhân viên kho"
                      ? route.warehousedashboard
                      : route.shopownerdashboard
            }
            className="logo logo-normal"
          >
            <img src={logoPng} alt="img" />
          </Link>
          <Link
            to={
              userRole === "Nhân viên bán hàng"
                ? route.saledashboard
                : userRole === "Chủ cửa hàng"
                  ? route.shopownerdashboard
                  : userRole === "Quản trị viên"
                    ? route.admindashboard
                    : userRole === "Nhân viên kho"
                      ? route.warehousedashboard
                      : route.shopownerdashboard
            }
            className="logo logo-white"
          >
            <img src={logoWhitePng} alt="img" />
          </Link>
          <Link
            to={
              userRole === "Nhân viên bán hàng"
                ? route.saledashboard
                : userRole === "Chủ cửa hàng"
                  ? route.shopownerdashboard
                  : userRole === "Quản trị viên"
                    ? route.admindashboard
                    : userRole === "Nhân viên kho"
                      ? route.warehousedashboard
                      : route.shopownerdashboard
            }
            className="logo-small"
          >
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
                    placeholder="Tìm kiếm menu..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={() => setShowSearchDropdown(true)}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowSearchDropdown(true);
                      }
                    }}
                  />
                  <div className="search-addon">
                    <span>
                      <i className="ti ti-search" />
                    </span>
                  </div>
                  <span className="input-group-text">
                    <kbd className="d-flex align-items-center">
                      <img src={commandSvg} alt="img" className="me-1" />←
                    </kbd>
                  </span>
                </div>
                {showSearchDropdown && searchResults.length > 0 && (
                  <Dropdown.Menu
                    show
                    className="w-100 search-results-dropdown"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      padding: 0,
                    }}
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleRouteClick(result.route)}
                        className="search-result-item"
                        style={{
                          borderBottom:
                            index < searchResults.length - 1
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "rgba(var(--bs-primary-rgb), 0.05)";
                          e.target.style.color = "var(--bs-primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "inherit";
                        }}
                      >
                        <div
                          className="fw-bold"
                          style={{ fontSize: "15px", marginBottom: "4px" }}
                        >
                          {result.title}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "13px", marginBottom: "4px" }}
                        >
                          {result.fullPath}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "12px", marginBottom: 0 }}
                        >
                          <i className="ti ti-route me-1" />
                          {result.route}
                        </div>
                      </button>
                    ))}
                  </Dropdown.Menu>
                )}
                {showSearchDropdown &&
                  searchQuery.trim() &&
                  searchResults.length === 0 && (
                    <Dropdown.Menu
                      show
                      className="w-100"
                      style={{ marginTop: "5px" }}
                    >
                      <Dropdown.Item disabled className="text-center py-3">
                        Không tìm thấy kết quả
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  )}
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
                          confirmed his order. Order No: #78901.Estimated
                          delivery: 2 days
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
                          <span className="noti-title">Andrea</span> confirmed
                          his order. Order No: #73401.Estimated delivery: 3 days
                        </p>
                        <p className="noti-time">4 mins ago</p>
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="topnav-dropdown-footer d-flex align-items-center gap-3">
              <Button
                as={Link}
                to="#"
                variant="secondary"
                size="md"
                className="w-100"
              >
                Cancel
              </Button>
              <Button
                as={Link}
                to={route.activities}
                variant="primary"
                size="md"
                className="w-100"
              >
                View all
              </Button>
            </div>
          </NavDropdown>
          {/* 
          <Nav.Item as="li" className="nav-item nav-item-box">
            <Nav.Link as={Link} to="/general-settings">
              <i className="feather icon-settings"></i>
            </Nav.Link>
          </Nav.Item> */}

          <NavDropdown
            as="li"
            className="nav-item dropdown has-arrow main-drop profile-nav"
            title={
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
            }
            id="profile-dropdown"
            align="end"
          >
            <div className="profileset d-flex align-items-center">
              <span className="user-img me-2">
                <img
                  src={userInfo.avatarUrl || avator1}
                  alt="Img"
                  onError={(e) => {
                    e.target.src = avator1;
                  }}
                />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h6
                  className="fw-medium"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: 0,
                  }}
                >
                  {userInfo.fullName}
                </h6>
                <p
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: 0,
                  }}
                >
                  {userInfo.role}
                </p>
              </div>
            </div>
            <NavDropdown.Item as={Link} to={route.profile}>
              <i className="ti ti-user-circle me-2" />
              Thông tin cá nhân
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to={route.profile}>
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
