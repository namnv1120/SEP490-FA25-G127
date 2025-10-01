import React, { memo, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feture-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";
import { useDispatch } from "react-redux";
import { setDataLayout, setDataWidth } from "./core/redux/themeSettingSlice";

// ✅ Import đúng đường dẫn file CustomerList
import CustomerPage from "./feature-module/customers/CustomerList";

const AppRouter = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDataLayout("horizontal"));
    dispatch(setDataWidth("fluid"));
  }, [dispatch]);

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
      <Routes>
        <Route path="/" element={<FeatureModule />}>
          {renderRoutes(unAuthRoutes)}
          {renderRoutes(authRoutes)}
          {renderRoutes(posPages)}

          {/* ✅ Route Customer */}
          <Route path="customers" element={<CustomerPage />} />
          {/* chú ý: nếu bạn muốn URL là /customers thì path="customers" */}
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
