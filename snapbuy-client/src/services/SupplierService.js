/* eslint-disable no-useless-catch */
import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/suppliers";

// Helper function để lấy headers với token
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

export const getAllSuppliers = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const getSupplierById = async (supplierId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${supplierId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      supplierData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${supplierId}`,
      supplierData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSupplier = async (supplierId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${supplierId}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};