import api from '../../../api/axios';

export const importOpeningStock = async (warehouseId: string, file: File) => {
    const formData = new FormData();
    formData.append('warehouse_id', warehouseId);
    formData.append('file', file);

    const response = await api.post('/inventory/opening-stock', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Manual Import from Supplier
export const createStockVoucher = async (data: any) => {
    const response = await api.post('/stock-vouchers', data);
    return response.data;
};

// Deprecated or alias
export const createImportNote = createStockVoucher;

export const createOpeningStockManual = async (data: any) => {
    // Post to the dedicated opening stock endpoint which now expects PascalCase
    const response = await api.post('/inventory/opening-stock/manual', data);
    return response.data;
};

export const parseOpeningStock = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inventory/opening-stock/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const downloadSample = async () => {
    const response = await api.get('/inventory/opening-stock/sample', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_nhap_ton_dau.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getAllProductsForOpeningStock = async () => {
    const response = await api.get('/inventory/opening-stock/products-all');
    return response.data;
};
