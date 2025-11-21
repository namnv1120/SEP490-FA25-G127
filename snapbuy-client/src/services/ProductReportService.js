import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/reports/products";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Lấy báo cáo sản phẩm theo ngày
export const getDailyProductReport = async (date) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/daily?date=${date}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo sản phẩm theo tháng
export const getMonthlyProductReport = async (year, month) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/monthly?year=${year}&month=${month}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo sản phẩm theo năm
export const getYearlyProductReport = async (year) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/yearly?year=${year}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo sản phẩm theo khoảng thời gian tùy chỉnh
export const getCustomProductReport = async (startDate, endDate) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/custom?startDate=${startDate}&endDate=${endDate}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
