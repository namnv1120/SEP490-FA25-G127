/* eslint-disable no-useless-catch */
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.PRODUCT_PRICES;

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
