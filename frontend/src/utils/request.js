import { api } from "./api";

/**
 * Reusable request helper for clean and standardized API calls
 */
export const request = {
  get: async (url, params = {}, config = {}) => {
    try {
      const response = await api.get(url, { params, ...config });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message || "Terjadi kesalahan jaringan" };
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message || "Gagal mengirim data" };
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message || "Gagal memperbarui data" };
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message || "Gagal menghapus data" };
    }
  },

  upload: async (url, file, fieldName = "photo") => {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      const response = await api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message || "Gagal mengunggah file" };
    }
  },
};
