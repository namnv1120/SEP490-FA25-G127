import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/customers";

// Lấy danh sách khách hàng
export const getAllCustomers = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.get(REST_API_BASE_URL, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return (
      response.data?.result ||
      response.data?.customers ||
      response.data ||
      []
    );
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    throw error;
  }
};

// Lấy thông tin khách hàng theo ID
export const getCustomerById = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.get(`${REST_API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data?.result || response.data;
  } catch (error) {
    console.error("Failed to fetch customer by ID:", error);
    throw error;
  }
};

// Thêm khách hàng
export const createCustomer = async (customerData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.post(REST_API_BASE_URL, customerData, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data?.result || response.data;
  } catch (error) {
    console.error("Failed to create customer:", error);
    throw error;
  }
};

// Cập nhật khách hàng
export const updateCustomer = async (id, customerData) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      customerData,
      {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      }
    );

    return response.data?.result || response.data;
  } catch (error) {
    console.error("Failed to update customer:", error);
    throw error;
  }
};

// Xóa khách hàng
export const deleteCustomer = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    await axios.delete(`${REST_API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    throw error;
  }
};