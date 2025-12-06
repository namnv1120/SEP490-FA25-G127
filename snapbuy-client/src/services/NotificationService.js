import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.NOTIFICATIONS;

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";
  if (!token) throw new Error("Unauthorized: No token found");
  return { Authorization: `${tokenType} ${token}` };
};

/**
 * Get all notifications
 * @param {Object} params - Query parameters (page, size, type, isRead)
 * @returns {Promise} Notification list response
 */
export const getAllNotifications = async (params = {}) => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notifications count
 * @returns {Promise} Count of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${REST_API_BASE_URL}/unread-count`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Get recent notifications (for header dropdown)
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise} Recent notifications
 */
export const getRecentNotifications = async (limit = 5) => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params: { size: limit, page: 0 },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - ID of the notification
 * @returns {Promise} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/${notificationId}/read`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} Success response
 */
export const markAllAsRead = async () => {
  try {
    const response = await axios.put(
      `${REST_API_BASE_URL}/read-all`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {number} notificationId - ID of the notification
 * @returns {Promise} Success response
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${REST_API_BASE_URL}/${notificationId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Get low stock notifications
 * @returns {Promise} Low stock notifications
 */
export const getLowStockNotifications = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params: { type: "TON_KHO_THAP" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching low stock notifications:", error);
    throw error;
  }
};

/**
 * Get expiring promotion notifications
 * @returns {Promise} Expiring promotion notifications
 */
export const getExpiringPromotionNotifications = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params: { type: "KHUYEN_MAI_SAP_HET_HAN" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching expiring promotion notifications:", error);
    throw error;
  }
};

/**
 * Get expired promotion notifications
 * @returns {Promise} Expired promotion notifications
 */
export const getExpiredPromotionNotifications = async () => {
  try {
    const response = await axios.get(REST_API_BASE_URL, {
      headers: getAuthHeader(),
      params: { type: "KHUYEN_MAI_HET_HAN" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching expired promotion notifications:", error);
    throw error;
  }
};

/**
 * Trigger all notification checks (for testing/manual refresh)
 * @returns {Promise} Result of all checks
 */
export const triggerAllNotificationChecks = async () => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/trigger/all`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error triggering notification checks:", error);
    throw error;
  }
};
