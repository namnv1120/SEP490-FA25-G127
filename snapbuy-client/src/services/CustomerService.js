import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.CUSTOMERS;

export const getAllCustomers = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi lấy khách hàng theo ID:", error);
    throw error;
  }
};

export const searchCustomers = async (keyword) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/search`, {
      ...getAuthHeaders(),
      params: { keyword },
    });
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    return [];
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      customerData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tạo khách hàng:", error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      customerData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật khách hàng:", error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi xóa khách hàng:", error);
    throw error;
  }
};

export const toggleCustomerStatus = async (id) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}/status`,
      {},
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái khách hàng:", error);
    throw error;
  }
};
