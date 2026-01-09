import React, { useState, useEffect } from 'react';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import api from '../../../api/axios';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { Plus, Trash2, Save, X, Package } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import { Product } from '../../products/models/Product';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

interface BatchOption {
    id: number;
    batch_code: string;
    quantity: number;
    expiry_date: string;
    import_price: number;
}

interface ItemRow {
    productId: string;
    productName: string;
    productCode: string;
    unitName: string;
    batchNumber: string;
    expiryDate: string;
    stockQuantity: number; // Tồn hiện tại
    quantity: number; // SL Xuất
    price: number;
}

const ConsumableExportCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        warehouseId: '',
        voucherDate: new Date().toISOString().split('T')[0],
        reason: 'Xuất tiêu hao', // Default
        description: '',
    });

    const [items, setItems] = useState<ItemRow[]>([
        {
            productId: '', productName: '', productCode: '', unitName: '',
            batchNumber: '', expiryDate: '', stockQuantity: 0, quantity: 1, price: 0
        }
    ]);

    // Cache batches for selected product: { [rowIndex]: BatchOption[] }
    const [batchOptions, setBatchOptions] = useState<{ [key: number]: BatchOption[] }>({});

    useEffect(() => {
        const fetchW = async () => {
            try {
                const wData = await getWarehouses();
                const wList = Array.isArray(wData) ? wData : (wData?.data || []);
                setWarehouses(wList);
                if (wList.length > 0) {
                    setFormData(prev => ({ ...prev, warehouseId: String(wList[0].Id) }));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchW();
    }, []);

    // Effect to auto-update description when reason changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            description: `${prev.reason} - ${prev.voucherDate}`
        }));
    }, [formData.reason, formData.voucherDate]);

    // Helper to fetch batches
    const fetchBatches = async (index: number, warehouseId: string, productId: string) => {
        if (!warehouseId || !productId) return;
        try {
            const res = await api.get('/inventory/batches', {
                params: { warehouse_id: warehouseId, product_id: productId }
            });
            setBatchOptions(prev => ({ ...prev, [index]: res.data }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items];
        newItems[index].productId = String(product.Id);
        newItems[index].productName = product.Name;
        newItems[index].productCode = product.Code;
        newItems[index].unitName = product.unit?.Name || product.UnitName || 'ĐVT';
        newItems[index].batchNumber = ''; // Reset batch
        newItems[index].stockQuantity = 0;
        newItems[index].expiryDate = '';
        newItems[index].price = 0;
        setItems(newItems);

        // Fetch batches
        fetchBatches(index, formData.warehouseId, String(product.Id));
    };

    const handleBatchSelect = (index: number, batchCode: string) => {
        const options = batchOptions[index] || [];
        const selected = options.find(b => b.batch_code === batchCode);
        const newItems = [...items];
        newItems[index].batchNumber = batchCode;
        if (selected) {
            newItems[index].stockQuantity = selected.quantity;
            newItems[index].expiryDate = selected.expiry_date;
            newItems[index].price = selected.import_price;
        }
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof ItemRow, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, {
            productId: '', productName: '', productCode: '', unitName: '',
            batchNumber: '', expiryDate: '', stockQuantity: 0, quantity: 1, price: 0
        }]);
    };

    const removeItemRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        if (newItems.length === 0) addItemRow();
        else setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!formData.warehouseId) return alert('Vui lòng chọn kho xuất');
        const validItems = items.filter(i => i.productId && i.batchNumber && i.quantity > 0);
        if (validItems.length === 0) return alert('Vui lòng nhập ít nhất 1 mặt hàng hợp lệ');

        setLoading(true);
        try {
            await api.post('/inventory/export', {
                warehouse_id: formData.warehouseId,
                destination_warehouse_id: null, // No target for consumable
                code: 'EXP-' + new Date().getTime(), // Or let backend handle
                description: formData.description,
                items: validItems.map(i => ({
                    product_id: i.productId,
                    batch_code: i.batchNumber, // Ensure backend uses 'BatchNumber' or maps 'batch_code'
                    quantity: i.quantity,
                    expiry_date: i.expiryDate,
                    price: i.price
                }))
            });
            alert('Tạo phiếu xuất thành công!');
            onSuccess();
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-white text-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package className="text-blue-600" /> Tạo phiếu xuất tiêu hao / Khác
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {/* General Info */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kho xuất *</label>
                                <select
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.warehouseId}
                                    onChange={e => {
                                        setFormData({ ...formData, warehouseId: e.target.value });
                                        // Clear items if warehouse changes? Ideally yes to prevent mismatch.
                                        setItems([{ productId: '', productName: '', productCode: '', unitName: '', batchNumber: '', expiryDate: '', stockQuantity: 0, quantity: 1, price: 0 }]);
                                    }}
                                >
                                    {warehouses.map(w => (
                                        <option key={w.Id} value={w.Id}>{w.Name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngày xuất *</label>
                                <input
                                    type="date"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.voucherDate}
                                    onChange={e => setFormData({ ...formData, voucherDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lý do xuất *</label>
                                <select
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                >
                                    <option value="Xuất hàng tồn">Xuất hàng tồn (Inventory)</option>
                                    <option value="Xuất hàng hỏng">Xuất hàng hỏng (Damaged)</option>
                                    <option value="Xuất tiêu hao">Xuất tiêu hao (Consumable)</option>
                                    <option value="Xuất trả hàng">Xuất trả hàng (Return)</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Diễn giải</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px] flex flex-col">
                        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Chi tiết hàng hóa</h3>
                            <button onClick={addItemRow} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded font-medium flex items-center gap-1">
                                <Plus size={16} /> Thêm dòng
                            </button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-semibold">
                                <tr>
                                    <th className="p-3 w-10 text-center">#</th>
                                    <th className="p-3 min-w-[250px]">Sản phẩm</th>
                                    <th className="p-3 w-32">Số lô</th>
                                    <th className="p-3 w-24">ĐVT</th>
                                    <th className="p-3 w-24 text-right">Tồn kho</th>
                                    <th className="p-3 w-24 text-right">Hạn dùng</th>
                                    <th className="p-3 w-32 text-right">SL Xuất</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50">
                                        <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                        <td className="p-3">
                                            <ProductSearchSelect
                                                initialDisplayName={item.productCode ? `${item.productName} (${item.productCode})` : item.productName}
                                                value={item.productId}
                                                onSelect={(p) => handleProductSelect(idx, p)}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <select
                                                className="w-full p-1 border rounded outline-none"
                                                value={item.batchNumber}
                                                onChange={e => handleBatchSelect(idx, e.target.value)}
                                                disabled={!item.productId}
                                            >
                                                <option value="">-- Lô --</option>
                                                {(batchOptions[idx] || []).map(b => (
                                                    <option key={b.id} value={b.batch_code}>
                                                        {b.batch_code} (SL: {b.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 text-gray-600">{item.unitName}</td>
                                        <td className="p-3 text-right text-gray-600">{item.stockQuantity}</td>
                                        <td className="p-3 text-right text-gray-600">{item.expiryDate}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                className="w-full p-1 border rounded text-right font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                max={item.stockQuantity}
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => removeItemRow(idx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg flex items-center gap-2"
                    >
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : 'Lưu phiếu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsumableExportCreateModal;
