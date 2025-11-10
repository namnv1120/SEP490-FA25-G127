import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/revenue";

// Hàm lấy header có token
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

// Lấy doanh thu theo ngày
export const getDailyRevenue = async (date) => {
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

// Lấy doanh thu theo tháng
export const getMonthlyRevenue = async (year, month) => {
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

// Lấy doanh thu theo năm
export const getYearlyRevenue = async (year) => {
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

// Lấy doanh thu theo khoảng thời gian tùy chỉnh
export const getCustomRevenue = async (startDate, endDate) => {
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

