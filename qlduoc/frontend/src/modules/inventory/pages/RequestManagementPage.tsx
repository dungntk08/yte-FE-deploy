import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { List, ClipboardCheck, FileText } from 'lucide-react';
import InventoryRequestPage from './InventoryRequestPage';

const RequestManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'prescription'>('all');

    const tabs = [
        { id: 'all', label: 'Tất cả phiếu đề nghị', icon: <List size={18} /> },
        { id: 'internal', label: 'Đề nghị cấp nội bộ', icon: <ClipboardCheck size={18} /> },
        { id: 'prescription', label: 'Đơn thuốc', icon: <FileText size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý phiếu đề nghị</h1>
                        <p className="text-gray-500 mt-1 text-sm">Quản lý và theo dõi các yêu cầu cấp phát thuốc</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4 w-fit overflow-x-auto max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'all' && (
                        <InventoryRequestPage isEmbed={true} />
                    )}

                    {activeTab !== 'all' && (
                        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                {tabs.find(t => t.id === activeTab)?.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lập {tabs.find(t => t.id === activeTab)?.label}</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Chức năng lập đề nghị đang được tối ưu hóa giao diện mới.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RequestManagementPage;
