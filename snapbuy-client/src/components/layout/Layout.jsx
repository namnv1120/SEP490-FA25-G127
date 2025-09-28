import React from "react";
import TopHeader from "./TopHeader";
import MainMenu from "./MainMenu";
//import "../../styles/Layout.css"; // tuỳ chọn, nếu bạn có style riêng

const Layout = ({ children }) => {
  return (
    <div
      className="app-layout d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      {/* Thanh header phía trên */}
      <TopHeader />

      {/* Menu chính dưới header */}
      <MainMenu />

      {/* Khu vực nội dung động */}
      <div className="flex-grow-1 p-3 bg-light">{children}</div>
    </div>
  );
};

export default Layout;
