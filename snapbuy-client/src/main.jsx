import React, { Suspense, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./core/redux/store.js";
import AppRouter from "./AppRouter.jsx";
import SplashScreen from "./components/splash-screen/SplashScreen.jsx";
import PageLoader from "./components/loading/PageLoader.jsx";
import "./utils/axiosConfig.js"; // Import axios interceptor config
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./assets/icons/tabler-icons/tabler-icons.min.css";
import "./assets/icons/feather/css/iconfont.css";
import "./assets/css/feather.css";
import "./assets/icons/boxicons/css/boxicons.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./customStyle.scss";
import "antd/dist/reset.css";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Provider store={store}>
      <Suspense fallback={<PageLoader />}>
        <AppRouter />
      </Suspense>
    </Provider>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
