import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.POS_SETTINGS;

export const getPosSettings = async () => {
  const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
  return response.data?.result || response.data;
};

export const updatePosSettings = async (settings) => {
  const response = await axios.put(
    REST_API_BASE_URL,
    settings,
    getAuthHeaders()
  );
  return response.data?.result || response.data;
};
