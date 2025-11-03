import api from "./api"; // 👈 Import từ file api.js cùng thư mục

// ✅ Lấy tất cả categories
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// ✅ Tạo category mới
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// ✅ Xóa category
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// ✅ Cập nhật category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};