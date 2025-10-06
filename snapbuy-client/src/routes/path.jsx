import { Route } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";
import CustomerList from "../feature-module/customers/CustomerList";

// Lazy load Dashboard
const Dashboard = lazy(() => import("../feature-module/dashboard/dashboard"));

const routes = all_routes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard, // dùng routes.dashboard thay vì "/dashboard"
    name: "dashboard",
    element: <Dashboard />,
    route: Route,
  },
  {
    id: 2,
    path: "/customers",
    name: "customers",
    element: <CustomerList />,
    route: Route,
  },
  {
    id: 230,
    path: routes.formhorizontal,
    name: "formhorizontal",
    element: <FormHorizontal />,
    route: Route,
  },
];

export const posPages = [
  // giữ nguyên pos nếu cần
];

export const unAuthRoutes = [
  // giữ nguyên auth routes chưa login nếu cần
];
