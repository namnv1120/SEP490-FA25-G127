/* eslint-disable no-useless-catch */
import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/customers');

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
  };
};

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
    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi lấy khách hàng theo ID:", error);
    throw error;
  }
};

export const searchCustomers = async (keyword) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/search`,
      {
        ...getAuthHeaders(),
        params: { keyword }
      }
    );
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    return [];
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(REST_API_BASE_URL, customerData, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi tạo khách hàng:", error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(`${REST_API_BASE_URL}/${id}`, customerData, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật khách hàng:", error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(`${REST_API_BASE_URL}/${id}`, getAuthHeaders());
    return response.data?.result || response.data;
  } catch (error) {
    console.error("Lỗi khi xóa khách hàng:", error);
    throw error;
  }
};