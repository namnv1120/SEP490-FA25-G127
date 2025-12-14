import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

/**
 * Service for admin system analytics
 */
class AdminAnalyticsService {
  /**
   * Get system metrics (CPU, RAM, Disk, Uptime)
   */
  static async getSystemMetrics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/system/metrics`);
      return response.data;
    } catch (error) {
      console.error('AdminAnalyticsService.getSystemMetrics error:', error);
      throw error;
    }
  }
}

export default AdminAnalyticsService;
