import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.REPORTS.SUPPLIERS;

// Lấy báo cáo nhà cung cấp theo ngày
export const getDailySupplierReport = async (date) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/daily?date=${date}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo nhà cung cấp theo tháng
export const getMonthlySupplierReport = async (year, month) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/monthly?year=${year}&month=${month}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo nhà cung cấp theo năm
export const getYearlySupplierReport = async (year) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/yearly?year=${year}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo nhà cung cấp theo khoảng thời gian tùy chỉnh
export const getCustomSupplierReport = async (startDate, endDate) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/custom?startDate=${startDate}&endDate=${endDate}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
