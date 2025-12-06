import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.REVENUE;

// Lấy doanh thu theo ngày
export const getDailyRevenue = async (date) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/daily?date=${date}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy doanh thu theo tháng
export const getMonthlyRevenue = async (year, month) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/monthly?year=${year}&month=${month}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy doanh thu theo năm
export const getYearlyRevenue = async (year) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/yearly?year=${year}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy doanh thu theo khoảng thời gian tùy chỉnh
export const getCustomRevenue = async (startDate, endDate) => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/custom?startDate=${startDate}&endDate=${endDate}`,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};

// Lấy báo cáo doanh thu sản phẩm
export const getProductRevenue = async (fromDate, toDate, accountId = null) => {
  const encodedFrom = encodeURIComponent(fromDate);
  const encodedTo = encodeURIComponent(toDate);
  let url = `${API_ENDPOINTS.REPORTS.PRODUCTS_REVENUE}?from=${encodedFrom}&to=${encodedTo}`;
  if (accountId) {
    url += `&accountId=${accountId}`;
  }
  const response = await axios.get(url, getAuthHeaders());
  return response.data?.result || response.data;
};
