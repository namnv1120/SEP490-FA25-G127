import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/reports/suppliers');

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

// Lấy báo cáo nhà cung cấp theo ngày
export const getDailySupplierReport = async (date) => {
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

// Lấy báo cáo nhà cung cấp theo tháng
export const getMonthlySupplierReport = async (year, month) => {
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

// Lấy báo cáo nhà cung cấp theo năm
export const getYearlySupplierReport = async (year) => {
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

// Lấy báo cáo nhà cung cấp theo khoảng thời gian tùy chỉnh
export const getCustomSupplierReport = async (startDate, endDate) => {
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

