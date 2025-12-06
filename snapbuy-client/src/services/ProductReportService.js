import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.REPORTS.PRODUCTS;

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
