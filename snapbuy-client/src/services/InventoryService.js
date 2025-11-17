import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/inventories');

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



