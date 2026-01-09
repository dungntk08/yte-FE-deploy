import api from '../../../api/axios';
import { StockAlert, StockAlertStats, AlertType } from '../models/StockAlert';

interface GetAlertsParams {
    warehouse_id?: string;
    alert_type?: AlertType;
    is_resolved?: boolean;
    page?: number;
}

export const getStockAlerts = async (params?: GetAlertsParams) => {
    const response = await api.get('/inventory/alerts', { params });
    return response.data;
};

export const generateStockAlerts = async (): Promise<{ message: string; results: StockAlertStats }> => {
    const response = await api.post('/inventory/alerts/generate');
    return response.data;
};

export const resolveStockAlert = async (id: string, notes?: string): Promise<StockAlert> => {
    const response = await api.put(`/inventory/alerts/${id}/resolve`, {
        resolution_notes: notes
    });
    return response.data;
};

export const getFEFOBatches = async (warehouseId: string, productId: string, quantityNeeded: number) => {
    const response = await api.get('/inventory/fefo-batches', {
        params: {
            warehouse_id: warehouseId,
            product_id: productId,
            quantity_needed: quantityNeeded
        }
    });
    return response.data;
};

export const recordColdChainTemperature = async (data: {
    inventory_note_id: string;
    batch_id: string;
    temperature_recorded: number;
    notes?: string;
}) => {
    const response = await api.post('/inventory/cold-chain/record', data);
    return response.data;
};
