import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/pos-shifts";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized");
  return { Authorization: `${tokenType} ${token}` };
};

export const getCurrentShift = async () => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/current`, {
      headers: getAuthHeader(),
    });
    const result = response.data.result || response.data;
    if (!result || !result.status) {
      const data = localStorage.getItem("posShiftState");
      return data ? JSON.parse(data) : null;
    }
    return result;
  } catch (error) {
    const data = localStorage.getItem("posShiftState");
    return data ? JSON.parse(data) : null;
  }
};

export const openShift = async (initialCash) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/open`,
      { initialCash },
      { headers: getAuthHeader() }
    );
    const result = response.data.result || response.data;
    localStorage.setItem("posShiftState", JSON.stringify(result));
    return result;
  } catch (error) {
    const state = {
      shiftId: `local-${Date.now()}`,
      initialCash,
      openedAt: new Date().toISOString(),
      status: "Mở",
    };
    localStorage.setItem("posShiftState", JSON.stringify(state));
    return state;
  }
};

export const closeShift = async (closingCash) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/close`,
      { closingCash },
      { headers: getAuthHeader() }
    );
    const result = response.data.result || response.data;
    localStorage.setItem("posShiftState", JSON.stringify(result));
    return result;
  } catch (error) {
    const data = localStorage.getItem("posShiftState");
    const parsed = data ? JSON.parse(data) : null;
    const state = parsed
      ? { ...parsed, closingCash, closedAt: new Date().toISOString(), status: "Đóng" }
      : { closingCash, closedAt: new Date().toISOString(), status: "Đóng" };
    localStorage.setItem("posShiftState", JSON.stringify(state));
    return state;
  }
};

export const isShiftOpen = async () => {
  try {
    const local = localStorage.getItem("posShiftState");
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.status === "Mở") return true;
    }
  } catch {}
  const current = await getCurrentShift();
  return current && current.status === "Mở";
};
