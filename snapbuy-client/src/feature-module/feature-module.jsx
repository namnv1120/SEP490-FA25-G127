import { useSelector } from "react-redux";
import { Outlet, useLocation, matchPath } from "react-router";
import Header from "../components/layouts/Header";
import Sidebar from "../components/sidebar/Sidebar";
import ThemeSettings from "../components/layouts/themeSettings";
import { authRoutes, posPage, unAuthRoutes } from "../routes/path";
import HorizontalSidebar from "../components/layouts/horizontalSidebar";
import PosHeader from "./pos/PosHeader";
import PageTitle from "../components/PageTitle";

const FeatureModule = () => {
  const location = useLocation();
  const { toggleHeader } = useSelector((state) => state.sidebar);

  // const [showLoader, setShowLoader] = useState(true);
  const data = useSelector((state) => state.rootReducer.toggle_header);
  const dataWidth = useSelector((state) => state.themeSetting.dataWidth);
  const dataLayout = useSelector((state) => state.themeSetting.dataLayout);
  const dataSidebarAll = useSelector(
    (state) => state.themeSetting.dataSidebarAll
  );
  const dataColorAll = useSelector((state) => state.themeSetting.dataColorAll);
  const dataTopBarColorAll = useSelector(
    (state) => state.themeSetting.dataTopBarColorAll
  );
  const dataTopbarAll = useSelector(
    (state) => state.themeSetting.dataTopbarAll
  );

  const safeMatch = (routeList) =>
    routeList.some((route) => {
      const path = typeof route === "string" ? route : route?.path;
      if (!path) return false;
      return matchPath({ path, end: true }, location.pathname);
    });

  const isUnAuthRoute = safeMatch(unAuthRoutes);
  const isPosPage = safeMatch(posPage);
  const isAuthRoute = safeMatch(authRoutes);

  if (isUnAuthRoute) {
    return (
      <div>
        <PageTitle />
        <Outlet />
      </div>
    );
  }

  if (isPosPage) {
    return (
      <div className={`main-wrapper ${toggleHeader ? "header-collapse" : ""}`}>
        <PageTitle />
        <PosHeader />
        <div style={{ display: "none" }}>
          <ThemeSettings />
        </div>
        <Outlet />
      </div>
    );
  }

  if (isAuthRoute) {
    return (
      <div className={`main-wrapper ${toggleHeader ? "header-collapse" : ""}`}>
        <>
          <PageTitle />
          <style>
            {`
              :root {
                --sidebar--rgb-picr: ${dataSidebarAll};
                --topbar--rgb-picr: ${dataTopbarAll};
                --topbarcolor--rgb-picr: ${dataTopBarColorAll};
                --primary-rgb-picr: ${dataColorAll};
              }
            `}
          </style>

          <div
            className={`
              ${dataLayout === "mini" ||
                dataLayout === "layout-hovered" ||
                dataWidth === "box"
                ? "mini-sidebar"
                : ""
              }
              ${dataLayout === "horizontal" ||
                dataLayout === "horizontal-single" ||
                dataLayout === "horizontal-overlay" ||
                dataLayout === "horizontal-box"
                ? "menu-horizontal"
                : ""
              }
              ${dataWidth === "box" ? "layout-box-mode" : ""}
            `}
          >
            <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
              <Header />
              <Sidebar />
              <HorizontalSidebar />
              <Outlet />
              <div style={{ display: "none" }}>
                <ThemeSettings />
              </div>

            </div>
          </div>
        </>
      </div>
    );
  }

  return (
    <>
      <PageTitle />
      <Outlet />
    </>
  );
};

export default FeatureModule;
