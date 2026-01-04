import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../../../api/axios';

const getLogActionText = (action: string) => {
    switch (action) {
        case 'Create': return 'đã tạo';
        case 'Update': return 'đã cập nhật';
        case 'Delete': return 'đã xóa';
        case 'Approve': return 'đã duyệt';
        case 'Revert': return 'đã hoàn tác';
        case 'Cancel': return 'đã hủy';
        default: return 'đã thực hiện hành động';
    }
};

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        total_products: 0,
        out_of_stock_products: 0,
        import_today: 0,
        export_today: 0,
        recent_activities: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        {
            title: 'Tổng số sản phẩm',
            value: stats.total_products,
            icon: <Package className="text-blue-600" size={24} />,
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        },
        {
            title: 'Sản phẩm hết hàng',
            value: stats.out_of_stock_products,
            icon: <AlertTriangle className="text-red-600" size={24} />,
            bg: 'bg-red-50',
            text: 'text-red-600'
        },
        {
            title: 'Phiếu nhập trong ngày',
            value: stats.import_today,
            icon: <ArrowDownCircle className="text-green-600" size={24} />,
            bg: 'bg-green-50',
            text: 'text-green-600'
        },
        {
            title: 'Phiếu xuất trong ngày',
            value: stats.export_today,
            icon: <ArrowUpCircle className="text-orange-600" size={24} />,
            bg: 'bg-orange-50',
            text: 'text-orange-600'
        }
    ];

    const formatLogTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        // precise time if > 1 hour (3600s)
        if (diffInSeconds > 3600) {
            return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
        }

        // Relative time
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;

        return date.toLocaleString('vi-VN');
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500 mt-1">Chào mừng trở lại! Dưới đây là thống kê kho dược phẩm hôm nay.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {loading ? '...' : new Intl.NumberFormat('vi-VN').format(card.value)}
                                </h3>
                            </div>
                            <div className={`p-4 rounded-full ${card.bg}`}>
                                {card.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area (Future Charts/Tables) - Occupies 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 italic h-64 flex items-center justify-center">
                            Biểu đồ hoạt động kho (Coming Soon)
                        </div>
                    </div>

                    {/* Sidebar / Corner Log - Occupies 1 column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-sm font-bold text-gray-900 uppercase">Hoạt động gần đây</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {stats.recent_activities?.length > 0 ? (
                                    stats.recent_activities.map((log: any) => (
                                        <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 text-xs">
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 leading-snug">
                                                    <span className="font-bold">{log.user}</span>
                                                    <span className="text-gray-600"> {getLogActionText(log.action)} </span>
                                                    {log.subject_info && (
                                                        <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded text-xs">{log.subject_info}</span>
                                                    )}
                                                </p>
                                                {/* <p className="text-xs text-gray-500 mt-0.5 truncate">{log.description}</p> */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {formatLogTime(log.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">Chưa có hoạt động nào</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
