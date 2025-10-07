import { useSelector } from "react-redux";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { useEffect, useState, startTransition } from "react";
import Header from "../components/layouts/header";
import HorizontalSidebar from "../components/layouts/horizontalSidebar";
import { authRoutes, posPages, unAuthRoutes } from "../routes/path";

const FeatureModule = () => {
  const location = useLocation();
  const { toggleHeader } = useSelector((state) => state.sidebar);
  const data = useSelector((state) => state.rootReducer.toggle_header);
  const {
    dataWidth,
    dataLayout,
    dataSidebarAll,
    dataColorAll,
    dataTopBarColorAll,
    dataTopbarAll,
  } = useSelector((state) => state.themeSetting);

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setShowLoader(true);
    const t = setTimeout(() => setShowLoader(false), 1000);
    window.scrollTo(0, 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const Preloader = () => (
    <div id="global-loader" style={{ pointerEvents: "none" }}>
      <div className="whirly-loader" />
    </div>
  );

  const isUnAuthRoute = unAuthRoutes.some(
    (r) => r.path && matchPath({ path: r.path, end: true }, location.pathname)
  );
  const isPosPage = posPages.some(
    (r) => r.path && matchPath({ path: r.path, end: true }, location.pathname)
  );
  const isAuthRoute = authRoutes.some(
    (r) => r.path && matchPath({ path: r.path, end: true }, location.pathname)
  );

  if (isUnAuthRoute) return <Outlet />;

  if (isPosPage)
    return (
      <div className={`main-wrapper ${toggleHeader ? "header-collapse" : ""}`}>
        {showLoader && <Preloader />}
        <Outlet />
      </div>
    );

  if (isAuthRoute)
    return (
      <div className={`main-wrapper ${toggleHeader ? "header-collapse" : ""}`}>
        <style>{`
          :root{
            --sidebar--rgb-picr:${dataSidebarAll};
            --topbar--rgb-picr:${dataTopbarAll};
            --topbarcolor--rgb-picr:${dataTopBarColorAll};
            --primary-rgb-picr:${dataColorAll};
          }
        `}</style>

        <div
          className={`${
            dataLayout === "mini" ||
            dataLayout === "layout-hovered" ||
            dataWidth === "box"
              ? "mini-sidebar"
              : ""
          } ${
            [
              "horizontal",
              "horizontal-single",
              "horizontal-overlay",
              "horizontal-box",
            ].includes(dataLayout)
              ? "menu-horizontal"
              : ""
          } ${dataWidth === "box" ? "layout-box-mode" : ""}`}
        >
          {/* {showLoader && <Preloader />} */}
          <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
            <Header />
            <HorizontalSidebar />
            <Outlet />
          </div>
        </div>
      </div>
    );

  return <Outlet />;
};

export default FeatureModule;
