import api from '../../../api/axios';
import { Unit } from '../models/Unit';

export const getUnits = async (search?: string): Promise<Unit[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/units', { params });
    return response.data;
};

export const getUnit = async (id: string): Promise<Unit> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
};

export const createUnit = async (data: Partial<Unit>): Promise<Unit> => {
    const response = await api.post('/units', data);
    return response.data;
};

export const updateUnit = async (id: string, data: Partial<Unit>): Promise<Unit> => {
    const response = await api.put(`/units/${id}`, data);
    return response.data;
};

export const deleteUnit = async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
};
