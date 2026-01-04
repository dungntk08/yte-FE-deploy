import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { createOpeningStockManual } from '../services/inventoryService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { Product } from '../../products/models/Product';
import { Plus, Trash2, Save, Upload } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import OpeningStockImportModal from '../components/OpeningStockImportModal';

const OpeningStockCreatePage: React.FC = () => {
    // Basic State
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Layout State
    // "items" will store the flat list of product-batch combinations
    // Each item: { productId, productName, productCode, batchNumber, expiryDate, quantity, price }
    const [items, setItems] = useState<any[]>([]);

    // Current Entry State (The product being added)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    // Batches for the current product being added
    const [currentBatches, setCurrentBatches] = useState<any[]>([
        { batchNumber: '', expiryDate: '', quantity: 1, price: 0 }
    ]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const wData = await getWarehouses();
                setWarehouses(wData);
                if (wData.length > 0) setSelectedWarehouse(String(wData[0].Id));
            } catch (error) {
                console.error('Failed to fetch warehouses', error);
            }
        };
        fetchInitialData();
    }, []);

    // --- Current Product/Batch Handler ---

    const handleProductSelect = (product: Product) => {
        setCurrentProduct(product);
        // Reset batches to one empty row
        setCurrentBatches([{ batchNumber: '', expiryDate: '', quantity: 1, price: 0 }]);
    };

    const updateCurrentBatch = (index: number, field: string, value: any) => {
        const newBatches = [...currentBatches];
        newBatches[index][field] = value;
        setCurrentBatches(newBatches);
    };

    const addBatchRow = () => {
        setCurrentBatches([...currentBatches, { batchNumber: '', expiryDate: '', quantity: 1, price: 0 }]);
    };

    const removeBatchRow = (index: number) => {
        if (currentBatches.length > 1) {
            const newBatches = [...currentBatches];
            newBatches.splice(index, 1);
            setCurrentBatches(newBatches);
        }
    };

    const confirmAddToMainList = () => {
        if (!currentProduct) return;

        // Validate
        const validBatches = currentBatches.filter(b => b.batchNumber && b.expiryDate && b.quantity > 0);
        if (validBatches.length === 0) {
            alert('Vui lòng nhập ít nhất một lô hợp lệ (Số lô, Hạn dùng, SL > 0)');
            return;
        }

        const newItems = validBatches.map(b => ({
            productId: currentProduct.Id,
            productCode: currentProduct.Code,
            productName: currentProduct.Name,
            unitName: currentProduct.unit?.Name || 'Đơn vị',
            batchNumber: b.batchNumber,
            expiryDate: b.expiryDate,
            quantity: b.quantity,
            price: b.price
        }));

        setItems([...items, ...newItems]);

        // Reset Current Entry
        setCurrentProduct(null);
        setCurrentBatches([{ batchNumber: '', expiryDate: '', quantity: 1, price: 0 }]);
    };

    // --- Main List Handler ---

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // --- Submit ---

    const handleSubmit = async () => {
        if (!selectedWarehouse) {
            alert('Vui lòng chọn kho');
            return;
        }
        if (items.length === 0) {
            alert('Danh sách hàng hóa trống');
            return;
        }

        setLoading(true);
        try {
            await createOpeningStockManual({
                VoucherDate: voucherDate,
                VoucherType: 'Import', // Opening Stock is technically an import
                TargetWarehouseId: selectedWarehouse,
                Status: 'Approved',
                Description: 'Nhập tồn đầu kỳ',
                Details: items.map(item => ({
                    ProductId: item.productId,
                    BatchNumber: item.batchNumber,
                    ExpiryDate: item.expiryDate,
                    Quantity: item.quantity,
                    Price: item.price,
                }))
            });
            alert('Nhập tồn đầu thành công!');
            setItems([]);
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Nhập tồn đầu kỳ</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm font-medium"
                        >
                            <Upload size={18} />
                            Nhập từ Excel
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT PANEL: Entry Form */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 1. Warehouse & Date */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhập</label>
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={selectedWarehouse}
                                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    >
                                        {warehouses.map(w => (
                                            <option key={w.Id} value={w.Id}>{w.Name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày lập phiếu</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={voucherDate}
                                        onChange={(e) => setVoucherDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Product Search */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <h3 className="font-semibold text-gray-800 mb-3 block border-b pb-2">1. Chọn sản phẩm</h3>
                            <div className="mb-4">
                                <ProductSearchSelect
                                    initialDisplayName={currentProduct ? `${currentProduct.Name} (${currentProduct.Code})` : ''}
                                    onSelect={handleProductSelect}
                                />
                            </div>

                            {currentProduct && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                                        Đang nhập cho: <strong>{currentProduct.Name}</strong> <br />
                                        ĐVT: {currentProduct.unit?.Name || 'Đơn vị'}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-700">2. Nhập chi tiết lô</label>
                                            <button onClick={addBatchRow} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center">
                                                <Plus size={14} /> Thêm lô
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                            {currentBatches.map((batch, idx) => (
                                                <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-gray-50 relative group">
                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <div>
                                                            <label className="text-xs text-gray-500">Số lô *</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Số lô..."
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                value={batch.batchNumber}
                                                                onChange={(e) => updateCurrentBatch(idx, 'batchNumber', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500">Hạn dùng *</label>
                                                            <input
                                                                type="date"
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                value={batch.expiryDate}
                                                                onChange={(e) => updateCurrentBatch(idx, 'expiryDate', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-500">Số lượng *</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                value={batch.quantity}
                                                                onChange={(e) => updateCurrentBatch(idx, 'quantity', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500">Giá vốn</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                value={batch.price}
                                                                onChange={(e) => updateCurrentBatch(idx, 'price', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {currentBatches.length > 1 && (
                                                        <button
                                                            onClick={() => removeBatchRow(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={confirmAddToMainList}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                                    >
                                        Thêm vào danh sách ↓
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Main List */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <h3 className="font-bold text-gray-800">Danh sách hàng hóa ({items.length})</h3>
                                <div className="text-sm font-medium text-blue-800">
                                    Tổng giá trị: {items.reduce((sum, i) => sum + (i.quantity * i.price), 0).toLocaleString()} VND
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-0">
                                {items.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                        <Plus size={48} className="mb-2 opacity-50" />
                                        <p>Chưa có sản phẩm nào</p>
                                        <p className="text-sm">Vui lòng chọn sản phẩm và nhập lô ở cột bên trái</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600">STT</th>
                                                <th className="p-3 font-semibold text-gray-600">Tên hàng hóa</th>
                                                <th className="p-3 font-semibold text-gray-600">Lô / Hạn</th>
                                                <th className="p-3 font-semibold text-gray-600 text-right">SL</th>
                                                <th className="p-3 font-semibold text-gray-600 text-right">Giá vốn</th>
                                                <th className="p-3 font-semibold text-gray-600 text-right">Thành tiền</th>
                                                <th className="p-3 font-semibold text-gray-600 text-center">Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                                    <td className="p-3 text-gray-500">{idx + 1}</td>
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-800">{item.productName}</div>
                                                        <div className="text-xs text-gray-500">{item.productCode} - {item.unitName}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-medium">{item.batchNumber}</div>
                                                        <div className="text-xs text-gray-500">{item.expiryDate}</div>
                                                    </td>
                                                    <td className="p-3 text-right font-medium">{item.quantity}</td>
                                                    <td className="p-3 text-right">{item.price.toLocaleString()}</td>
                                                    <td className="p-3 text-right font-medium">{(item.quantity * item.price).toLocaleString()}</td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => removeItem(idx)}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                                <button className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-white font-medium">
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || items.length === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-bold shadow-md"
                                >
                                    <Save size={18} />
                                    {loading ? 'Đang lưu...' : 'Hoàn tất nhập kho'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showImportModal && (
                    <OpeningStockImportModal
                        warehouseId={selectedWarehouse}
                        onClose={() => setShowImportModal(false)}
                        onSuccess={() => {
                            // Maybe refresh data or notify user
                            alert('Nhập dữ liệu từ Excel thành công!');
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default OpeningStockCreatePage;
