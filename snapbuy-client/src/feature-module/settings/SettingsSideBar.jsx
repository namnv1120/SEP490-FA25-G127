import { useEffect, useMemo, useState } from "react";
import { allRoutes } from "../../routes/AllRoutes";
import { Link, useLocation } from "react-router-dom";

const SettingsSideBar = () => {
  const route = allRoutes;
  const location = useLocation();

  const generalSettingPaths = useMemo(
    () =>
      [
        route.profile,
        route.emailsettings,
        route.passwordsettings,
        route.notification,
        route.connectedapps,
      ].filter(Boolean),
    [route.profile, route.emailsettings, route.passwordsettings, route.notification, route.connectedapps]
  );

  const posSettingPaths = useMemo(
    () =>
      [
        route.possystemsettings,
      ].filter(Boolean),
    [
      route.possystemsettings,
    ]
  );

  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(() =>
    generalSettingPaths.includes(location.pathname)
  );
  const [isPosSettingsOpen, setIsPosSettingsOpen] = useState(() =>
    posSettingPaths.includes(location.pathname)
  );

  useEffect(() => {
    if (generalSettingPaths.includes(location.pathname)) {
      setIsGeneralSettingsOpen(true);
    }
    if (posSettingPaths.includes(location.pathname)) {
      setIsPosSettingsOpen(true);
    }
  }, [location.pathname, generalSettingPaths, posSettingPaths]);

  const toggleGeneralSettings = () => setIsGeneralSettingsOpen(!isGeneralSettingsOpen);
  const togglePosSettings = () => setIsPosSettingsOpen(!isPosSettingsOpen);

  const sidebarContent = (
    <div id="sidebar-menu5" className="sidebar-menu">
      <h4 className="fw-bold fs-18 mb-2 pb-2">Cài đặt</h4>
      <ul className="list-unstyled">
        <li className="submenu-open">
          <ul>
            <li className="submenu">
              <Link
                to="#"
                onClick={toggleGeneralSettings}
                className={
                  location.pathname === route.profile ||
                    location.pathname === route.emailsettings ||
                    location.pathname === route.passwordsettings ||
                    location.pathname === route.notification ||
                    location.pathname === route.connectedapps
                    ? "active subdrop"
                    : ""
                }
              >
                <i className="ti ti-settings fs-18"></i>
                <span className="fs-14 fw-medium ms-2">Cài đặt chung</span>
                <span className="menu-arrow" />
              </Link>
              <ul style={{ display: isGeneralSettingsOpen ? "block" : "none" }}>
                <li>
                  <Link
                    to={route.profile}
                    className={location.pathname === route.profile ? "active" : ""}
                  >
                    Thông tin cá nhân
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.emailsettings}
                    className={location.pathname === route.emailsettings ? "active" : ""}
                  >
                    Email
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.passwordsettings}
                    className={location.pathname === route.passwordsettings ? "active" : ""}
                  >
                    Mật khẩu
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.notification}
                    className={location.pathname === route.notification ? "active" : ""}
                  >
                    Thông báo
                  </Link>
                </li>
              </ul>
            </li>

            {/* POS Settings */}
            <li className="submenu">
              <Link
                to="#"
                onClick={togglePosSettings}
                className={
                  location.pathname === route.possystemsettings
                    ? "active subdrop"
                    : ""
                }
              >
                <i className="ti ti-shopping-cart fs-18"></i>
                <span className="fs-14 fw-medium ms-2">Cài đặt POS</span>
                <span className="menu-arrow" />
              </Link>
              <ul style={{ display: isPosSettingsOpen ? "block" : "none" }}>
                <li>
                  <Link
                    to={route.possystemsettings}
                    className={location.pathname === route.possystemsettings ? "active" : ""}
                  >
                    Cài đặt hệ thống
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );

  return (
    <div>
      <div className="settings-sidebar" id="sidebar2">
        <div className="sidebar-inner slimscroll" style={{ overflowY: "auto", maxHeight: 800 }}>
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default SettingsSideBar;
