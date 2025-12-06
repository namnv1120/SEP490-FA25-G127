/* eslint-disable no-useless-catch */
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.SUPPLIERS;

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

export const toggleSupplierStatus = async (supplierId) => {
  try {
    const response = await axios.patch(
      `${REST_API_BASE_URL}/${supplierId}/toggle-status`,
      {},
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    console.error("❌ Lỗi khi chuyển đổi trạng thái nhà cung cấp:", error);
    throw error;
  }
};
