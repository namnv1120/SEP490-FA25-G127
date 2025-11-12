// src/services/InventoryTransactionsService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/inventory-transactions";

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
  productCode = null,
  transactionType = "",
  referenceType = "",
  from = null,
  to = null,
}) => {
  try {
    console.groupCollapsed("GỬI REQUEST LẤY LỊCH SỬ GIAO DỊCH");
    console.log("Tham số:", { page, size, sort, dir, productName, productCode, transactionType, referenceType, from, to });
    console.groupEnd();

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (sort) params.append("sort", `${sort},${dir}`);

    if (productId) params.append("productId", productId);
    if (productName) params.append("productName", productName);
    if (productCode) params.append("productCode", productCode);
    if (transactionType) params.append("transactionType", transactionType);
    if (referenceType) params.append("referenceType", referenceType);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await axios.get(API_BASE_URL, {
      ...getAuthHeaders(),
      params,
    });

    const rawData = response.data;
    console.groupCollapsed("PHẢN HỒI TỪ BACKEND");
    console.log("Raw response:", rawData);
    console.groupEnd();

    let content = [];
    let totalElements = 0;
    let totalPages = 1;
    let number = page;
    let pageSize = size;

    // ƯU TIÊN: { code: 1000, result: [...] }
    if (rawData?.code === 1000 && Array.isArray(rawData.result)) {
      content = rawData.result;
      totalElements = content.length;
      console.log(`Dùng 'result' → ${content.length} giao dịch`);
    }
    // Spring Data chuẩn
    else if (rawData?.content && Array.isArray(rawData.content)) {
      content = rawData.content;
      totalElements = rawData.totalElements ?? content.length;
      totalPages = rawData.totalPages ?? 1;
      number = rawData.number ?? page;
      pageSize = rawData.size ?? size;
    }
    // Mảng trực tiếp
    else if (Array.isArray(rawData)) {
      content = rawData;
      totalElements = content.length;
    }
    // Không hợp lệ
    else {
      console.warn("Cấu trúc không hỗ trợ:", rawData);
      content = [];
      totalElements = 0;
    }

    console.groupCollapsed("DỮ LIỆU SAU CHUẨN HÓA");
    console.table(content);
    console.log("Tổng:", totalElements);
    console.groupEnd();

    return { content, totalElements, totalPages, number, size: pageSize };
  } catch (error) {
    console.error("Lỗi API:", error.response?.data || error);
    throw error;
  }
};