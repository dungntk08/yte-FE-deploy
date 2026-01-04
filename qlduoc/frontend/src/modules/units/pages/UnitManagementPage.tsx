import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Unit } from '../models/Unit';
import * as unitService from '../services/unitService';

const UnitManagementPage: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Unit>>({
        name: '',
        code: '',
        base_unit_id: null,
        conversion_factor: 1,
        is_base_unit: true,
        description: '',
        active: true,
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = units.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.code.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredUnits(filtered);
        } else {
            setFilteredUnits(units);
        }
    }, [search, units]);

    const fetchUnits = async () => {
        try {
            const data = await unitService.getUnits();
            setUnits(data);
            setFilteredUnits(data);
        } catch (error) {
            console.error('Failed to fetch units:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingUnit) {
                await unitService.updateUnit(editingUnit.id!, formData);
                alert('Cập nhật đơn vị thành công!');
            } else {
                await unitService.createUnit(formData);
                alert('Thêm đơn vị thành công!');
            }

            setShowModal(false);
            setEditingUnit(null);
            resetForm();
            fetchUnits();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setFormData({
            name: unit.name,
            code: unit.code,
            base_unit_id: unit.base_unit_id,
            conversion_factor: unit.conversion_factor,
            is_base_unit: unit.is_base_unit,
            description: unit.description || '',
            active: unit.active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa đơn vị này?')) return;

        try {
            await unitService.deleteUnit(id);
            alert('Xóa đơn vị thành công!');
            fetchUnits();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Không thể xóa đơn vị đang được sử dụng');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            base_unit_id: null,
            conversion_factor: 1,
            is_base_unit: true,
            description: '',
            active: true,
        });
    };

    const baseUnits = units.filter(u => u.is_base_unit);

    return (
        <DashboardLayout>
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn vị tính</h1>
                        <p className="text-sm text-gray-500">Quản lý đơn vị tính và quy đổi</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingUnit(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Thêm đơn vị
                    </button>
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn vị..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>

                {/* Units Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quy đổi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUnits.map((unit) => (
                                <tr key={unit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{unit.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{unit.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {unit.is_base_unit ? (
                                            <span className="text-gray-500 italic">Đơn vị cơ bản</span>
                                        ) : (
                                            <span className="text-blue-600">
                                                1 = {unit.conversion_factor} {unit.baseUnit?.name || ''}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {unit.account_id ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Tùy chỉnh</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Hệ thống</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {unit.active ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Hoạt động</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Tạm ngưng</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {unit.account_id && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(unit)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(unit.id!)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">
                                    {editingUnit ? 'Cập nhật đơn vị' : 'Thêm đơn vị mới'}
                                </h2>
                                <button onClick={() => setShowModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tên đơn vị *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mã đơn vị *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full border rounded-md p-2"
                                        disabled={!!editingUnit}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_base_unit}
                                        onChange={(e) => setFormData({ ...formData, is_base_unit: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm">Đơn vị cơ bản</label>
                                </div>

                                {!formData.is_base_unit && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Đơn vị gốc</label>
                                            <select
                                                value={formData.base_unit_id || ''}
                                                onChange={(e) => setFormData({ ...formData, base_unit_id: e.target.value || null })}
                                                className="w-full border rounded-md p-2"
                                            >
                                                <option value="">-- Chọn --</option>
                                                {baseUnits.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Hệ số quy đổi</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={formData.conversion_factor}
                                                onChange={(e) => setFormData({ ...formData, conversion_factor: parseFloat(e.target.value) })}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded-md p-2"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Save size={18} className="mr-2" />
                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UnitManagementPage;
