import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dataLayout: localStorage.getItem("dataLayout") || "horizontal",
  dataWidth: localStorage.getItem("dataWidth") || "fluid",
  dataTheme: localStorage.getItem("dataTheme") || "light",
  dataTopBar: localStorage.getItem("dataTopBar") || "white",
  dataTopbarBg: localStorage.getItem("dataTopbarBg") || "",
  dataColor: localStorage.getItem("dataColor") || "primary",
  dataLoader: localStorage.getItem("dataLoader") || "enable",
  isRtl: localStorage.getItem("rtl") || false,
  headerCollapse: false,
  expandMenus: false,
};

const themeSettingSlice = createSlice({
  name: "themeSetting",
  initialState,
  reducers: {
    setHeaderCollapse: (state, { payload }) => {
      state.headerCollapse = payload;
    },
    setDataLayout: (state, action) => {
      state.dataLayout = action.payload;
      localStorage.setItem("dataLayout", action.payload);
      document.documentElement.setAttribute("data-layout", action.payload);
    },
    setDataWidth: (state, action) => {
      state.dataWidth = action.payload;
      localStorage.setItem("dataWidth", action.payload);
      document.documentElement.setAttribute("data-width", action.payload);
    },
    setDataTheme: (state, action) => {
      state.dataTheme = action.payload;
      localStorage.setItem("dataTheme", action.payload);
      document.documentElement.setAttribute("data-theme", action.payload);
    },
    setTopBarColor: (state, action) => {
      state.dataTopBar = action.payload;
      localStorage.setItem("dataTopBar", action.payload);
      document.documentElement.setAttribute("data-topbar", action.payload);
    },
    setDataTopbarBg: (state, action) => {
      state.dataTopbarBg = action.payload;
      localStorage.setItem("dataTopbarBg", action.payload);
      document.body.setAttribute("data-topbarbg", action.payload);
    },
    setDataColor: (state, action) => {
      state.dataColor = action.payload;
      localStorage.setItem("dataColor", action.payload);
      document.documentElement.setAttribute("data-color", action.payload);
    },
    setLoader: (state, action) => {
      state.dataLoader = action.payload;
      localStorage.setItem("dataLoader", action.payload);
      document.documentElement.setAttribute("data-loader", action.payload);
    },
    setRtl: (state, action) => {
      state.isRtl = action.payload;
      localStorage.setItem("rtl", action.payload);
      document.body.setAttribute("class", action.payload ? "rtl" : "");
    },
    resetAllMode: (state) => {
      state.dataLayout = "horizontal";
      state.dataWidth = "fluid";
      state.dataTheme = "light";
      state.dataTopBar = "white";
      state.dataTopbarBg = "";
      state.dataColor = "primary";
      state.dataLoader = "enable";
      state.isRtl = false;
      localStorage.setItem("dataLayout", "horizontal");
      localStorage.setItem("dataWidth", "fluid");
      localStorage.setItem("dataTheme", "light");
      localStorage.setItem("dataTopBar", "white");
      localStorage.setItem("dataTopbarBg", "");
      localStorage.setItem("dataColor", "primary");
      localStorage.setItem("dataLoader", "enable");
      localStorage.setItem("rtl", false);
    },
    setExpandMenu: (state, { payload }) => {
      state.expandMenus = payload;
    },
  },
});

export const {
  setDataLayout,
  setDataWidth,
  resetAllMode,
  setTopBarColor,
  setDataTheme,
  setDataTopbarBg,
  setHeaderCollapse,
  setDataColor,
  setLoader,
  setRtl,
  setExpandMenu,
} = themeSettingSlice.actions;

export default themeSettingSlice.reducer;