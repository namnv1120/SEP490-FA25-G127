// src/services/InventoryTransactionService.js
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
  transactionType = "",
  from = null,
  to = null,
}) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    params.append("sort", `${sort},${dir}`);

    if (productId) params.append("productId", productId);
    if (transactionType) params.append("transactionType", transactionType);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await axios.get(API_BASE_URL, {
      ...getAuthHeaders(),
      params,
    });

    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      number: response.data.number || 0,
      size: response.data.size || size,
    };
  } catch (error) {
    console.error("Lỗi khi tải lịch sử giao dịch:", error.response?.data || error);
    throw error;
  }
};