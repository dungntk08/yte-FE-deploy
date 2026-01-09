import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StockAlert, AlertType } from '../models/StockAlert';
import * as stockAlertService from '../services/stockAlertService';

const StockAlertsPage: React.FC = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<AlertType | 'all'>('all');
    const [showResolved, setShowResolved] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, [filter, showResolved]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const params: any = {
                is_resolved: showResolved
            };
            if (filter !== 'all') {
                params.alert_type = filter;
            }

            const response = await stockAlertService.getStockAlerts(params);
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await stockAlertService.generateStockAlerts();
            alert(`Đã tạo cảnh báo:\n- Sắp hết hạn: ${result.results.expiry_alerts}\n- Đã hết hạn: ${result.results.expired_alerts}\n- Tồn kho thấp: ${result.results.low_stock_alerts}\n- Tồn kho cao: ${result.results.over_stock_alerts}`);
            fetchAlerts();
        } catch (error) {
            alert('Có lỗi khi tạo cảnh báo');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        const notes = prompt('Ghi chú xử lý (tùy chọn):');
        if (notes === null) return;

        try {
            await stockAlertService.resolveStockAlert(id, notes);
            alert('Đã xử lý cảnh báo');
            fetchAlerts();
        } catch (error) {
            alert('Có lỗi khi xử lý cảnh báo');
        }
    };

    const getAlertColor = (type: AlertType) => {
        switch (type) {
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            case 'near_expiry': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low_stock': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'over_stock': return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getAlertLabel = (type: AlertType) => {
        switch (type) {
            case 'expired': return 'Đã hết hạn';
            case 'near_expiry': return 'Sắp hết hạn';
            case 'low_stock': return 'Tồn kho thấp';
            case 'over_stock': return 'Tồn kho cao';
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">⚠️ Cảnh báo Tồn kho</h1>
                        <p className="text-sm text-gray-500">Theo dõi và xử lý cảnh báo tồn kho</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw size={20} className="mr-2" />
                        Tạo cảnh báo
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilter('expired')}
                                className={`px-4 py-2 rounded-lg ${filter === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                            >
                                Hết hạn
                            </button>
                            <button
                                onClick={() => setFilter('near_expiry')}
                                className={`px-4 py-2 rounded-lg ${filter === 'near_expiry' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
                            >
                                Sắp hết hạn
                            </button>
                            <button
                                onClick={() => setFilter('low_stock')}
                                className={`px-4 py-2 rounded-lg ${filter === 'low_stock' ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
                            >
                                Tồn thấp
                            </button>
                            <button
                                onClick={() => setFilter('over_stock')}
                                className={`px-4 py-2 rounded-lg ${filter === 'over_stock' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                Tồn cao
                            </button>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showResolved}
                                onChange={(e) => setShowResolved(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Hiển thị đã xử lý</span>
                        </label>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Đang tải...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Không có cảnh báo</div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`bg-white rounded-lg shadow p-4 border-l-4 ${getAlertColor(alert.alert_type)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle size={20} />
                                            <span className="font-semibold">{getAlertLabel(alert.alert_type)}</span>
                                            {alert.is_resolved && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                    Đã xử lý
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Sản phẩm:</strong> {alert.product?.name || 'N/A'}</p>
                                            <p><strong>Kho:</strong> {alert.warehouse?.name || 'N/A'}</p>
                                            {alert.batch_id && (
                                                <p><strong>Lô:</strong> {alert.batch?.batch_code || 'N/A'}</p>
                                            )}
                                            <p><strong>Số lượng hiện tại:</strong> {alert.current_quantity}</p>
                                            {alert.threshold_quantity && (
                                                <p><strong>Ngưỡng:</strong> {alert.threshold_quantity}</p>
                                            )}
                                            {alert.expiry_date && (
                                                <p><strong>Hạn dùng:</strong> {new Date(alert.expiry_date).toLocaleDateString('vi-VN')} ({alert.days_to_expiry} ngày)</p>
                                            )}
                                            {alert.resolution_notes && (
                                                <p className="text-gray-600 italic"><strong>Ghi chú:</strong> {alert.resolution_notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    {!alert.is_resolved && (
                                        <button
                                            onClick={() => handleResolve(alert.id)}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Xử lý
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StockAlertsPage;
