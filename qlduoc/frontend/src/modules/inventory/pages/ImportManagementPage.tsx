import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { List, User, Building, ClipboardList } from 'lucide-react';
import InventoryNoteList from '../components/InventoryNoteList';

const ImportManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'supplier' | 'opening' | 'internal'>('all');

    const tabs = [
        { id: 'all', label: 'Tất cả phiếu nhập', icon: <List size={18} /> },
        { id: 'supplier', label: 'Nhập từ nhà thầu', icon: <User size={18} /> },
        { id: 'opening', label: 'Nhập tồn đầu kỳ', icon: <ClipboardList size={18} /> },
        { id: 'internal', label: 'Nhập kho nội bộ', icon: <Building size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý nhập kho</h1>
                        <p className="text-gray-500 mt-1 text-sm">Quản lý và theo dõi các hoạt động nhập hàng vào kho</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
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
                        <InventoryNoteList type="import" />
                    )}

                    {activeTab === 'supplier' && (
                        <InventoryNoteList type="import" subType="supplier" />
                    )}

                    {activeTab === 'opening' && (
                        <InventoryNoteList type="import" subType="opening" />
                    )}

                    {activeTab === 'internal' && (
                        <div className="space-y-4">
                            <InventoryNoteList type="import" subType="internal" />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ImportManagementPage;
