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
    console.groupCollapsed("📤 GỬI REQUEST LẤY LỊCH SỬ GIAO DỊCH");
    console.log("Tham số gửi lên API:", {
      page,
      size,
      sort,
      dir,
      productId,
      transactionType,
      from,
      to,
    });
    console.groupEnd();

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);

    if (sort) params.append("sort", `${sort},${dir}`);

    if (productId) params.append("productId", productId);
    if (transactionType) params.append("transactionType", transactionType);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await axios.get(API_BASE_URL, {
      ...getAuthHeaders(),
      params,
    });

    console.groupCollapsed("📥 PHẢN HỒI TỪ BACKEND");
    console.log("Response data:", response.data);
    console.groupEnd();

    const {
      content = [],
      totalElements = 0,
      totalPages = 0,
      number = 0,
      size: pageSize = size,
    } = response.data || {};

    console.groupCollapsed("✅ DỮ LIỆU SAU KHI CHUẨN HÓA");
    console.table(content);
    console.groupEnd();

    return {
      content,
      totalElements,
      totalPages,
      number,
      size: pageSize,
    };
  } catch (error) {
    console.error("❌ Lỗi khi tải lịch sử giao dịch:", error.response?.data || error);
    throw error;
  }
};