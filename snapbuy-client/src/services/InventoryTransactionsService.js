// src/services/InventoryTransactionsService.js
import axios from "axios";
import { getApiUrl } from '../config/apiConfig';

const API_BASE_URL = getApiUrl('/api/inventory-transactions');

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

export const getTransactions = async ({
  page = 0,
  size = 10,
  sort = "transactionDate",
  dir = "DESC",
  productId = null,
  productName = null,
  transactionType = "",
  referenceType = "",
  from = null,
  to = null,
}) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    params.append("sort", sort);
    params.append("dir", dir);

    if (productId) params.append("productId", productId);
    if (productName && productName.trim()) params.append("productName", productName.trim());
    if (transactionType) params.append("transactionType", transactionType);
    if (referenceType) params.append("referenceType", referenceType);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await axios.get(API_BASE_URL, {
      ...getAuthHeaders(),
      params,
    });

    const rawData = response.data;
    let content = [];
    let totalElements = 0;
    let totalPages = 1;
    let number = page;
    let pageSize = size;

    // Xử lý ApiResponse<Page<InventoryTransactionResponse>>
    if (rawData?.result) {
      const pageData = rawData.result;
      if (pageData?.content && Array.isArray(pageData.content)) {
        content = pageData.content;
        totalElements = pageData.totalElements ?? 0;
        totalPages = pageData.totalPages ?? 1;
        number = pageData.number ?? page;
        pageSize = pageData.size ?? size;
      }
    }
    // Spring Data Page trực tiếp
    else if (rawData?.content && Array.isArray(rawData.content)) {
      content = rawData.content;
      totalElements = rawData.totalElements ?? 0;
      totalPages = rawData.totalPages ?? 1;
      number = rawData.number ?? page;
      pageSize = rawData.size ?? size;
    }
    // Mảng trực tiếp (fallback)
    else if (Array.isArray(rawData)) {
      content = rawData;
      totalElements = content.length;
    }
    else {
      console.warn("Cấu trúc không hỗ trợ:", rawData);
      content = [];
      totalElements = 0;
    }

    return { content, totalElements, totalPages, number, size: pageSize };
  } catch (error) {
    console.error("Lỗi API:", error.response?.data || error);
    throw error;
  }
};