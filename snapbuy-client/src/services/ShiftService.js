/* eslint-disable no-useless-catch */
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.POS_SHIFTS;

export const getCurrentShift = async () => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/current`,
      getAuthHeaders()
    );
    return response.data?.result || response.data || null;
  } catch (error) {
    throw error;
  }
};

export const openShift = async (initialCash, cashDenominations = []) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/open`,
      { initialCash, cashDenominations },
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const openShiftForEmployee = async (
  employeeAccountId,
  initialCash,
  cashDenominations = []
) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/open-for-employee`,
      { employeeAccountId, initialCash, cashDenominations },
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const closeShift = async (closingCash, note, cashDenominations) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/close`,
      { closingCash, note, cashDenominations },
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const closeShiftForEmployee = async (
  employeeAccountId,
  closingCash,
  note,
  cashDenominations = []
) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/close-for-employee`,
      { employeeAccountId, closingCash, note, cashDenominations },
      getAuthHeaders()
    );
    return response.data?.result || response.data;
  } catch (error) {
    throw error;
  }
};

export const isShiftOpen = async () => {
  try {
    const current = await getCurrentShift();
    return !!(current && current.status === "Mở");
  } catch (error) {
    throw error;
  }
};

export const getMyShifts = async (status) => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/my`, {
      ...getAuthHeaders(),
      params: status ? { status } : {},
    });
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const getShiftsByAccountId = async (accountId, status) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/by-account/${accountId}`,
      {
        ...getAuthHeaders(),
        params: status ? { status } : {},
      }
    );
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const getAllActiveShifts = async () => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/active`,
      getAuthHeaders()
    );
    return response.data?.result || response.data || [];
  } catch (error) {
    throw error;
  }
};
