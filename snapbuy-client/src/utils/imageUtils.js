import { box } from "./imagepath";

const API_BASE_URL = "http://localhost:8080";

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
