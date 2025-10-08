import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarData1 } from "../../core/json/sidebar_dataone"; // chỉnh path nếu khác

export default function HorizontalSidebar() {
  const [open, setOpen] = useState([null, null]); // [mainTitle, subTitle]
  const ref = useRef(null);
  const { pathname } = useLocation();

  const showMain = (title) =>
    setOpen((prev) => (prev[0] === title ? [null, null] : [title, null]));

  const showSub = (title) =>
    setOpen((prev) => (prev[1] === title ? [prev[0], null] : [prev[0], title]));

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen([null, null]);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  
  useEffect(() => {
    setOpen([null, null]);
  }, [pathname]);

  const isActiveMain = (group) => {
    const seg = (pathname.split("/")[1] || "").toLowerCase();
    return Boolean(
      (group.route && seg === group.route.split("/")[1]?.toLowerCase()) ||
        group.subRoutes?.some(
          (s) => s.route && seg === s.route.split("/")[1]?.toLowerCase()
        )
    );
  };

  const isActive = (item) => {
    const seg = (pathname.split("/")[1] || "").toLowerCase();
    return item.route && seg === item.route.split("/")[1]?.toLowerCase();
  };

  return (
    <div
      className="sidebar sidebar-horizontal border-bottom bg-white"
      ref={ref}
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="sidebar-menu">
        <div className="main-menu">
          <ul className="nav nav-tabs" role="tablist">
            {SidebarData1.map((group, i) => (
              <li
                key={i}
                className={`nav-item dropdown ${
                  open[0] === group.tittle ? "show" : ""
                }`}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  className={`nav-link ${
                    open[0] === group.tittle || isActiveMain(group)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => showMain(group.tittle)}
                >
                  {group.tittle === "Components" ? (
                    <i className="feather icon-layers me-2" />
                  ) : (
                    <i
                      className={`ti ti-${group.icon || "layout-grid"} me-2`}
                    />
                  )}
                  <span>{group.tittle}</span>
                  {group.subRoutes?.length > 0 && (
                    <i className="ti ti-chevron-down ms-1" />
                  )}
                </button>

                {/* Dropdown cấp 1 */}
                <ul
                  className={`dropdown-menu ${
                    open[0] === group.tittle ? "show" : ""
                  }`}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 4,
                    zIndex: 2000,
                    display: open[0] === group.tittle ? "block" : "none",
                  }}
                >
                  {group.subRoutes?.map((menu, j) => (
                    <li
                      key={j}
                      className={
                        menu.hasSubRoute
                          ? "dropdown-submenu position-static"
                          : ""
                      }
                    >
                      {!menu.hasSubRoute && (
                        <Link
                          to={menu.route || "#"}
                          className={`dropdown-item ${
                            isActive(menu) ? "active" : ""
                          }`}
                        >
                          {menu.tittle}
                        </Link>
                      )}

                      {menu.hasSubRoute && (
                        <>
                          <a
                            href="#"
                            className={`dropdown-item d-flex justify-content-between align-items-center ${
                              isActive(menu) ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              showSub(menu.tittle);
                            }}
                          >
                            <span>{menu.tittle}</span>
                            <i className="ti ti-chevron-right" />
                          </a>

                          {/* Dropdown cấp 2 */}
                          <ul
                            className={`dropdown-menu submenu-two ${
                              open[1] === menu.tittle ? "show" : ""
                            }`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: "100%",
                              marginLeft: 4,
                              zIndex: 2000,
                              display:
                                open[1] === menu.tittle ? "block" : "none",
                            }}
                          >
                            {menu.subRoutes?.map((child, k) => (
                              <li key={k}>
                                <Link
                                  to={child.route || "#"}
                                  className={`dropdown-item ${
                                    isActive(child) ? "active" : ""
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {child.tittle}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
