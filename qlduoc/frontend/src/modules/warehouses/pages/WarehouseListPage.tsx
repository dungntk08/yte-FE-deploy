import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getWarehouses } from '../services/warehouseService';
import { Warehouse } from '../models/Warehouse';
import { Plus, Edit } from 'lucide-react';
import WarehouseCreateModal from './WarehouseCreateModal';
import TableHeader from '../../../components/common/Table/TableHeader';

const WarehouseListPage: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>(undefined);

    useEffect(() => {
        fetchWarehouses();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setSelectedWarehouse(undefined);
                setIsModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const data = await getWarehouses();
            setWarehouses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'Id', label: 'ID', width: '10%' },
        { key: 'HealthPostId', label: 'Trạm y tế', width: '20%' },
        { key: 'Name', label: 'Tên kho' },
        { key: 'Type', label: 'Loại kho', width: '15%' },
        // { key: 'department', label: 'Phòng ban', width: '15%' },
        // { key: 'is_pharmacy', label: 'Kho dược', align: 'center' as const, width: '10%' },
        { key: 'IsActive', label: 'Trạng thái', align: 'center' as const, width: '10%' },
        { key: 'actions', label: 'Thao tác', align: 'center' as const, width: '15%' },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách Kho Dược</h1>
                    <p className="text-gray-500 mt-1">Quản lý các kho thuốc và phân quyền người dùng</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedWarehouse(undefined);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm kho mới (F2)
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <TableHeader columns={columns} />
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={columns.length} className="text-center py-4">Đang tải...</td></tr>
                            ) : warehouses.length > 0 ? (
                                warehouses.map((warehouse) => (
                                    <tr key={warehouse.Id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{warehouse.Id}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {warehouse.health_post?.Name || warehouse.HealthPostId}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{warehouse.Name}</td>
                                        <td className="px-6 py-4 text-gray-600">{warehouse.Type || '---'}</td>
                                        {/* <td className="px-6 py-4 text-gray-600">{warehouse.Department || '---'}</td> */}
                                        {/* <td className="px-6 py-4 text-center">
                                            {warehouse.IsPharmacy ? <Check size={18} className="mx-auto text-green-600" /> : <X size={18} className="mx-auto text-gray-400" />}
                                        </td> */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full ${warehouse.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {warehouse.IsActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Sửa"
                                                    onClick={() => {
                                                        setSelectedWarehouse(warehouse);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={columns.length} className="text-center py-8 text-gray-500">Chưa có kho nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <WarehouseCreateModal
                    initialData={selectedWarehouse}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchWarehouses();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default WarehouseListPage;
