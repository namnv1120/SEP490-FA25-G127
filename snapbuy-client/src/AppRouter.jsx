// src/AppRouter.jsx
import React, { memo, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feture-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";
import { useDispatch } from "react-redux";
import { setDataLayout, setDataWidth } from "./core/redux/themeSettingSlice";

// ✅ Import các page customer (chỉ dùng những file bạn đã có)
import CustomerList from "./feature-module/customers/CustomerList";
import EditCustomerPage from "./feature-module/customers/EditCustomerPage";
import ViewCustomerPage from "./feature-module/customers/ViewCustomerPage";
import CustomerFormModal from "./feature-module/customers/CustomerFormModal";

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

          {/* --- Customers group --- */}
          <Route path="customers">
            <Route index element={<CustomerList />} /> {/* /customers */}
            <Route path="add" element={<CustomerFormModal mode="add" />} />{" "}
            {/* /customers/add */}
            <Route path="edit/:id" element={<EditCustomerPage />} />{" "}
            {/* /customers/edit/123 */}
            <Route path="view/:id" element={<ViewCustomerPage />} />{" "}
            {/* /customers/view/123 */}
          </Route>
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
