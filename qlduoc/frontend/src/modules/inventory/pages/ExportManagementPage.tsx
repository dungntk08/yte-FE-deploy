import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import InventoryNoteList from '../components/InventoryNoteList';
import PrescriptionExportCreatePage from './PrescriptionExportCreatePage';
import ConsumableExportCreateModal from '../components/ConsumableExportCreateModal';
import { List, Droplet, Building, ClipboardList } from 'lucide-react';

const ExportManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'consumable' | 'internal' | 'prescription'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const tabs = [
        { id: 'all', label: 'Tất cả phiếu xuất', icon: <List size={18} /> },
        { id: 'prescription', label: 'Kê đơn', icon: <ClipboardList size={18} /> },
        { id: 'internal', label: 'Xuất nội bộ', icon: <Building size={18} /> },
        { id: 'consumable', label: 'Xuất tiêu hao', icon: <Droplet size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý xuất kho</h1>
                        <p className="text-gray-500 mt-1 text-sm">Quản lý và theo dõi các hoạt động xuất thuốc ra khỏi kho</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto max-w-full">
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

                    {/* Create Button for Consumable Tab */}
                    {activeTab === 'consumable' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <Droplet size={18} />
                            Tạo phiếu xuất tiêu hao
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'all' && (
                        <InventoryNoteList type="export" />
                    )}

                    {activeTab === 'internal' && (
                        <InventoryNoteList type="export" subType="internal" />
                    )}

                    {activeTab === 'prescription' && (
                        <PrescriptionExportCreatePage isEmbed={true} />
                    )}

                    {activeTab === 'consumable' && (
                        <InventoryNoteList type="export" subType="manual" />
                    )}
                </div>

                {/* Modals */}
                {showCreateModal && (
                    <ConsumableExportCreateModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            // Refresh list? InventoryNoteList handles internal refresh but here we might need to trigger it.
                            // For now, user can click refresh or sort. Logic improvement: Add refresh trigger prop to List.
                            window.location.reload(); // Simple refresh for now to ensure list checks updates
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExportManagementPage;
