import axios from 'axios';

// API v2: Đơn vị hành chính sau sáp nhập tháng 7/2025 (34 tỉnh/thành)
// Sử dụng proxy để bypass CORS
const LOCATION_API_BASE_URL = '/provinces-api/api/v2';

/**
 * Lấy danh sách tất cả tỉnh/thành phố (34 tỉnh sau sáp nhập 7/2025)
 */
export const getProvinces = async () => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
    }
};

/**
 * Lấy danh sách phường/xã theo mã tỉnh (sau sáp nhập không còn cấp quận/huyện)
 * @param {number} provinceCode - Mã tỉnh/thành phố
 */
export const getWardsByProvince = async (provinceCode) => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/p/${provinceCode}?depth=2`);
        return response.data.wards || [];
    } catch (error) {
        console.error('Error fetching wards:', error);
        throw error;
    }
};
