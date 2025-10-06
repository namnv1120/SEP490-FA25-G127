import axios from 'axios';

const REST_API_BASE_URL = 'http://localhost:8080/api/roles-permissions';

export const listRolesPermissions = () => axios.get(REST_API_BASE_URL);

export const createRolePermission = (roleData) => axios.post(REST_API_BASE_URL, roleData);

export const getRolePermission = (id) => axios.get(REST_API_BASE_URL + '/' + id);
// Cập nhật role theo id
export const updateRolePermission = (id, updatedData) => axios.put(REST_API_BASE_URL + '/' + id, updatedData)
// Xóa role theo id
export const deleteRolePermission = (id) => axios.delete(REST_API_BASE_URL + '/' + id)