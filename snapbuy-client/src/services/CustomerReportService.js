import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/reports/customers');

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

// Lấy báo cáo khách hàng theo ngày
export const getDailyCustomerReport = async (date) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/daily?date=${date}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy báo cáo khách hàng theo tháng
export const getMonthlyCustomerReport = async (year, month) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/monthly?year=${year}&month=${month}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy báo cáo khách hàng theo năm
export const getYearlyCustomerReport = async (year) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/yearly?year=${year}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy báo cáo khách hàng theo khoảng thời gian tùy chỉnh
export const getCustomCustomerReport = async (startDate, endDate) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/custom?startDate=${startDate}&endDate=${endDate}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

