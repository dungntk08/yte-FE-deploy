import api from '../../../api/axios';

export interface Supplier {
    Id: number;
    Code: string;
    Name: string;
    Phone?: string;
    Email?: string;
    Address?: string;
    TaxCode?: string;
    IsActive?: boolean;
    MedicalCenterId?: number | null;
}

export const getSuppliers = async (params?: { search?: string; page?: number; per_page?: number }) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
};

export const createSupplier = async (supplier: Partial<Supplier>) => {
    const response = await api.post('/suppliers', supplier);
    return response.data;
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
};

export const deleteSupplier = async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
};
