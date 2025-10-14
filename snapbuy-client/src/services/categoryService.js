import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/categories";

export const getAllCategories = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const tokenType = localStorage.getItem("authTokenType") || "Bearer";

    const response = await axios.get(REST_API_BASE_URL, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("❌ Failed to fetch categories:", error);
    throw error;
  }
};
