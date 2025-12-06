import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.INVENTORIES;

export const getAllInventories = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kho", error);
    throw error;
  }
};

export const updateInventory = async (inventoryId, inventoryData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${inventoryId}`,
      inventoryData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật kho", error);
    throw error;
  }
};
