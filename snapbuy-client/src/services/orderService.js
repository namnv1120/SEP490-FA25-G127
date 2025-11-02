import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api/orders";

// Hàm lấy header có token
const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return { Authorization: `${tokenType} ${token}` };
};

const orderService = {
  getAllOrders: async () => {
    try {
      const res = await axios.get(REST_API_BASE_URL, {
        headers: getAuthHeader(),
      });
      return res.data.result;
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (id) => {
    try {
      const res = await axios.get(`${REST_API_BASE_URL}/${id}`, {
        headers: getAuthHeader(),
      });
      return res.data.result;
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const res = await axios.post(REST_API_BASE_URL, orderData, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      return res.data.result;
    } catch (error) {
      if (error.response) {
        console.error("📩 Backend trả về:", error.response.data);
      }
      console.error("Lỗi khi tạo đơn hàng:", error);
      throw error;
    }
  },

  // Đặt đơn hàng ở trạng thái “chờ” (hold)
  holdOrder: async (id) => {
    try {
      const res = await axios.post(
        `${REST_API_BASE_URL}/${id}/hold`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
      return res.data.result;
    } catch (error) {
      console.error("Lỗi khi giữ đơn hàng:", error);
      throw error;
    }
  },

  // Hoàn tất đơn hàng
  completeOrder: async (id) => {
    try {
      const res = await axios.post(
        `${REST_API_BASE_URL}/${id}/complete`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
      return res.data.result;
    } catch (error) {
      console.error("Lỗi khi hoàn tất đơn hàng:", error);
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (id) => {
    try {
      const res = await axios.post(
        `${REST_API_BASE_URL}/${id}/cancel`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
      return res.data.result;
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      throw error;
    }
  },
};

export default orderService;
