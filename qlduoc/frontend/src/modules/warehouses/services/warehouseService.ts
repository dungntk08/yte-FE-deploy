import api from '../../../api/axios';
import { Warehouse } from '../models/Warehouse';

export const getWarehouses = async () => {
    const response = await api.get('/warehouses');
    return response.data;
};

export const createWarehouse = async (data: any): Promise<Warehouse> => {
    const response = await api.post('/warehouses', data);
    return response.data;
};

export const updateWarehouse = async (id: number, data: any): Promise<Warehouse> => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
};

export const deleteWarehouse = async (id: number): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
};

export const getHealthPosts = async (): Promise<any[]> => {
    const response = await api.get('/health-posts');
    return response.data;
};

// Permission / User Management
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const getWarehouseUsers = async (warehouseId: number | string) => {
    const response = await api.get(`/warehouses/${warehouseId}/users`);
    return response.data;
};

export const assignUserToWarehouse = async (warehouseId: number | string, userId: number | string) => {
    const response = await api.post(`/warehouses/${warehouseId}/users`, { user_id: userId });
    return response.data;
};

export const removeUserFromWarehouse = async (warehouseId: number | string, userId: number | string) => {
    await api.delete(`/warehouses/${warehouseId}/users/${userId}`);
};
