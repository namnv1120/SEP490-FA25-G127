import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/notification-settings";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getNotificationSettings = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    throw error;
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await axios.put(REST_API_BASE_URL, settings, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};



