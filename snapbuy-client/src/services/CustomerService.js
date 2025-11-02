/* eslint-disable no-useless-catch */
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/customers";

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

const extractData = (data) => data?.result || data || [];

export const getAllCustomers = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return extractData(response.data);
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

export const getCustomerByPhone = async (phone) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/phone/${phone}`,
      getAuthHeaders()
    );

    if (response.data && response.data.result) {
      return [response.data.result];
    }
    return [];
  } catch (err) {
    console.error("Lỗi khi tìm khách hàng theo số điện thoại:", err);
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