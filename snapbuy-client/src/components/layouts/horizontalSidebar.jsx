import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarData1 } from "../../core/json/sidebar_dataone";

const HorizontalSidebar = () => {
  const [opendSubMenu, setOpendSubMenu] = useState([null, null]);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const showMenu = (title) => {
    setOpendSubMenu((prevState) =>
      prevState[0] === title ? [null, null] : [title, null]
    );
  };

  const showSubMenu = (title) => {
    setOpendSubMenu((prevState) =>
      prevState[1] === title ? [prevState[0], null] : [prevState[0], title]
    );
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setOpendSubMenu([null, null]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActiveMainMenu = (mainMenus) => {
    const currentPath = location.pathname || "";
    return (
      (mainMenus.route &&
        currentPath.split("/")[1] === mainMenus.route.split("/")[1]) ||
      mainMenus.subRoutes?.some(
        (subMenu) =>
          subMenu.route &&
          currentPath.split("/")[1] === subMenu.route.split("/")[1]
      )
    );
  };

  const isActiveSubMenu = (subMenu) => {
    const currentPath = location.pathname || "";
    return subMenu.route && currentPath.split("/")[1] === subMenu.route.split("/")[1];
  };

  useEffect(() => {
    console.log("HorizontalSidebar rendered with opendSubMenu:", opendSubMenu);
  }, [opendSubMenu]);

  return (
    <div
      className="sidebar sidebar-horizontal"
      id="horizontal-menu"
      ref={sidebarRef}
    >
      <div className="sidebar-menu" id="sidebar-menu-3">
        <div className="main-menu">
          <ul className="nav nav-tabs" role="tablist">
            {SidebarData1.map((mainTittle, mainIndex) => (
              <li className="nav-item" key={mainIndex}>
                <a
                  className={`nav-link ${
                    opendSubMenu[0] === mainTittle.tittle || isActiveMainMenu(mainTittle)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => showMenu(mainTittle.tittle)}
                >
                  {mainTittle.tittle === "Components" ? (
                    <i className="feather icon-layers"></i>
                  ) : (
                    <i className={`ti ti-${mainTittle.icon} me-2`}></i>
                  )}
                  <span>{mainTittle.tittle}</span>
                  {mainTittle.subRoutes.length > 0 && <span className="menu-arrow" />}
                </a>
                {mainTittle.subRoutes.length > 0 && opendSubMenu[0] === mainTittle.tittle && (
                  <ul className="dropdown-menu">
                    {mainTittle.subRoutes.map((mainMenus, menuIndex) => (
                      <li key={menuIndex}>
                        {!mainMenus.hasSubRoute && (
                          <Link
                            to={mainMenus.route || "#"}
                            className={`dropdown-item ${
                              isActiveSubMenu(mainMenus) ? "active" : ""
                            }`}
                          >
                            <span>{mainMenus.tittle}</span>
                          </Link>
                        )}
                        {mainMenus.hasSubRoute && (
                          <a
                            className={`dropdown-item ${
                              isActiveSubMenu(mainMenus) ? "active" : ""
                            }`}
                            onClick={() => showSubMenu(mainMenus.tittle)}
                          >
                            <span>{mainMenus.tittle}</span>
                            <span className="menu-arrow"></span>
                          </a>
                        )}
                        {mainMenus.hasSubRoute && opendSubMenu[1] === mainMenus.tittle && (
                          <ul className="dropdown-menu submenu-two">
                            {mainMenus.subRoutes.map((subDropMenus, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={subDropMenus.route || "#"}
                                  className={`dropdown-item ${
                                    isActiveSubMenu(subDropMenus) ? "active" : ""
                                  }`}
                                >
                                  {subDropMenus.tittle}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HorizontalSidebar;