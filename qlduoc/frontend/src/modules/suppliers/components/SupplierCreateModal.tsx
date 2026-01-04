import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { createSupplier, updateSupplier, Supplier } from '../services/supplierService';

interface SupplierCreateModalProps {
    supplier?: Supplier;
    onClose: () => void;
    onSuccess: () => void;
}

const SupplierCreateModal: React.FC<SupplierCreateModalProps> = ({ supplier, onClose, onSuccess }) => {
    const isEdit = !!supplier;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Supplier>>({
        Name: '',
        Code: '',
        Phone: '',
        Email: '',
        Address: '',
        TaxCode: '',
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                Name: supplier.Name,
                Code: supplier.Code,
                Phone: supplier.Phone || '',
                Email: supplier.Email || '',
                Address: supplier.Address || '',
                TaxCode: supplier.TaxCode || '',
            });
        }
    }, [supplier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit && supplier) {
                await updateSupplier(supplier.Id.toString(), formData);
            } else {
                await createSupplier(formData);
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<Supplier>) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà cung cấp <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="Name"
                                required
                                value={formData.Name || ''}
                                onChange={handleChange}
                                placeholder="VD: Công ty TNHH Dược phẩm ABC"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã NCC <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="Code"
                                    required
                                    value={formData.Code || ''}
                                    onChange={handleChange}
                                    placeholder="NCC001"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                                <input
                                    type="text"
                                    name="TaxCode"
                                    value={formData.TaxCode || ''}
                                    onChange={handleChange}
                                    placeholder="0101234567"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="Phone"
                                    value={formData.Phone || ''}
                                    onChange={handleChange}
                                    placeholder="0912..."
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email || ''}
                                    onChange={handleChange}
                                    placeholder="contact@abc.com"
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <textarea
                                name="Address"
                                rows={3}
                                value={formData.Address || ''}
                                onChange={handleChange}
                                placeholder="Số 123 Đường ABC, Quận XYZ, TP. Hà Nội"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md disabled:bg-blue-300"
                        >
                            {loading ? (
                                <span className="animate-pulse">Đang xử lý...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{isEdit ? 'Lưu thay đổi' : 'Thêm mới'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierCreateModal;
