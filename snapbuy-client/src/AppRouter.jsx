import React, { memo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feture-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";

const AppRouter = () => {
  const RouterContent = memo(() => {
    const renderRoutes = (routeList, _isProtected) =>
      routeList?.map((item) => (
        <Route
          key={`route-${item?.id}`}
          path={item?.path}
          element={item?.element}
        />
      ));

    return (
      <Routes>
        <Route path="/" element={<FeatureModule />}>
          {renderRoutes(unAuthRoutes, false)}
          {renderRoutes(authRoutes, true)}
          {renderRoutes(posPages, true)}
        </Route>
      </Routes>
    );
  });

  return (
    <BrowserRouter basename={base_path}>
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;
