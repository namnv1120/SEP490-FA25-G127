import axios from "axios";

const API_BASE = "http://localhost:8080/api/customers"; // URL backend Spring Boot

const customerService = {
  getAll: async () => {
    const res = await axios.get(API_BASE);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axios.post(API_BASE, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
    return true;
  },
};

export default customerService;
