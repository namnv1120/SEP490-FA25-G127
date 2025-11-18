/* eslint-disable no-useless-catch */
import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const REST_API_BASE_URL = getApiUrl('/api/product-prices');

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

export const getAllProductPrices = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, getAuthHeaders());
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const deleteProductPrice = async (id) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const createProductPrice = async (productPriceData) => {
  try {
    const response = await axios.post(
      REST_API_BASE_URL,
      productPriceData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProductPrice = async (id, productPriceData) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${id}`,
      productPriceData,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductPriceById = async (id) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const importProductPrices = async (prices) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/import`,
      prices,
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};