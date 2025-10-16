import { Route } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";
// import FormBasicInputs from "../feature-module/uiinterface/forms/formelements/basic-inputs";
// import CheckboxRadios from "../feature-module/uiinterface/forms/formelements/checkbox-radios";
// import FileUpload from "../feature-module/uiinterface/forms/formelements/fileupload";
// import FormSelect from "../feature-module/uiinterface/forms/formelements/form-select";
// import FormWizard from "../feature-module/uiinterface/forms/formelements/form-wizard";
// import FormPikers from "../feature-module/uiinterface/forms/formelements/formpickers";
// import GridGutters from "../feature-module/uiinterface/forms/formelements/grid-gutters";
// import InputGroup from "../feature-module/uiinterface/forms/formelements/input-group";
// import BootstrapIcons from "../feature-module/uiinterface/icons/bootstrapicons";
// import FlagIcons from "../feature-module/uiinterface/icons/flagicons";
// import FontawesomeIcons from "../feature-module/uiinterface/icons/fontawesome";
// import MaterialIcons from "../feature-module/uiinterface/icons/materialicon";
// import PE7Icons from "../feature-module/uiinterface/icons/pe7icons";
// import RemixIcons from "../feature-module/uiinterface/icons/remixIcons";
// import TablerIcon from "../feature-module/uiinterface/icons/tablericon";
// import ThemifyIcons from "../feature-module/uiinterface/icons/themify";
// import TypiconIcons from "../feature-module/uiinterface/icons/typicons";
// import Leaflet from "../feature-module/uiinterface/map/leaflet";
// import DataTables from "../feature-module/uiinterface/table/data-tables";
// import TablesBasic from "../feature-module/uiinterface/table/tables-basic";
// import Pos from "../feature-module/pos/pos";
const Suppliers = lazy(() => import("../feature-module/people/Supplier"));

// Lazy load Dashboard
const Dashboard = lazy(() => import("../feature-module/dashboard/dashboard"));
const ProductList = lazy(() =>
  import("../feature-module/inventory/ProductList")
);
const Accounts = lazy(() => import("../feature-module/usermanagement/account"));
const RolesPermissions = lazy(() =>
  import("../feature-module/usermanagement/Rolespermissions")
);
const Permissions = lazy(() =>
  import("../feature-module/usermanagement/permissions")
);
// const DeleteAccount = lazy(() =>
//   import("../feature-module/usermanagement/deleteaccount")
// );
const Profile = lazy(() => import("../feature-module/usermanagement/Profile"));
const Login = lazy(() =>
  import("../feature-module/pages/authentication/Login")
);
const Forgotpassword = lazy(() =>
  import("../feature-module/pages/authentication/ForgotPassword")
);

const routes = all_routes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard,
    name: "dashboard",
    element: <Dashboard />,
    route: Route,
  },
  // {
  //   id: 2,
  //   path: "/customers",
  //   name: "customers",
  //   element: <CustomerList />,
  //   route: Route,
  // },
  {
    id: 106,
    path: routes.profile,
    name: "profile",
    element: <Profile />,
    route: Route,
  },
  {
    id: 104,
    path: routes.accounts,
    name: "accounts",
    element: <Accounts />,
    route: Route,
  },
  {
    id: 105,
    path: routes.rolespermission,
    name: "rolespermission",
    element: <RolesPermissions />,
    route: Route,
  },
  {
    id: 106,
    path: routes.permissions,
    name: "permissions",
    element: <Permissions />,
    route: Route,
  },
  // {
  //   id: 107,
  //   path: routes.deleteaccount,
  //   name: "deleteaccount",
  //   element: <DeleteAccount />,
  //   route: Route,
  // },

  {
    id: 230,
    path: routes.formhorizontal,
    name: "formhorizontal",
    element: <FormHorizontal />,
    route: Route,
  },

  {
    id: 231,
    path: "/suppliers",
    name: "suppliers",
    element: <Suppliers />,
    route: Route,
  },

  {
    id: 232,
    path: "/product-list",
    name: "product-list",
    element: <ProductList />,
    route: Route,
  },
];

export const posPages = [
    {
    id: 25,
    path: routes.pos,
    name: "pos",
    element: <Pos />,
    route: Route,
  },
];

export const unAuthRoutes = [
  {
    id: 1,
    path: routes.login,
    name: "login",
    element: <Login />,
    route: Route,
  },
  {
    id: 3,
    path: routes.forgotpassword,
    name: "forgotpassword",
    element: <Forgotpassword />,
    route: Route,
  },
  // {
  //   id: 4,
  //   path: routes.resetpassword,
  //   name: "resetpassword",
  //   element: <Resetpassword />,
  //   route: Route,
  // },
  // {
  //   id: 5,
  //   path: routes.emailverification,
  //   name: "emailverification",
  //   element: <EmailVerification />,
  //   route: Route,
  // },
  // {
  //   id: 6,
  //   path: routes.twostepverification,
  //   name: "twostepverification",
  //   element: <Twostepverification />,
  //   route: Route,
  // },
  // {
  //   id: 7,
  //   path: routes.lockscreen,
  //   name: "lockscreen",
  //   element: <Lockscreen />,
  //   route: Route,
  // },
  // {
  //   id: 8,
  //   path: routes.error404,
  //   name: "error404",
  //   element: <Error404 />,
  //   route: Route,
  // },
  // {
  //   id: 9,
  //   path: routes.error500,
  //   name: "error500",
  //   element: <Error500 />,
  //   route: Route,
  // },
  // {
  //   id: 10,
  //   path: routes.comingsoon,
  //   name: "comingsoon",
  //   element: <Comingsoon />,
  //   route: Route,
  // },
  // {
  //   id: 11,
  //   path: routes.undermaintenance,
  //   name: "undermaintenance",
  //   element: <Undermaintainence />,
  //   route: Route,
  // },
  // {
  //   id: 12,
  //   path: routes.success,
  //   name: "success",
  //   element: <Success />,
  //   route: Route,
  // },
];
