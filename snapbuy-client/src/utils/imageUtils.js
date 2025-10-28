const API_BASE_URL = "http://localhost:8080";

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

export const handleImageError = (e, fallbackImage) => {
  e.target.src = fallbackImage;
  e.target.onerror = null; 
};
