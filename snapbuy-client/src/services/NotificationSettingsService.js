import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.NOTIFICATION_SETTINGS;

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
    const response = await axios.put(
      REST_API_BASE_URL,
      settings,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};
