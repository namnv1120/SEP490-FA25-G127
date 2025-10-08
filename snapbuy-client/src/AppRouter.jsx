import React, { memo, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FeatureModule from "./feature-module/feture-module";
import { authRoutes, posPages, unAuthRoutes } from "./routes/path";
import { base_path } from "./environment";
import { useDispatch } from "react-redux";
import { setDataLayout, setDataWidth } from "./core/redux/themeSettingSlice";

// --- Import Product pages ---
import ProductList from "./feature-module/inventory/ProductList";
import AddProduct from "./feature-module/inventory/AddProduct";
import EditProduct from "./feature-module/inventory/EditProduct";
import ProductDetail from "./feature-module/inventory/ProductDetail";

// --- Import Supplier pages ---
import SupplierList from "./feature-module/people/Supplier";

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
          {/* Render các route động từ cấu hình */}
          {renderRoutes(unAuthRoutes)}
          {renderRoutes(authRoutes)}
          {renderRoutes(posPages)}

          {/* --- Products group --- */}
          <Route path="products">
            <Route index element={<ProductList />} /> {/* /products */}
            <Route path="add" element={<AddProduct />} /> {/* /products/add */}
            <Route path="edit/:id" element={<EditProduct />} /> {/* /products/edit/:id */}
            <Route path="view/:id" element={<ProductDetail />} /> {/* /products/view/:id */}
          </Route>

          {/* Alias routes để tương thích với /product-list */}
          <Route path="product-list" element={<ProductList />} /> {/* /product-list */}
          <Route path="add-product" element={<AddProduct />} /> {/* /add-product */}
          <Route path="product-list/edit/:id" element={<EditProduct />} /> {/* /product-list/edit/:id */}
          <Route path="product-list/view/:id" element={<ProductDetail />} /> {/* /product-list/view/:id */}

          {/* --- Suppliers group --- */}
          <Route path="suppliers">
            <Route index element={<SupplierList />} /> 
            {/* Có thể thêm Add/Edit/View sau nếu cần */}
          </Route>
        </Route>
      </Routes>
    );
  });

  return (
    <BrowserRouter 
      basename={base_path}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;