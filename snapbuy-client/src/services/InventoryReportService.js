import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.REPORTS.INVENTORIES;

// Lấy báo cáo tồn kho theo ngày
export const getInventoryReportByDate = async (date) => {
    const response = await axios.get(
        `${REST_API_BASE_URL}?date=${date}`,
        getAuthHeaders()
    );
    return response.data?.result || response.data;
};
