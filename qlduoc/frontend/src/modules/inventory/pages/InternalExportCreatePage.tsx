import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { Save, ArrowLeft, Plus, Trash2, X, ChevronDown, Package } from 'lucide-react';
import { getWarehouses, getAllUsers } from '../../warehouses/services/warehouseService';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';

interface SelectedItem {
    product_id: string;
    product_code: string;
    product_name: string;
    unit: string;
    batch_code: string; // If manually selected
    expiry_date: string;
    quantity: number;
    quantity_in_stock: number;
    price: number;
    totalAmount: number;
}

interface InternalExportCreateProps {
    isEmbed?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

const InternalExportCreatePage: React.FC<InternalExportCreateProps> = ({ isEmbed, onClose, onSuccess }) => {
    const navigate = useNavigate();

    // Header States
    const [code] = useState('PX' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(Math.random() * 1000));
    const [documentNumber, setDocumentNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [warehouseId, setWarehouseId] = useState(''); // Source
    const [destWarehouseId, setDestWarehouseId] = useState(''); // Dest
    const [receiverId, setReceiverId] = useState('');

    // Export Method
    const [exportMethod, setExportMethod] = useState('manual'); // manual, fifo, expiry

    // Master Data
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // Items Table
    const [items, setItems] = useState<SelectedItem[]>([]);

    // Batch Edit Modal (In-Table)
    const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);
    const [editBatches, setEditBatches] = useState<any[]>([]);
    const [loadingEditBatches, setLoadingEditBatches] = useState(false);
    const editModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMasterData();

        const handleClickOutside = (event: MouseEvent) => {
            if (editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
                setEditingBatchIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMasterData = async () => {
        try {
            const [wData, uData] = await Promise.all([
                getWarehouses(),
                getAllUsers()
            ]);
            setWarehouses(wData);
            setUsers(uData);
        } catch (error) {
            console.error('Error fetching master data', error);
        }
    };

    const fetchBatches = async (productId: string) => {
        if (!warehouseId) return [];
        const response = await api.get('/inventory/batches', {
            params: {
                warehouse_id: warehouseId,
                product_id: productId
            }
        });
        return response.data;
    };

    const handleAddItemRow = () => {
        setItems([
            ...items,
            {
                product_id: '',
                product_code: '',
                product_name: '',
                unit: '',
                batch_code: '',
                expiry_date: '',
                quantity: 1,
                quantity_in_stock: 0,
                price: 0,
                totalAmount: 0
            }
        ]);
    };

    const handleRemoveItem = (idx: number) => {
        const newItems = [...items];
        newItems.splice(idx, 1);
        setItems(newItems);
    };

    const handleProductSelect = async (index: number, product: any) => {
        if (!warehouseId) {
            alert('Vui lòng chọn Kho giao trước');
            return;
        }

        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            product_id: product.Id,
            product_code: product.Code,
            product_name: product.Name,
            unit: product.unit?.Name || 'Đơn vị',
            price: 0, // Will update when batch selected
            quantity: 1,
            batch_code: '',
            quantity_in_stock: 0
        };
        setItems(newItems);

        // Auto open batch selection if Manual?
        if (exportMethod === 'manual') {
            // Optional: Auto fetch batches or just wait for user to click batch
            // Let's verify if auto-pick is better or force manual.
            // Let's trigger batch fetch implicitly when they click the batch cell.
        }
    };

    const handleQuantityChange = (idx: number, val: number) => {
        const newItems = [...items];
        const item = newItems[idx];

        // Enforce stock limit if manual and batch selected
        if (exportMethod === 'manual' && item.batch_code) {
            if (val > item.quantity_in_stock) {
                val = item.quantity_in_stock;
            }
        }

        newItems[idx].quantity = val;
        newItems[idx].totalAmount = val * item.price;
        setItems(newItems);
    };

    const handleOpenEditBatch = async (index: number) => {
        if (exportMethod !== 'manual') return;
        if (!items[index].product_id) {
            alert('Vui lòng chọn thuốc trước');
            return;
        }

        setEditingBatchIndex(index);
        setLoadingEditBatches(true);
        try {
            const data = await fetchBatches(items[index].product_id);
            setEditBatches(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingEditBatches(false);
        }
    };

    const handleSelectEditBatch = (batch: any) => {
        if (editingBatchIndex === null) return;

        const newItems = [...items];
        const idx = editingBatchIndex;

        newItems[idx] = {
            ...newItems[idx],
            batch_code: batch.batch_code,
            expiry_date: batch.expiry_date,
            quantity_in_stock: batch.quantity,
            price: batch.import_price || 0,
            quantity: 1 // Reset quantity or keep? Reset safer.
        };
        newItems[idx].totalAmount = newItems[idx].quantity * newItems[idx].price;

        setItems(newItems);
        setEditingBatchIndex(null);
    };

    const handleSubmit = async () => {
        // Validate
        if (!warehouseId) { alert('Chưa chọn kho giao'); return; }
        if (items.length === 0) { alert('Chưa có sản phẩm nào'); return; }

        for (const item of items) {
            if (!item.product_id) continue;
            if (exportMethod === 'manual' && !item.batch_code) {
                alert(`Sản phẩm ${item.product_name} chưa chọn lô xuất`);
                return;
            }
        }

        try {
            const validItems = items.filter(i => i.product_id); // Filter empty rows
            await api.post('/inventory/export', {
                warehouse_id: warehouseId,
                destination_warehouse_id: destWarehouseId || null,
                sub_type: 'internal',
                receiver_id: receiverId || null,
                code,
                document_number: documentNumber,
                description,
                export_method: exportMethod,
                items: validItems.map(item => ({
                    product_id: item.product_id,
                    batch_code: item.batch_code,
                    expiry_date: item.expiry_date,
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit
                }))
            });
            alert('Tạo phiếu xuất nội bộ thành công!');
            if (onSuccess) onSuccess();
            else if (isEmbed) {
                setItems([]);
                setDocumentNumber('');
                setDescription('');
            } else navigate('/inventory/requests');
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={isEmbed ? "" : "w-full px-2 sm:px-4 lg:px-6 py-4"}>
            {!isEmbed && (
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => onClose ? onClose() : navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Thêm phiếu xuất nội bộ</h1>
                    </div>
                </div>
            )}

            {/* Header Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Mã chứng từ</label>
                        <input type="text" value={code} readOnly className="w-full px-2 py-1.5 border rounded-lg bg-gray-50 text-gray-500 text-sm" />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Số chứng từ</label>
                        <input type="text" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Ngày chứng từ *</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm" required />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Phương pháp xuất</label>
                        <select value={exportMethod} onChange={e => setExportMethod(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-sm">
                            <option value="manual">Xuất theo lô (Thủ công)</option>
                            <option value="expiry">Hạn dùng (FEFO)</option>
                            <option value="fifo">Nhập trước xuất trước (FIFO)</option>
                        </select>
                    </div>

                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Kho giao *</label>
                        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm">
                            <option value="">-- Chọn kho --</option>
                            {warehouses.map(w => <option key={w.Id} value={w.Id}>{w.Name}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Kho nhận</label>
                        <select value={destWarehouseId} onChange={e => setDestWarehouseId(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm">
                            <option value="">-- Chọn kho nhận --</option>
                            {warehouses.map(w => <option key={w.Id} value={w.Id}>{w.Name}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Người nhận</label>
                        <select value={receiverId} onChange={e => setReceiverId(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm">
                            <option value="">-- Chọn người nhận --</option>
                            {users.map(u => <option key={u.Id} value={u.Id}>{u.FullName}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-8">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Diễn giải</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Ghi chú..." />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package size={20} className="text-blue-600" /> Danh sách dược phẩm
                    </h3>
                    <button onClick={handleAddItemRow} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm transition-colors">
                        <Plus size={16} /> Thêm dòng
                    </button>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="p-3 w-10 text-center">STT</th>
                                <th className="p-3 w-16 text-center">Xóa</th>
                                <th className="p-3 min-w-[250px]">Tên thuốc / Mã</th>
                                <th className="p-3 min-w-[150px]">Số lô (Tồn kho)</th>
                                <th className="p-3">ĐVT</th>
                                <th className="p-3 min-w-[100px]">Số lượng</th>
                                <th className="p-3 text-right">Đơn giá</th>
                                <th className="p-3 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                    <td className="p-2 relative z-10">
                                        <ProductSearchSelect
                                            initialDisplayName={item.product_code ? `${item.product_name} (${item.product_code})` : ''}
                                            onSelect={(p) => handleProductSelect(idx, p)}
                                            value={item.product_id}
                                            placeholder="Tìm thuốc..."
                                        />
                                    </td>

                                    {/* Batch Selection Cell */}
                                    <td className="p-2 relative z-0">
                                        <div
                                            className={`border rounded px-2 py-1.5 flex justify-between items-center cursor-pointer ${exportMethod === 'manual' && !item.batch_code ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                                            onClick={() => handleOpenEditBatch(idx)}
                                        >
                                            <span className={item.batch_code ? "font-bold text-blue-700" : "text-gray-400 italic"}>
                                                {item.batch_code || (exportMethod === 'manual' ? 'Chọn lô...' : 'Tự động')}
                                            </span>
                                            {item.batch_code && <span className="text-xs bg-gray-100 px-1 rounded ml-2">Tồn: {item.quantity_in_stock}</span>}
                                            {exportMethod === 'manual' && <ChevronDown size={14} className="text-gray-400" />}
                                        </div>

                                        {/* Edit Batch Popover */}
                                        {editingBatchIndex === idx && (
                                            <div ref={editModalRef} className="absolute top-10 left-0 w-[450px] bg-white border border-blue-200 shadow-xl rounded-lg z-50">
                                                <div className="bg-blue-50 px-3 py-2 border-b flex justify-between items-center">
                                                    <span className="font-bold text-blue-800 text-xs uppercase">Chọn lô xuất</span>
                                                    <button onClick={() => setEditingBatchIndex(null)}><X size={14} /></button>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-gray-50 sticky top-0">
                                                            <tr>
                                                                <th className="p-2 text-left">Số lô</th>
                                                                <th className="p-2 text-right">Tồn</th>
                                                                <th className="p-2 text-right">Giá</th>
                                                                <th className="p-2 text-right">Hạn dùng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {loadingEditBatches ? (
                                                                <tr><td colSpan={4} className="p-4 text-center">Đang tải...</td></tr>
                                                            ) : editBatches.length > 0 ? (
                                                                editBatches.map(b => (
                                                                    <tr key={b.id} onClick={() => handleSelectEditBatch(b)} className="hover:bg-blue-50 cursor-pointer">
                                                                        <td className="p-2 font-bold text-blue-700">{b.batch_code}</td>
                                                                        <td className="p-2 text-right">{b.quantity}</td>
                                                                        <td className="p-2 text-right">{new Intl.NumberFormat('vi-VN').format(b.import_price)}</td>
                                                                        <td className="p-2 text-right">{b.expiry_date}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan={4} className="p-4 text-center italic text-gray-500">Không có dữ liệu lô</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-2 text-center text-gray-600">{item.unit}</td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-right font-bold text-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={item.quantity}
                                            onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                                            min={1}
                                        />
                                    </td>
                                    <td className="p-2 text-right">
                                        {new Intl.NumberFormat('vi-VN').format(item.price)}
                                    </td>
                                    <td className="p-2 text-right font-bold text-gray-900">
                                        {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold border-t">
                            <tr>
                                <td colSpan={7} className="p-3 text-right">Tổng cộng:</td>
                                <td className="p-3 text-right text-lg text-blue-600">
                                    {new Intl.NumberFormat('vi-VN').format(items.reduce((s, i) => s + (i.price * i.quantity), 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-8">
                {!isEmbed && <button onClick={() => onClose ? onClose() : navigate(-1)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Hủy (Esc)</button>}
                <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-bold shadow-lg">
                    <Save size={20} /> Lưu phiếu (F10)
                </button>
            </div>
        </div>
    );
};

export default InternalExportCreatePage;
