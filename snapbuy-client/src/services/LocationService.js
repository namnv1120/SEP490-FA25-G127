import axios from 'axios';

// API v2: Đơn vị hành chính sau sáp nhập tháng 7/2025 (34 tỉnh/thành)
// Dev: dùng proxy để bypass CORS
// Production: gọi trực tiếp API (CORS đã được enable từ server)
const LOCATION_API_BASE_URL = import.meta.env.DEV
    ? '/provinces-api/api/v2'  // Dev mode: dùng Vite proxy
    : 'https://provinces.open-api.vn/api/v2';  // Production: gọi trực tiếp

/**
 * Lấy danh sách tất cả tỉnh/thành phố (34 tỉnh sau sáp nhập 7/2025)
 */
export const getProvinces = async () => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/`);
        const data = response.data;

        // Đảm bảo trả về array
        if (!Array.isArray(data)) {
            console.error('Provinces API response is not an array:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        return []; // Trả về empty array thay vì throw
    }
};

/**
 * Lấy danh sách phường/xã theo mã tỉnh (sau sáp nhập không còn cấp quận/huyện)
 * @param {number} provinceCode - Mã tỉnh/thành phố
 */
export const getWardsByProvince = async (provinceCode) => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/p/${provinceCode}?depth=2`);
        const wards = response.data?.wards;

        // Đảm bảo trả về array
        if (!Array.isArray(wards)) {
            console.error('Wards API response is not an array:', response.data);
            return [];
        }

        return wards;
    } catch (error) {
        console.error('Error fetching wards:', error);
        return []; // Trả về empty array thay vì throw
    }
};
