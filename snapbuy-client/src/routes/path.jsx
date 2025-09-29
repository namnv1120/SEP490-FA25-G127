import { Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import { all_routes } from "./all_routes";
// import { Units } from "../feature-module/inventory/units";
// import StoreList from "../feature-module/people/store-list";
// import Warehouse from "../feature-module/people/warehouse";

// import Apexchart from "../feature-module/uiinterface/charts/apexcharts";
// import ChartJs from "../feature-module/uiinterface/charts/chartjs";
// import FloatingLabel from "../feature-module/uiinterface/forms/formelements/layouts/floating-label";
import FormHorizontal from "../feature-module/uiinterface/forms/formelements/layouts/form-horizontal";
// import FormSelect2 from "../feature-module/uiinterface/forms/formelements/layouts/form-select2";
// import FormValidation from "../feature-module/uiinterface/forms/formelements/layouts/form-validation";
// import FormVertical from "../feature-module/uiinterface/forms/formelements/layouts/form-vertical";
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

const Dashboard = lazy(() => import("../feature-module/dashboard/dashboard"));

const routes = all_routes;

export const authRoutes = [
  {
    id: 1,
    path: routes.dashboard,
    name: "home",
    element: <Dashboard />,
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
  // {
  //   id: 25,
  //   path: routes.pos,
  //   name: "pos",
  //   element: <Pos />,
  //   route: Route,
  // },
  // {
  //   id: 26,
  //   path: routes.pos2,
  //   name: "pos-2",
  //   element: <Pos2 />,
  //   route: Route,
  // },
  // {
  //   id: 27,
  //   path: routes.pos3,
  //   name: "pos-3",
  //   element: <Pos3 />,
  //   route: Route,
  // },
  // {
  //   id: 28,
  //   path: routes.pos4,
  //   name: "pos-4",
  //   element: <Pos4 />,
  //   route: Route,
  // },
  // {
  //   id: 29,
  //   path: routes.pos5,
  //   name: "pos-5",
  //   element: <Pos5 />,
  //   route: Route,
  // },
];
export const unAuthRoutes = [
  // {
  //   id: 1,
  //   path: routes.signin,
  //   name: "signin",
  //   element: <Signin />,
  //   route: Route,
  // },
  // {
  //   id: 2,
  //   path: routes.signintwo,
  //   name: "signintwo",
  //   element: <SigninTwo />,
  //   route: Route,
  // },
  // {
  //   id: 3,
  //   path: routes.signinthree,
  //   name: "signinthree",
  //   element: <SigninThree />,
  //   route: Route,
  // },
  // {
  //   id: 4,
  //   path: routes.register,
  //   name: "register",
  //   element: <Register />,
  //   route: Route,
  // },
  // {
  //   id: 5,
  //   path: routes.registerTwo,
  //   name: "registerTwo",
  //   element: <RegisterTwo />,
  //   route: Route,
  // },
  // {
  //   id: 6,
  //   path: routes.registerThree,
  //   name: "registerThree",
  //   element: <RegisterThree />,
  //   route: Route,
  // },
  // {
  //   id: 7,
  //   path: routes.forgotPassword,
  //   name: "forgotPassword",
  //   element: <Forgotpassword />,
  //   route: Route,
  // },
  // {
  //   id: 7,
  //   path: routes.forgotPasswordTwo,
  //   name: "forgotPasswordTwo",
  //   element: <ForgotpasswordTwo />,
  //   route: Route,
  // },
  // {
  //   id: 8,
  //   path: routes.forgotPasswordThree,
  //   name: "forgotPasswordThree",
  //   element: <ForgotpasswordThree />,
  //   route: Route,
  // },
  // {
  //   id: 9,
  //   path: routes.resetpassword,
  //   name: "resetpassword",
  //   element: <Resetpassword />,
  //   route: Route,
  // },
  // {
  //   id: 10,
  //   path: routes.resetpasswordTwo,
  //   name: "resetpasswordTwo",
  //   element: <ResetpasswordTwo />,
  //   route: Route,
  // },
  // {
  //   id: 11,
  //   path: routes.resetpasswordThree,
  //   name: "resetpasswordThree",
  //   element: <ResetpasswordThree />,
  //   route: Route,
  // },
  // {
  //   id: 12,
  //   path: routes.emailverification,
  //   name: "emailverification",
  //   element: <EmailVerification />,
  //   route: Route,
  // },
  // {
  //   id: 12,
  //   path: routes.emailverificationTwo,
  //   name: "emailverificationTwo",
  //   element: <EmailverificationTwo />,
  //   route: Route,
  // },
  // {
  //   id: 13,
  //   path: routes.emailverificationThree,
  //   name: "emailverificationThree",
  //   element: <EmailverificationThree />,
  //   route: Route,
  // },
  // {
  //   id: 14,
  //   path: routes.twostepverification,
  //   name: "twostepverification",
  //   element: <Twostepverification />,
  //   route: Route,
  // },
  // {
  //   id: 15,
  //   path: routes.twostepverificationTwo,
  //   name: "twostepverificationTwo",
  //   element: <TwostepverificationTwo />,
  //   route: Route,
  // },
  // {
  //   id: 16,
  //   path: routes.twostepverificationThree,
  //   name: "twostepverificationThree",
  //   element: <TwostepverificationThree />,
  //   route: Route,
  // },
  // {
  //   id: 17,
  //   path: routes.lockscreen,
  //   name: "lockscreen",
  //   element: <Lockscreen />,
  //   route: Route,
  // },
  // {
  //   id: 18,
  //   path: routes.error404,
  //   name: "error404",
  //   element: <Error404 />,
  //   route: Route,
  // },
  // {
  //   id: 19,
  //   path: routes.error500,
  //   name: "error500",
  //   element: <Error500 />,
  //   route: Route,
  // },
  // {
  //   id: 20,
  //   path: routes.comingsoon,
  //   name: "comingsoon",
  //   element: <Comingsoon />,
  //   route: Route,
  // },
  // {
  //   id: 21,
  //   path: routes.undermaintenance,
  //   name: "undermaintenance",
  //   element: <Undermaintainence />,
  //   route: Route,
  // },
  // {
  //   id: 22,
  //   path: routes.success,
  //   name: "success",
  //   element: <Success />,
  //   route: Route,
  // },
  // {
  //   id: 23,
  //   path: routes.successTwo,
  //   name: "success-2",
  //   element: <SuccessTwo />,
  //   route: Route,
  // },
  // {
  //   id: 24,
  //   path: routes.successThree,
  //   name: "success-3",
  //   element: <SuccessThree />,
  //   route: Route,
  // },
];
