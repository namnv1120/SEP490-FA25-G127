import React from "react";
import { Outlet } from "react-router-dom";
import TopHeader from "./TopHeader";
import MainMenu from "./MainMenu";
import "../../styles/Layout.css";

const Layout = () => {
  return (
    <div className="app-layout">
      {/* Thanh trên cùng */}
      <TopHeader />

      {/* Menu ngang */}
      <MainMenu />

      {/* Nội dung chính */}
      <main className="layout-content p-3">
        <Outlet /> {/* nơi hiển thị nội dung từng page */}
      </main>
    </div>
  );
};

export default Layout;
