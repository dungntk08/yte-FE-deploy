export type AlertType = 'low_stock' | 'near_expiry' | 'expired' | 'over_stock';

export interface StockAlert {
    id: string;
    warehouse_id: string;
    product_id: string;
    batch_id?: string | null;
    alert_type: AlertType;
    current_quantity: number;
    threshold_quantity?: number | null;
    expiry_date?: string | null;
    days_to_expiry?: number | null;
    is_resolved: boolean;
    resolved_at?: string | null;
    resolved_by?: string | null;
    resolution_notes?: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    warehouse?: any;
    product?: any;
    batch?: any;
}

export interface StockAlertStats {
    expiry_alerts: number;
    expired_alerts: number;
    low_stock_alerts: number;
    over_stock_alerts: number;
}
