import { saveAs } from "file-saver";
import axios from "axios";
import { API_ENDPOINTS } from "../services/apiConfig";

const REST_API_BASE_URL = API_ENDPOINTS.PRODUCTS;

// Hàm lấy header kèm token
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  const tokenType = localStorage.getItem("authTokenType") || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  };
};

/**
 * Tạo barcode ngẫu nhiên (dãy số)
 * @param {number} length - Độ dài của barcode (mặc định 13)
 * @returns {string} - Barcode ngẫu nhiên
 */
export const generateRandomBarcode = (length = 13) => {
  // Tạo dãy số ngẫu nhiên
  let barcode = "";
  for (let i = 0; i < length; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  return barcode;
};

/**
 * Lấy barcode image từ backend
 * @param {string} barcode - Barcode string
 * @param {number} width - Width của barcode image (mặc định 300)
 * @param {number} height - Height của barcode image (mặc định 100)
 * @returns {Promise<string>} - Data URL của barcode image
 */
export const getBarcodeImageFromBackend = async (
  barcode,
  width = 300,
  height = 100
) => {
  if (!barcode || barcode.trim().length === 0) {
    return null;
  }

  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/barcode-image/${encodeURIComponent(
        barcode
      )}?width=${width}&height=${height}`,
      {
        ...getAuthHeaders(),
        responseType: "blob",
      }
    );

    // Chuyển blob thành data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error("Error getting barcode image from backend:", error);
    return null;
  }
};

/**
 * Download barcode image với tên file tiếng Việt
 * @param {string} barcode - Barcode string
 * @param {string} productName - Tên sản phẩm (để đặt tên file)
 * @param {number} width - Width của barcode image
 * @param {number} height - Height của barcode image
 */
export const downloadBarcode = async (
  barcode,
  productName = "SanPham",
  width = 300,
  height = 100
) => {
  if (!barcode || barcode.trim().length === 0) {
    throw new Error("Barcode không được để trống");
  }

  try {
    const response = await axios.get(
      `${REST_API_BASE_URL}/barcode-image/${encodeURIComponent(
        barcode
      )}?width=${width}&height=${height}`,
      {
        ...getAuthHeaders(),
        responseType: "blob",
      }
    );

    // Tạo tên file tiếng Việt
    const sanitizedProductName = productName
      .replace(
        /[^a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ]/g,
        ""
      )
      .replace(/\s+/g, "_")
      .trim();

    const fileName = `Ma_Vach_${sanitizedProductName}_${barcode}.png`;

    // Download file
    saveAs(response.data, fileName);
  } catch (error) {
    console.error("Error downloading barcode:", error);
    throw new Error("Không thể tải barcode");
  }
};

/**
 * Tạo và hiển thị barcode preview từ backend
 * @param {string} barcode - Barcode string
 * @param {string} containerId - ID của container để hiển thị
 * @param {number} width - Width của barcode image
 * @param {number} height - Height của barcode image
 */
export const displayBarcodePreview = async (
  barcode,
  containerId,
  width = 300,
  height = 100
) => {
  if (!barcode || barcode.trim().length === 0) {
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // Clear container và hiển thị loading
  container.innerHTML =
    '<div class="text-center"><small class="text-muted">Đang tải barcode...</small></div>';

  try {
    const imageDataUrl = await getBarcodeImageFromBackend(
      barcode,
      width,
      height
    );

    if (!imageDataUrl) {
      container.innerHTML =
        '<p class="text-danger small">Không thể tải barcode</p>';
      return;
    }

    // Tạo img element
    const img = document.createElement("img");
    img.src = imageDataUrl;
    img.alt = `Barcode: ${barcode}`;
    img.style.maxWidth = "100%";
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "0 auto";
    img.style.objectFit = "contain";
    img.className = "barcode-preview-image";

    // Clear và thêm image
    container.innerHTML = "";
    container.appendChild(img);
  } catch (error) {
    console.error("Error displaying barcode:", error);
    container.innerHTML =
      '<p class="text-danger small">Không thể hiển thị barcode</p>';
  }
};
