import api from '../../../api/axios';

export const getProducts = async (page = 1, search = '', typeId = 0) => {
    let url = `/products?page=${page}&search=${search}`;
    if (typeId > 0) url += `&type_id=${typeId}`;
    const response = await api.get(url);
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
};

export const updateProduct = async (id: number, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string | number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getUnits = async () => {
    try {
        const response = await api.get('/units');
        return response.data;
    } catch {
        return [];
    }
};

export const downloadSampleProductFile = async (typeId: number) => {
    const response = await api.get(`/products/download-sample?type=${typeId}`, {
        responseType: 'blob',
    });

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Infer filename from header or use default
    // Cannot easily access Content-Disposition from axios wrapper sometimes if CORS exposes it or not
    // But let's use a safe fallback
    const names: { [key: number]: string } = { 1: 'thuoc', 2: 'vat_tu', 3: 'vac_xin', 5: 'hoa_chat' };
    const name = names[typeId] || 'san_pham';
    link.setAttribute('download', `mau_import_${name}.csv`);

    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const importProducts = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/products/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const exportProducts = async () => {
    const response = await api.get('/products/export', {
        responseType: 'blob',
    });
    return response.data;
};

export const getProductById = async (id: string | number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};


