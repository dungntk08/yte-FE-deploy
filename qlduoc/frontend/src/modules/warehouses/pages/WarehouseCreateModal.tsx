import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createWarehouse, updateWarehouse, getHealthPosts } from '../services/warehouseService';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const WarehouseCreateModal: React.FC<Props> = ({ onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: '',
        // department: '', // Removed
        is_pharmacy: true,
        active: true,
        health_post_id: '',
    });
    const [healthPosts, setHealthPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submitBtnRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        getHealthPosts().then(setHealthPosts).catch(console.error);
        if (initialData) {
            setFormData({
                code: initialData.Code || '',
                name: initialData.Name || '',
                type: initialData.Type || '',
                is_pharmacy: initialData.IsPharmacy ?? true,
                active: initialData.IsActive ?? true,
                health_post_id: initialData.HealthPostId || '',
            });
        }
    }, [initialData]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'F11') {
                e.preventDefault();
                submitBtnRef.current?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (initialData) {
                await updateWarehouse(initialData.Id, formData);
            } else {
                await createWarehouse(formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'CẬP NHẬT KHO DƯỢC' : 'THÊM MỚI KHO DƯỢC'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Loại kho
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Chọn loại kho</option>
                                <option value="Kho chẵn">Kho chẵn</option>
                                <option value="Kho lẻ">Kho lẻ</option>
                                <option value="Kho tổng">Kho tổng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạm / Điểm y tế
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.health_post_id}
                                onChange={(e) => setFormData({ ...formData, health_post_id: e.target.value })}
                            >
                                <option value="">Chọn trạm y tế (Mặc định)</option>
                                {healthPosts.map((hp) => (
                                    <option key={hp.Id} value={hp.Id}>{hp.Name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Để trống hệ thống sẽ tự chọn theo quyền của bạn.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Mã
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Tên
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-8 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Kho dược</span>
                            <div
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.is_pharmacy ? 'bg-blue-600' : 'bg-gray-300'}`}
                                onClick={() => setFormData({ ...formData, is_pharmacy: !formData.is_pharmacy })}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.is_pharmacy ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-sm">{formData.is_pharmacy ? 'Có' : 'Không'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                            <div
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.active ? 'bg-blue-600' : 'bg-gray-300'}`}
                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-sm">{formData.active ? 'Có' : 'Không'}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Đóng (Esc)
                        </button>
                        <button
                            ref={submitBtnRef}
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : (initialData ? 'Cập nhật (F11)' : 'Thêm mới (F11)')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseCreateModal;
