import axios from "axios";

const API_URL = "http://localhost:8080/api/customers";

const customerService = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
  getByCode: async (code) => {
    const res = await axios.get(`${API_URL}/${code}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },
  update: async (code, data) => {
    const res = await axios.put(`${API_URL}/${code}`, data);
    return res.data;
  },
  delete: async (code) => {
    await axios.delete(`${API_URL}/${code}`);
    return true;
  },
};

export default customerService;
