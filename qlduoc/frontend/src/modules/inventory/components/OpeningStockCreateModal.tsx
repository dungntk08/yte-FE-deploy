import React, { useState, useEffect } from 'react';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { createOpeningStockManual, getAllProductsForOpeningStock } from '../services/inventoryService';
import { getUsers } from '../../users/services/userService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { User } from '../../users/models/User';
import { Product } from '../../products/models/Product';
import { Plus, Trash2, Save, Upload, X, Download } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import OpeningStockImportModal from './OpeningStockImportModal';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

interface ItemRow {
    productId: string;
    productName: string;
    productCode: string;
    unitName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    price: number;
    // Bidding
    registrationNumber: string;
    bidPackageCode: string;
    bidGroupCode: string;
    bidDecisionNumber: string;
}


const OpeningStockCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    // Basic State
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [formData, setFormData] = useState({
        warehouseId: '',
        voucherDate: new Date().toISOString().split('T')[0],
        code: '', // Mã phiếu
        receiver: '', // Người nhập
        description: 'Nhập tồn đầu kỳ'
    });

    // Items State
    const [items, setItems] = useState<ItemRow[]>([
        {
            productId: '', productName: '', productCode: '', unitName: '', batchNumber: '', expiryDate: '', quantity: 1, price: 0,
            registrationNumber: '', bidPackageCode: '', bidGroupCode: '', bidDecisionNumber: ''
        }
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [wData, uData] = await Promise.all([
                    getWarehouses(),
                    getUsers()
                ]);
                setWarehouses(wData);
                setUsers(uData);
                if (wData.length > 0) setFormData(prev => ({ ...prev, warehouseId: String(wData[0].Id) }));
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            }
        };
        fetchInitialData();
    }, []);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // --- Item Handlers ---

    const addItemRow = () => {
        setItems([...items, {
            productId: '', productName: '', productCode: '', unitName: '', batchNumber: '', expiryDate: '', quantity: 1, price: 0,
            registrationNumber: '', bidPackageCode: '', bidGroupCode: '', bidDecisionNumber: ''
        }]);
        // Auto go to last page when adding new item
        setTimeout(() => setCurrentPage(Math.ceil((items.length + 1) / itemsPerPage)), 0);
    };

    const removeItemRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        if (newItems.length === 0) {
            addItemRow();
        } else {
            setItems(newItems);
            // Adjust page if current page becomes empty
            const newTotalPages = Math.ceil(newItems.length / itemsPerPage);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }
        }
    };

    const updateItem = (index: number, field: keyof ItemRow, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items];
        newItems[index].productId = String(product.Id);
        newItems[index].productName = product.Name;
        newItems[index].productCode = product.Code;
        newItems[index].unitName = product.unit?.Name || product.UnitName || 'Đơn vị';

        // Auto-fill Bidding Info
        if (product.medicine) {
            newItems[index].registrationNumber = product.medicine.RegistrationNumber || '';
            if (product.bids && product.bids.length > 0) {
                const priorityBid = product.bids.find(b => b.IsPriority) || product.bids[0];
                newItems[index].bidPackageCode = priorityBid.PackageCode || '';
                newItems[index].bidGroupCode = priorityBid.GroupCode || '';
                newItems[index].bidDecisionNumber = priorityBid.DecisionNumber || '';
                if (priorityBid.BidPrice) newItems[index].price = priorityBid.BidPrice;
            }
        }

        setItems(newItems);
    };

    // --- Submit ---

    const handleSubmit = async () => {
        if (!formData.warehouseId) {
            alert('Vui lòng chọn kho');
            return;
        }

        const validItems = items.filter(i => i.productId && i.batchNumber && i.expiryDate && i.quantity > 0);
        if (validItems.length === 0) {
            alert('Vui lòng nhập ít nhất một dòng hàng hóa đầy đủ (Sản phẩm, Lô, Hạn dùng, SL > 0)');
            return;
        }

        setLoading(true);
        try {
            await createOpeningStockManual({
                Code: formData.code,
                VoucherDate: formData.voucherDate,
                TargetWarehouseId: formData.warehouseId,
                ReceiverName: formData.receiver,
                Description: formData.description,
                Details: validItems.map(item => ({
                    ProductId: item.productId,
                    BatchNumber: item.batchNumber,
                    ExpiryDate: item.expiryDate,
                    Quantity: item.quantity,
                    Price: item.price,
                    UnitName: item.unitName,
                    // Bidding
                    RegistrationNumber: item.registrationNumber,
                    BidPackageCode: item.bidPackageCode,
                    BidGroup: item.bidGroupCode,
                    BidDecision: item.bidDecisionNumber,
                }))
            });
            alert('Nhập tồn đầu thành công!');
            onSuccess();
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleLoadAllProducts = async () => {
        if (items.length > 1 || (items.length === 1 && items[0].productId)) {
            if (!confirm('Danh sách hiện tại sẽ bị ghi đè. Bạn có chắc chắn muốn tải lại toàn bộ sản phẩm?')) {
                return;
            }
        }

        setLoading(true);
        try {
            const data = await getAllProductsForOpeningStock();
            if (data && data.length > 0) {
                setItems(data as ItemRow[]);
                setCurrentPage(1);
                alert(`Đã tải ${data.length} sản phẩm thành công.`);
            } else {
                alert('Không tìm thấy sản phẩm nào.');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Tạo phiếu nhập tồn đầu kỳ</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLoadAllProducts}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm text-sm font-medium"
                            disabled={loading}
                        >
                            <Download size={16} />
                            Tải tất cả SP
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm text-sm font-medium"
                        >
                            <Upload size={16} />
                            Nhập Excel
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhập *</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.warehouseId}
                                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                                >
                                    {warehouses.map(w => (
                                        <option key={w.Id} value={w.Id}>{w.Name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã phiếu</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.code}
                                    placeholder="Tự sinh nếu để trống"
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Người nhập</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.receiver}
                                    onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                                >
                                    <option value="">-- Chọn người nhập --</option>
                                    {users.map(u => (
                                        <option key={u.Id} value={u.FullName}>{u.FullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày lập</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.voucherDate}
                                    onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diễn giải</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-x-auto min-h-[300px] flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3 w-10 text-center">#</th>
                                        <th className="p-3 min-w-[250px]">Sản phẩm</th>
                                        <th className="p-3 min-w-[100px]">Đơn vị</th>
                                        <th className="p-3 min-w-[120px]">Số lô *</th>
                                        <th className="p-3 min-w-[130px]">Hạn dùng *</th>
                                        <th className="p-3 min-w-[100px] text-right">Số lượng *</th>
                                        <th className="p-3 min-w-[120px] text-right">Giá vốn</th>
                                        <th className="p-3 min-w-[120px] text-right">Thành tiền</th>

                                        {/* Bidding Info */}
                                        <th className="p-3 min-w-[120px] text-gray-500">QĐ Thầu</th>
                                        <th className="p-3 min-w-[100px] text-gray-500">Mã gói</th>
                                        <th className="p-3 min-w-[100px] text-gray-500">Mã nhóm</th>

                                        <th className="p-3 w-16 text-center sticky right-0 bg-gray-100">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentItems.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                                        return (
                                            <tr key={globalIndex} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-3 text-center text-gray-500 font-medium">{globalIndex + 1}</td>
                                                <td className="p-2">
                                                    <ProductSearchSelect
                                                        initialDisplayName={item.productId ? (item.productName ? `${item.productName} (${item.productCode})` : 'Đã chọn') : ''}
                                                        value={item.productId}
                                                        onSelect={(product) => handleProductSelect(globalIndex, product)}
                                                    />
                                                </td>
                                                <td className="p-3 text-gray-600">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent outline-none"
                                                        value={item.unitName}
                                                        onChange={e => updateItem(globalIndex, 'unitName', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={item.batchNumber}
                                                        placeholder="Số lô..."
                                                        onChange={(e) => updateItem(globalIndex, 'batchNumber', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={item.expiryDate}
                                                        onChange={(e) => updateItem(globalIndex, 'expiryDate', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-right font-medium text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(globalIndex, 'quantity', parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(globalIndex, 'price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-medium text-gray-800">
                                                    {(item.quantity * item.price).toLocaleString()}
                                                </td>

                                                {/* Bidding Inputs (ReadOnly mostly) */}
                                                <td className="p-2">
                                                    <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidDecisionNumber} readOnly tabIndex={-1} placeholder="..." />
                                                </td>
                                                <td className="p-2">
                                                    <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidPackageCode} readOnly tabIndex={-1} placeholder="..." />
                                                </td>
                                                <td className="p-2">
                                                    <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidGroupCode} readOnly tabIndex={-1} placeholder="..." />
                                                </td>

                                                <td className="p-2 text-center sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                                                    <button
                                                        onClick={() => removeItemRow(globalIndex)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {items.length > 0 && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 border-t text-sm">
                                <div className="text-gray-600 font-medium">
                                    Tổng cộng: {items.length} dòng
                                    <span className="mx-2">|</span>
                                    Tổng tiền: <span className="text-blue-700 font-bold">{items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()} VND</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </button>
                                    <span className="text-gray-700 font-medium">
                                        Trang {currentPage} / {totalPages || 1}
                                    </span>
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add Row Button (Always Visible) */}
                        <div className="p-2 bg-gray-50 border-t flex justify-start">
                            <button
                                onClick={addItemRow}
                                className="flex items-center gap-2 text-blue-700 font-bold hover:text-blue-900 transition-colors text-sm px-2 py-1"
                            >
                                <Plus size={18} />
                                Thêm dòng (F2)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex justify-end gap-3 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-bold shadow-md transition-all active:scale-95"
                    >
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : 'Hoàn tất nhập kho'}
                    </button>
                </div>

                {showImportModal && (
                    <OpeningStockImportModal
                        warehouseId={formData.warehouseId}
                        onClose={() => setShowImportModal(false)}
                        onSuccess={(data) => {
                            if (data && data.length > 0) {
                                setItems(data as ItemRow[]);
                                setCurrentPage(1);
                                alert('Đã điền dữ liệu từ file Excel. Vui lòng kiểm tra lại.');
                            } else {
                                alert('Không có dữ liệu hợp lệ nào được tìm thấy trong file.');
                            }
                            setShowImportModal(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
export default OpeningStockCreateModal;
