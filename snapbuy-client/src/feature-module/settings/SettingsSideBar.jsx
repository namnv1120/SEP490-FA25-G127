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
        route.securitysettings,
        route.notification,
        route.connectedapps,
      ].filter(Boolean),
    [route.profile, route.securitysettings, route.notification, route.connectedapps]
  );

  const websiteSettingPaths = useMemo(
    () =>
      [
        route.systemsettings,
        route.companysettings,
        route.localizationsettings,
        route.prefixes,
        route.preference,
        route.appearance,
        route.socialauthendication,
        route.languagesettings,
      ].filter(Boolean),
    [
      route.systemsettings,
      route.companysettings,
      route.localizationsettings,
      route.prefixes,
      route.preference,
      route.appearance,
      route.socialauthendication,
      route.languagesettings,
    ]
  );

  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(() =>
    generalSettingPaths.includes(location.pathname)
  );
  const [isWebsiteSettingsOpen, setIsWebsiteSettingsOpen] = useState(() =>
    websiteSettingPaths.includes(location.pathname)
  );

  useEffect(() => {
    if (generalSettingPaths.includes(location.pathname)) {
      setIsGeneralSettingsOpen(true);
    }
    if (websiteSettingPaths.includes(location.pathname)) {
      setIsWebsiteSettingsOpen(true);
    }
  }, [location.pathname, generalSettingPaths, websiteSettingPaths]);

  const toggleGeneralSettings = () => setIsGeneralSettingsOpen(!isGeneralSettingsOpen);
  const toggleWebsiteSettings = () => setIsWebsiteSettingsOpen(!isWebsiteSettingsOpen);

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
                    location.pathname === route.securitysettings ||
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
                    to={route.securitysettings}
                    className={location.pathname === route.securitysettings ? "active" : ""}
                  >
                    Bảo mật
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

            {/* Website Settings */}
            <li className="submenu">
              <Link
                to="#"
                onClick={toggleWebsiteSettings}
                className={
                  location.pathname === route.systemsettings ||
                    location.pathname === route.companysettings ||
                    location.pathname === route.localizationsettings ||
                    location.pathname === route.prefixes ||
                    location.pathname === route.preference ||
                    location.pathname === route.appearance ||
                    location.pathname === route.socialauthendication ||
                    location.pathname === route.languagesettings
                    ? "active subdrop"
                    : ""
                }
              >
                <i className="ti ti-world fs-18"></i>
                <span className="fs-14 fw-medium ms-2">Cài đặt POS</span>
                <span className="menu-arrow" />
              </Link>
              <ul style={{ display: isWebsiteSettingsOpen ? "block" : "none" }}>
                <li>
                  <Link
                    to={route.systemsettings}
                    className={location.pathname === route.systemsettings ? "active" : ""}
                  >
                    System Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.companysettings}
                    className={location.pathname === route.companysettings ? "active" : ""}
                  >
                    Company Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.localizationsettings}
                    className={location.pathname === route.localizationsettings ? "active" : ""}
                  >
                    Localization
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.prefixes}
                    className={location.pathname === route.prefixes ? "active" : ""}
                  >
                    Prefixes
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.preference}
                    className={location.pathname === route.preference ? "active" : ""}
                  >
                    Preference
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.appearance}
                    className={location.pathname === route.appearance ? "active" : ""}
                  >
                    Appearance
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.socialauthendication}
                    className={location.pathname === route.socialauthendication ? "active" : ""}
                  >
                    Social Authentication
                  </Link>
                </li>
                <li>
                  <Link
                    to={route.languagesettings}
                    className={location.pathname === route.languagesettings ? "active" : ""}
                  >
                    Language
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
