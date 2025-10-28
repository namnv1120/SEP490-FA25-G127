import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/payments/momo';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  const tokenType = localStorage.getItem('authTokenType') || 'Bearer';
  if (!token) throw new Error('Unauthorized: No token found');
  return { Authorization: `${tokenType} ${token}` };
};

export const createMomoPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${REST_API_BASE_URL}/create-payment`,
      paymentData,
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi tạo thanh toán MoMo.';
    console.error('MoMo Payment Error:', message);
    throw new Error(message);
  }
};

export const getMomoPaymentStatus = async (orderId) => {
  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/status/${orderId}`,
      { headers: getAuthHeader() }
    );
    return response.data.result || response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi kiểm tra trạng thái thanh toán MoMo.';
    console.error('MoMo Status Error:', message);
    throw new Error(message);
  }
};