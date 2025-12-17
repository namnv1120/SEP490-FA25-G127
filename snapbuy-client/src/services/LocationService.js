import axios from 'axios';

// Sử dụng backend proxy cho cả dev và production để tránh CORS
// Backend sẽ forward request đến 34tinhthanh.com (dữ liệu 34 tỉnh sau sáp nhập 7/2025)
const LOCATION_API_BASE_URL = '/api/locations';

/**
 * Lấy danh sách tất cả tỉnh/thành phố (34 tỉnh sau sáp nhập 7/2025)
 * Dữ liệu từ 34tinhthanh.com
 */
export const getProvinces = async () => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/provinces`);
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
 * Lấy danh sách phường/xã theo mã tỉnh
 * Sau sáp nhập 7/2025, không còn cấp huyện, chỉ còn Tỉnh → Xã
 * @param {string} provinceCode - Mã tỉnh/thành phố (ví dụ: "01" cho Hà Nội)
 */
export const getWardsByProvince = async (provinceCode) => {
    try {
        const response = await axios.get(`${LOCATION_API_BASE_URL}/wards/${provinceCode}`);
        const wards = response.data;

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
