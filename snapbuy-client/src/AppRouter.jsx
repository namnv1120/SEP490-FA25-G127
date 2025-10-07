import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import FeatureModule from "./feature-module/feature-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";

const AppRouter = () => {
  const renderRoutes = (list) =>
    list?.map((item) => (
      <Route
        key={`route-${item?.id}`}
        path={item?.path}
        element={item?.element}
      />
    ));

  return (
    <BrowserRouter basename={base_path}>
      <Suspense fallback={<div className="page-loader">Loading...</div>}>
        <Routes>
          <Route path="/" element={<FeatureModule />}>
            <Route index element={<Navigate to="/login" replace />} />
            {renderRoutes(unAuthRoutes)}
            {renderRoutes(authRoutes)}
            {renderRoutes(posPages)}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
