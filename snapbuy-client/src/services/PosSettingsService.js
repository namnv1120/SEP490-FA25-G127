import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/pos-settings";

// Helper function để lấy headers với token
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

export const getPosSettings = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePosSettings = async (settings) => {
  try {
    const response = await axios.put(REST_API_BASE_URL, settings, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

