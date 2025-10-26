import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/customers";

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

export const getAllCustomers = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return (
      response.data?.result ||
      response.data?.customers ||
      response.data ||
      []
    );
  } catch (error) {
    console.error(" Lỗi khi lấy danh sách khách hàng:", error);
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
    console.error(" Lỗi khi lấy khách hàng theo ID:", error);
    throw error;
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/search?phone=${encodeURIComponent(phone)}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data || null;
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.error(" Lỗi khi tìm khách hàng theo số điện thoại:", error);
    throw error;
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
    console.error(" Lỗi khi tạo khách hàng:", error);
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
    console.error(" Lỗi khi cập nhật khách hàng:", error);
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
    console.error(" Lỗi khi xóa khách hàng:", error);
    throw error;
  }
};