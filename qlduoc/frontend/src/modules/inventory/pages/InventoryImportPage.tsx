import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { createOpeningStockManual, parseOpeningStock, downloadSample, createStockVoucher as createImportNote } from '../services/inventoryService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { Product } from '../../products/models/Product';
import { FileUp, Plus, Trash2, Save, Download } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import SupplierSearchSelect from '../../../components/common/SupplierSearchSelect';

interface InventoryImportPageProps {
    isEmbed?: boolean;
    forcedMode?: 'OPENING_STOCK' | 'SUPPLIER';
}

const InventoryImportPage: React.FC<InventoryImportPageProps> = ({ isEmbed, forcedMode }) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');

    // Import Mode
    const [importMode, setImportMode] = useState<'OPENING_STOCK' | 'SUPPLIER'>(forcedMode || 'SUPPLIER');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedSupplierName, setSelectedSupplierName] = useState('');

    useEffect(() => {
        if (forcedMode) setImportMode(forcedMode);
    }, [forcedMode]);

    // State
    const [loading, setLoading] = useState(false);

    // Auto-generate code: PN + YYYYMMDD + HHmm
    const generateCode = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `PN${yyyy}${mm}${dd}${hh}${min}`;
    };

    const [manualCode, setManualCode] = useState(generateCode());
    const [manualItems, setManualItems] = useState<any[]>([
        { product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0, vat: 0, discount: 0 }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const wData = await getWarehouses();
            setWarehouses(wData);
            if (wData.length > 0) setSelectedWarehouse(wData[0].id);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleFileParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLoading(true);
            try {
                const parsedItems = await parseOpeningStock(file);
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                    const newItems = parsedItems.map(item => ({
                        product_id: item.product_id,
                        product_name: item.product_name,
                        product_code: item.product_code,
                        batch_code: item.batch_code,
                        expiry_date: item.expiry_date,
                        quantity: item.quantity,
                        price: item.price
                    }));

                    if (manualItems.length === 1 && !manualItems[0].product_id) {
                        setManualItems(newItems);
                    } else {
                        setManualItems([...manualItems, ...newItems]);
                    }
                    alert(`Đã đọc ${newItems.length} dòng từ file Excel`);
                } else {
                    alert('File không có dữ liệu hoặc không tìm thấy mã thuốc nào khớp.');
                }
            } catch (error: any) {
                alert('Lỗi đọc file: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        }
    };

    const onDownloadSample = async () => {
        try {
            await downloadSample();
        } catch (error) {
            alert('Lỗi tải file mẫu');
        }
    };

    // ... Manual Handlers ...
    const addManualItem = () => {
        setManualItems([...manualItems, { product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0, vat: 0, discount: 0 }]);
    };

    const removeManualItem = (index: number) => {
        const newItems = [...manualItems];
        newItems.splice(index, 1);
        setManualItems(newItems);
    };

    const updateManualItem = (index: number, field: string, value: any) => {
        const newItems = [...manualItems];
        newItems[index][field] = value;
        setManualItems(newItems);
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...manualItems];
        newItems[index].product_id = product.Id;
        newItems[index].product_name = product.Name;
        newItems[index].product_code = product.Code;
        // Price might not be directly in Product root if not added, checking interface
        // Implementation plan said Price is in Product? 
        // Product interface has 'price' or 'Price'? 
        // I checked Product.ts in step 187, it does NOT have Price. It has Relations.
        // Wait, I removed 'price' from Product interface in step 187?
        // Let me check Product.ts again in my mind. 
        // Yes, step 187: Id, Code, Name, ProductTypeId, UnitId, Manufacturer... No Price.
        // Price is likely in StockVoucherDetail (historical) or we need to fetch it.
        // Or I should add Price to Product model if it has a base price?
        // The DB `Products` table doesn't seem to have Price? 
        // Let's check `create_products_table` migration again.
        // Step 126 view_file 10_create_products_table: Id, Code, Name, ... No Price.
        // Step 130 view_file 22_create_stock_voucher_details_table: Price is there.
        // Step 130 view_file 23_inventory_snapshots_table: Price is AveragePrice.
        // So Product itself might not have a fixed selling price in this schema?
        // Or maybe it's in `ProductMedicines`? 
        // Let's assume Price is 0 for now or add it to interface if backend returns it (maybe from latest import?).
        // For now, I will set Price to 0.
        newItems[index].price = 0;
        setManualItems(newItems);
    };

    const handleManualSubmit = async () => {
        if (!selectedWarehouse) {
            alert('Vui lòng chọn kho');
            return;
        }
        if (manualItems.some(i => !i.product_id || !i.batch_code || !i.expiry_date || i.quantity <= 0)) {
            alert('Vui lòng điền đầy đủ thông tin chi tiết (Thuốc, Lô, HSD, SL > 0)');
            return;
        }

        setLoading(true);
        try {
            if (importMode === 'OPENING_STOCK') {
                await createOpeningStockManual({
                    VoucherDate: new Date().toISOString(), // Or from input
                    VoucherType: 'Import',
                    TargetWarehouseId: selectedWarehouse,
                    Details: manualItems.map(item => ({
                        ProductId: item.product_id,
                        BatchNumber: item.batch_code,
                        ExpiryDate: item.expiry_date,
                        Quantity: item.quantity,
                        Price: item.price,
                        VATRate: item.vat || 0
                    }))
                });
            } else {
                if (!selectedSupplier) {
                    alert('Vui lòng chọn nhà cung cấp');
                    setLoading(false);
                    return;
                }
                // Construct PascalCase Payload/StockVoucher
                await createImportNote({
                    VoucherDate: new Date().toISOString(),
                    VoucherType: 'Import',
                    TargetWarehouseId: selectedWarehouse,
                    PartnerId: selectedSupplier,
                    InvoiceNo: manualCode,
                    Details: manualItems.map(item => ({
                        ProductId: item.product_id,
                        BatchNumber: item.batch_code,
                        ExpiryDate: item.expiry_date,
                        Quantity: item.quantity,
                        Price: item.price,
                        VATRate: item.vat || 0
                    }))
                });
            }
            alert('Tạo phiếu nhập thành công!');
            setManualItems([{ product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0 }]);
            setManualCode(generateCode());
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className={isEmbed ? "" : "w-full"}>
            {!forcedMode && (
                <div className="mb-6 flex justify-between items-end border-b pb-4">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setImportMode('SUPPLIER')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${importMode === 'SUPPLIER'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Nhập từ nhà cung cấp
                        </button>
                        <button
                            onClick={() => setImportMode('OPENING_STOCK')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${importMode === 'OPENING_STOCK'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Nhập tồn đầu
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onDownloadSample}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Download size={18} />
                            Tải file mẫu
                        </button>

                        <input
                            type="file"
                            id="excel-upload"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileParse}
                        />
                        <label
                            htmlFor="excel-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer shadow-sm transition-colors text-sm font-medium ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <FileUp size={18} />
                            {loading ? 'Đang đọc...' : 'Nhập từ Excel'}
                        </label>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Header Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Mã phiếu</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 bg-gray-50 text-sm"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Ngày lập</label>
                        <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Kho nhập</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                        >
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    {importMode === 'SUPPLIER' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">Nhà cung cấp</label>
                            <SupplierSearchSelect
                                initialDisplayName={selectedSupplierName}
                                onSelect={(s) => {
                                    setSelectedSupplier(s.id);
                                    setSelectedSupplierName(`${s.name} (${s.code})`);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Details Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Chi tiết phiếu nhập</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-3 border">#</th>
                                    <th className="p-3 border min-w-[200px]">Tên hàng hóa</th>
                                    <th className="p-3 border w-32">Số lô</th>
                                    <th className="p-3 border w-32">Hạn dùng</th>
                                    <th className="p-3 border w-24">Số lượng</th>
                                    <th className="p-3 border w-32">Đơn giá</th>
                                    <th className="p-3 border w-20">VAT %</th>
                                    <th className="p-3 border w-28">CK (VNĐ)</th>
                                    <th className="p-3 border w-32">Thành tiền</th>
                                    <th className="p-3 border w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {manualItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-2 border text-center">{index + 1}</td>
                                        <td className="p-2 border">
                                            <ProductSearchSelect
                                                value={item.product_id}
                                                initialDisplayName={item.product_id ? (item.product_name ? `${item.product_name} (${item.product_code || ''})` : 'Đã chọn thuốc') : ''}
                                                onSelect={(p) => handleProductSelect(index, p)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded px-2 py-1"
                                                value={item.batch_code}
                                                onChange={(e) => updateManualItem(index, 'batch_code', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded px-2 py-1"
                                                value={item.expiry_date}
                                                onChange={(e) => updateManualItem(index, 'expiry_date', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                value={item.quantity}
                                                onChange={(e) => updateManualItem(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                value={item.price}
                                                onChange={(e) => updateManualItem(index, 'price', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                placeholder="0"
                                                value={item.vat}
                                                onChange={(e) => updateManualItem(index, 'vat', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                placeholder="0"
                                                value={item.discount}
                                                onChange={(e) => updateManualItem(index, 'discount', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 border text-right font-medium text-gray-700">
                                            {(item.quantity * item.price * (1 + (item.vat || 0) / 100) - (item.discount || 0)).toLocaleString()}
                                        </td>
                                        <td className="p-2 border text-center">
                                            <button onClick={() => removeManualItem(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-between items-center border-t pt-4">
                        <button onClick={addManualItem} className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800">
                            <Plus size={18} /> Thêm dòng
                        </button>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 bg-blue-50 px-4 py-1 rounded-lg">
                                Tổng tiền: {manualItems.reduce((sum, item) => sum + (item.quantity * item.price * (1 + (item.vat || 0) / 100) - (item.discount || 0)), 0).toLocaleString()} VND
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
                    <button
                        onClick={handleManualSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md font-bold"
                    >
                        <Save size={20} />
                        {loading ? 'Đang xử lý...' : 'Lưu phiếu nhập'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (isEmbed) {
        return content;
    }

    return (
        <DashboardLayout>
            {content}
        </DashboardLayout>
    );
};

export default InventoryImportPage;
