import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.REPORTS.CUSTOMERS;

// Lấy báo cáo khách hàng theo ngày
export const getDailyCustomerReport = async (date) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/daily?date=${date}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo khách hàng theo tháng
export const getMonthlyCustomerReport = async (year, month) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/monthly?year=${year}&month=${month}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo khách hàng theo năm
export const getYearlyCustomerReport = async (year) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/yearly?year=${year}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo khách hàng theo khoảng thời gian tùy chỉnh
export const getCustomCustomerReport = async (startDate, endDate) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/custom?startDate=${startDate}&endDate=${endDate}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
