import { box } from "./imagepath";
import { API_BASE_URL } from "../services/apiConfig";

export const getImageUrl = (imageUrl) => {
  // Nếu imageUrl null, trống hoặc chỉ có khoảng trắng, trả về ảnh mặc định từ assets
  if (!imageUrl || !imageUrl.trim()) {
    return box;
  }

  // Nếu là URL đầy đủ (http/https), trả về trực tiếp
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Nếu là đường dẫn tương đối, thêm base URL
  return `${API_BASE_URL}${imageUrl}`;
};

export const handleImageError = (e, fallbackImage) => {
  e.target.src = fallbackImage;
  e.target.onerror = null;
};
