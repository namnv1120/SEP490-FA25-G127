import { memo} from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import FeatureModule from "./feature-module/feature-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";

const AppRouter = () => {
  const RouterContent = memo(() => {
    const renderRoutes = (routeList) =>
      routeList?.map((item) => (
        <Route
          key={`route-${item?.id}`}
          path={item?.path}
          element={item?.element}
        />
      ));

    return (
      <>
        <Routes>
          <Route path="/" element={<FeatureModule />}>
            <Route index element={<Navigate to="/login" replace />} />
            {renderRoutes(unAuthRoutes)}
            {renderRoutes(authRoutes)}
            {renderRoutes(posPages)}
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  });

  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;
