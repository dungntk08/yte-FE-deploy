import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getSuppliers, deleteSupplier, Supplier } from '../services/supplierService';
import { Plus, Edit, Trash2, ShieldCheck, User, Search } from 'lucide-react';
import SupplierCreateModal from '../components/SupplierCreateModal';
import TableHeader from '../../../components/common/Table/TableHeader';

const SupplierListPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        fetchSuppliers();
    }, [search, page]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await getSuppliers({ search, page, per_page: 20 });
            setSuppliers(response.data);
            setLastPage(response.last_page);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
        try {
            await deleteSupplier(id);
            fetchSuppliers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingSupplier(undefined);
        setIsModalOpen(true);
    };

    const columns = [
        { key: 'code', label: 'Mã NCC', width: '15%' },
        { key: 'name', label: 'Tên nhà cung cấp' },
        { key: 'type', label: 'Loại', width: '12%', align: 'center' as const },
        { key: 'phone', label: 'Điện thoại', width: '15%' },
        { key: 'email', label: 'Email', width: '20%' },
        { key: 'actions', label: 'Thao tác', align: 'center' as const, width: '12%' },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhà cung cấp</h1>
                    <p className="text-gray-500 mt-1">Danh sách nhà cung cấp hệ thống và nội bộ</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Thêm nhà cung cấp</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm theo tên, mã hoặc số điện thoại..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <TableHeader columns={columns} />
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.Id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{supplier.Code}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{supplier.Name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{supplier.Address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {supplier.MedicalCenterId == null ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <ShieldCheck size={12} className="mr-1" />
                                                    Hệ thống
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <User size={12} className="mr-1" />
                                                    Tự tạo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{supplier.Phone || '---'}</td>
                                        <td className="px-6 py-4 text-gray-600">{supplier.Email || '---'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {supplier.MedicalCenterId != null ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(supplier)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(supplier.Id.toString())}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Mặc định</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                        Không tìm thấy nhà cung cấp nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị từ <span className="font-medium">{(page - 1) * 20 + 1}</span> đến <span className="font-medium">{Math.min(page * 20, total)}</span> trong tổng số <span className="font-medium">{total}</span> kết quả
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Trước
                            </button>
                            {/* Simple pagination numbers */}
                            {[...Array(Math.min(5, lastPage))].map((_, i) => {
                                let pageNum;
                                if (lastPage <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= lastPage - 2) {
                                    pageNum = lastPage - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded border transition-colors ${page === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                disabled={page === lastPage}
                                className="px-3 py-1 border rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <SupplierCreateModal
                    supplier={editingSupplier}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchSuppliers();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default SupplierListPage;
