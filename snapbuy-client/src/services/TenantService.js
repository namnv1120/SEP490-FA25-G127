import axios from "axios";

/**
 * Service để kiểm tra và quản lý tenant
 */
class TenantService {
  /**
   * Kiểm tra tenant có tồn tại không
   * @param {string} tenantSlug - Tenant code từ subdomain
   * @returns {Promise} - Tenant info hoặc error
   */
  static async validateTenant(tenantSlug) {
    try {
      console.log(`🌐 Validating tenant: ${tenantSlug}`);
      const response = await axios.get(`/api/tenants/validate/${tenantSlug}`);
      console.log('📡 Validation response:', response.data);

      // Backend trả về: { code: 1000, message: "...", result: { tenantId, tenantCode, ... } }
      // Code 1000 = success
      if (response.data.result) {
        console.log('✅ Tenant valid:', response.data.result);
        return {
          success: true,
          data: response.data.result,
        };
      } else {
        console.log('❌ Tenant invalid:', response.data.message);
        return {
          success: false,
          error: response.data.message || "Tenant không hợp lệ",
        };
      }
    } catch (error) {
      console.error("❌ TenantService.validateTenant error:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || "Tenant không tồn tại",
      };
    }
  }

  /**
   * Lấy thông tin tenant
   * @param {string} tenantSlug - Tenant code
   */
  static async getTenantInfo(tenantSlug) {
    try {
      const response = await axios.get(`/api/tenants/${tenantSlug}/info`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy cấu hình tenant (logo, màu sắc, tên cửa hàng, ...)
   */
  static async getTenantConfig(tenantSlug) {
    try {
      const response = await axios.get(`/api/tenants/${tenantSlug}/config`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ========== ADMIN METHODS ==========

  /**
   * Lấy tất cả tenants (Admin only)
   */
  static async getAllTenants() {
    try {
      const response = await axios.get('/api/tenants/admin/all');
      return response.data;
    } catch (error) {
      console.error('TenantService.getAllTenants error:', error);
      throw error;
    }
  }

  /**
   * Tạo tenant mới (Admin only)
   */
  static async createTenant(tenantData) {
    try {
      const response = await axios.post('/api/tenants/admin', tenantData);
      return response.data;
    } catch (error) {
      console.error('TenantService.createTenant error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái tenant (Admin only)
   */
  static async updateTenantStatus(tenantId, isActive) {
    try {
      const response = await axios.patch(
        `/api/tenants/admin/${tenantId}/status`,
        null,
        { params: { isActive } }
      );
      return response.data;
    } catch (error) {
      console.error('TenantService.updateTenantStatus error:', error);
      throw error;
    }
  }

  /**
   * Xóa tenant (Admin only)
   */
  static async deleteTenant(tenantId) {
    try {
      const response = await axios.delete(`/api/tenants/admin/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('TenantService.deleteTenant error:', error);
      throw error;
    }
  }
}

export default TenantService;
