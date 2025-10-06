import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/users';

export const listUsers = () => axios.get(REST_API_BASE_URL);

export const createUser = (userData) => axios.post(REST_API_BASE_URL, userData);

export const getUser = (id) => axios.get(REST_API_BASE_URL + '/' + id);

export const updateUser = (id, updatedData) => axios.put(REST_API_BASE_URL + '/' + id, updatedData);

export const deleteUser = (id) => axios.delete(REST_API_BASE_URL + '/' + id);