import React, { useState, useEffect } from 'react';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { getSuppliers, Supplier } from '../../suppliers/services/supplierService';
import { getUsers } from '../../users/services/userService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { Product } from '../../products/models/Product';
import { User } from '../../users/models/User';
import { Plus, Trash2, Save, X, Calculator } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import SupplierSearchSelect from '../../../components/common/SupplierSearchSelect';
import api from '../../../api/axios';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

interface ItemRow {
    productId: string;
    productName: string;
    productCode: string;
    unitName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number; // Actual Quantity (SL Thực tế)
    price: number; // Purchase Price (Đơn giá mua)
    requestedQuantity: number; // SL Yêu cầu (UI)
    conversionRate: number; // Tỷ lệ quy đổi
    currency: string; // Tiền tệ
    exchangeRate: number; // Tỷ giá
    sellingPrice: number; // Đơn giá bán
    vatRate: number; // % VAT
    vatAmount: number; // Tiền VAT (Calculated)
    totalAmount: number; // Thành tiền (Calculated: Qty * Price)
    grandTotal: number; // Tiền VAT + Thành tiền (Calculated)
    discount: number; // Khuyến mãi
    surcharge: number; // Phụ thu
    registrationNumber: string;
    approvalOrder: string; // STT Phê duyệt
    bidPackageCode: string;
    bidGroupCode: string;
    bidDecisionNumber: string;
}

const SupplierImportCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    // Header State
    const [formData, setFormData] = useState({
        warehouseId: '',
        supplierId: '',
        voucherDate: new Date().toISOString().split('T')[0],
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceNo: '',
        serialNo: '',
        fundingSource: '',
        receiver: '', // Person receiving
        deliverer: '', // Person delivering
        description: '',
        vatRate: 0
    });

    const [loading, setLoading] = useState(false);

    // Items State
    const [items, setItems] = useState<ItemRow[]>([
        {
            productId: '', productName: '', productCode: '', unitName: '',
            batchNumber: '', expiryDate: '', quantity: 1, price: 0,
            requestedQuantity: 1, conversionRate: 1,
            currency: 'VND', exchangeRate: 1, sellingPrice: 0,
            vatRate: 0, vatAmount: 0, totalAmount: 0, grandTotal: 0,
            discount: 0, surcharge: 0,
            registrationNumber: '', approvalOrder: '', bidPackageCode: '', bidGroupCode: '', bidDecisionNumber: ''
        }
    ]);

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch Warehouses
            try {
                const wData = await getWarehouses();
                const wList = Array.isArray(wData) ? wData : (wData?.data || []);
                setWarehouses(wList);
                if (wList.length > 0) {
                    setFormData(prev => ({ ...prev, warehouseId: String(wList[0].Id) }));
                }
            } catch (error) {
                console.error('Failed to fetch warehouses', error);
            }

            // Fetch Users
            try {
                const uData = await getUsers();
                setUsers(Array.isArray(uData) ? uData : []);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }

            // Fetch Suppliers (Non-critical, for caching/initial name)
            try {
                const sData = await getSuppliers({ per_page: 100 });
                const suppliersList = Array.isArray(sData) ? sData : (sData?.data || []);
                setSuppliers(suppliersList);
            } catch (error) {
                console.error('Failed to fetch suppliers', error);
            }
        };
        fetchInitialData();
    }, []);

    // --- Item Handlers ---

    const addItemRow = () => {
        setItems([...items, {
            productId: '', productName: '', productCode: '', unitName: '',
            batchNumber: '', expiryDate: '', quantity: 1, price: 0,
            requestedQuantity: 1, conversionRate: 1,
            currency: 'VND', exchangeRate: 1, sellingPrice: 0,
            vatRate: 0, vatAmount: 0, totalAmount: 0, grandTotal: 0,
            discount: 0, surcharge: 0,
            registrationNumber: '', approvalOrder: '', bidPackageCode: '', bidGroupCode: '', bidDecisionNumber: ''
        }]);
    };

    const removeItemRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        if (newItems.length === 0) {
            addItemRow();
        } else {
            setItems(newItems);
        }
    };

    const updateItem = (index: number, field: keyof ItemRow, value: any) => {
        const newItems = [...items];
        let item = { ...newItems[index] };
        (item as any)[field] = value;

        // Auto-calc logic
        // 1. Quantity = Requested * Conversion
        if (field === 'requestedQuantity' || field === 'conversionRate') {
            item.quantity = (item.requestedQuantity || 0) * (item.conversionRate || 1);
        }

        // 2. Total Amount (Thành tiền) = Quantity * Price
        // Recalculate if Quantity, Price changed
        if (field === 'requestedQuantity' || field === 'conversionRate' || field === 'price' || field === 'quantity') {
            // If direct quantity edit, keep it (though calc overwrites). 
            // Assume flow: User edits Req/Rate -> Qty updates.
            item.totalAmount = item.quantity * item.price;
        }

        // 3. VAT Amount = Total Amount * VAT Rate / 100
        if (field === 'requestedQuantity' || field === 'conversionRate' || field === 'price' || field === 'vatRate' || field === 'quantity') {
            item.vatAmount = item.totalAmount * (item.vatRate / 100);
        }

        // 4. Grand Total = Total Amount + VAT Amount - Discount + Surcharge
        // Recalc all dependants
        item.grandTotal = (item.totalAmount || 0) + (item.vatAmount || 0) - (item.discount || 0) + (item.surcharge || 0);

        newItems[index] = item;
        setItems(newItems);
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items];
        newItems[index].productId = String(product.Id);
        newItems[index].productName = product.Name;
        newItems[index].productCode = product.Code;
        newItems[index].unitName = product.unit?.Name || product.UnitName || 'Đơn vị';

        // Auto-fill from Product Details
        if (product.medicine) {
            newItems[index].registrationNumber = product.medicine.RegistrationNumber || '';

            // Check for Bids
            if (product.bids && product.bids.length > 0) {
                // Find priority bid or take first
                const priorityBid = product.bids.find(b => b.IsPriority) || product.bids[0];

                newItems[index].approvalOrder = priorityBid.ApprovalOrder || '';
                newItems[index].bidPackageCode = priorityBid.PackageCode || '';
                newItems[index].bidGroupCode = priorityBid.GroupCode || '';
                newItems[index].bidDecisionNumber = priorityBid.DecisionNumber || '';
                if (priorityBid.BidPrice) newItems[index].price = priorityBid.BidPrice;
            }
        } else if (product.chemical) {
            newItems[index].registrationNumber = product.chemical.RegistrationNumber || '';
        }

        setItems(newItems);
    };

    // --- Submit ---

    const handleSubmit = async () => {
        if (!formData.warehouseId) {
            alert('Vui lòng chọn kho nhập');
            return;
        }
        if (!formData.supplierId) {
            alert('Vui lòng chọn nhà cung cấp');
            return;
        }

        const validItems = items.filter(i => i.productId && i.batchNumber && i.expiryDate && i.quantity > 0);
        if (validItems.length === 0) {
            alert('Vui lòng nhập ít nhất một dòng hàng hóa đầy đủ');
            return;
        }

        setLoading(true);
        try {

            await api.post('/inventory/supplier-import', {
                ...formData,
                PartnerId: formData.supplierId,
                VoucherType: 'Import',
                Details: validItems.map(item => ({
                    ProductId: item.productId,
                    BatchNumber: item.batchNumber,
                    ExpiryDate: item.expiryDate,
                    Quantity: item.quantity,
                    Price: item.price,
                    // New Fields mapping to backend
                    RequestedQuantity: item.requestedQuantity,
                    ConversionRate: item.conversionRate,
                    UnitName: item.unitName,
                    Currency: item.currency,
                    ExchangeRate: item.exchangeRate,
                    SellingPrice: item.sellingPrice,
                    VATRate: item.vatRate,
                    VATAmount: item.vatAmount,
                    TotalAmount: item.totalAmount, // Assuming backend uses this for 'Thành tiền' before or after VAT? Let's send calculated value.
                    Discount: item.discount,
                    Surcharge: item.surcharge,
                    RegistrationNumber: item.registrationNumber,
                    ApprovalOrder: item.approvalOrder,
                    BidPackageCode: item.bidPackageCode,
                    BidGroup: item.bidGroupCode,
                    BidDecision: item.bidDecisionNumber,
                }))
            });

            alert('Tạo phiếu nhập nhà thầu thành công!');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
        } finally {
            setLoading(false);
        }
    };

    // Helper: Total Price
    const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
                {/* Header Title */}
                <div className="p-4 border-b flex justify-between items-center bg-white text-gray-800">
                    <h2 className="text-xl font-bold">Thêm phiếu nhập kho (Nhà thầu)</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {/* Top Form Grid */}
                    {/* Top Form Grid */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Row 1 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Số phiếu nhập</label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full mt-1 px-2 py-1.5 bg-gray-100 border rounded text-xs text-gray-500 italic"
                                    placeholder="Mã tự sinh"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Số Seri *</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                    value={formData.serialNo}
                                    onChange={e => setFormData({ ...formData, serialNo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Số hóa đơn *</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                    value={formData.invoiceNo}
                                    onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })}
                                />
                            </div>
                            {/* Split Column: Invoice Date & Voucher Date */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Ngày hóa đơn *</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                        value={formData.invoiceDate}
                                        onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Ngày nhập *</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                        value={formData.voucherDate}
                                        onChange={e => setFormData({ ...formData, voucherDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Nhà cung cấp *</label>
                                <div className="mt-1">
                                    <SupplierSearchSelect
                                        onSelect={(s) => setFormData({ ...formData, supplierId: String(s.Id) })}
                                        initialDisplayName={suppliers.find(s => String(s.Id) === formData.supplierId)?.Name}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Người giao</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                    value={formData.deliverer}
                                    onChange={e => setFormData({ ...formData, deliverer: e.target.value })}
                                />
                            </div>
                            {/* Split Column: Receiver & Warehouse */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Người nhận *</label>
                                    <select
                                        className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                        value={formData.receiver}
                                        onChange={e => setFormData({ ...formData, receiver: e.target.value })}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {users.map(u => (
                                            <option key={u.Id} value={u.FullName}>{u.FullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Kho nhận *</label>
                                    <select
                                        className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                        value={formData.warehouseId}
                                        onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {warehouses.map(w => (
                                            <option key={w.Id} value={w.Id}>{w.Name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Nguồn nhập hàng *</label>
                                <select
                                    className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                    value={formData.fundingSource}
                                    onChange={e => setFormData({ ...formData, fundingSource: e.target.value })}
                                >
                                    <option value="">-- Chọn Nguồn --</option>
                                    <option value="Cơ số PCD tiêu chảy cấp">Cơ số PCD tiêu chảy cấp</option>
                                    <option value="Mua">Mua</option>
                                    <option value="Nguồn chi cục dân số">Nguồn chi cục dân số</option>
                                    <option value="Nguồn địa phương">Nguồn địa phương</option>
                                    <option value="Nguồn không tự chủ tồn kho">Nguồn không tự chủ tồn kho</option>
                                    <option value="Nguồn NSNN">Nguồn NSNN</option>
                                    <option value="Nguồn PEPFAR">Nguồn PEPFAR</option>
                                    <option value="Nguồn quỹ toàn cầu">Nguồn quỹ toàn cầu</option>
                                    <option value="Nguồn thu viện phí">Nguồn thu viện phí</option>
                                    <option value="Thuốc chương trình">Thuốc chương trình</option>
                                </select>
                            </div>

                            {/* Row 3 */}
                            {/* Split Column: VAT & Empty */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Tỷ lệ VAT %</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                        value={formData.vatRate}
                                        onChange={e => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-700">Diễn giải</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Total Summary Row (Compact) */}
                        <div className="mt-4 pt-4 border-t flex justify-end items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Tổng tiền hàng:</span>
                                <span className="font-semibold">{items.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Tổng thanh toán:</span>
                                <span className="text-lg font-bold text-blue-600">{grandTotal.toLocaleString()} VND</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Calculator size={20} className="text-blue-600" />
                                Danh sách dược phẩm
                            </h3>
                            <button
                                onClick={addItemRow}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm transition-colors"
                            >
                                <Plus size={16} /> Thêm dòng (F2)
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-gray-100 text-gray-700 font-semibold">
                                    <tr>
                                        <th className="p-3 w-10 text-center min-w-[50px]">STT</th>
                                        <th className="p-3 min-w-[250px]">Mã / Tên SP *</th>
                                        <th className="p-3 min-w-[80px]">ĐVT</th>
                                        <th className="p-3 min-w-[100px]">Số lượng *</th>
                                        <th className="p-3 min-w-[120px]">Số lô *</th>
                                        <th className="p-3 min-w-[140px]">Hạn sử dụng *</th>
                                        <th className="p-3 min-w-[140px]">Đơn giá mua *</th>
                                        <th className="p-3 min-w-[140px]">Thành tiền</th>
                                        <th className="p-3 min-w-[80px]">% VAT</th>
                                        <th className="p-3 min-w-[120px]">Tiền VAT</th>
                                        <th className="p-3 min-w-[150px]">Tổng cộng</th>

                                        {/* Hidden or Less Priority Fields */}
                                        <th className="p-3 min-w-[120px] text-gray-400">Số QD thầu</th>
                                        <th className="p-3 min-w-[100px] text-gray-400">Mã gói</th>
                                        <th className="p-3 min-w-[100px] text-gray-400">Mã nhóm</th>
                                        <th className="p-3 min-w-[120px] text-gray-400">Số ĐK</th>

                                        {/* Extremely detailed fields (can scroll to see) */}
                                        <th className="p-3 w-16 text-center sticky right-0 bg-gray-100 z-10">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                            <td className="p-2">
                                                <ProductSearchSelect
                                                    initialDisplayName={item.productCode ? `${item.productName} (${item.productCode})` : item.productName}
                                                    value={item.productId}
                                                    onSelect={(p) => handleProductSelect(idx, p)}
                                                />
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent outline-none"
                                                    value={item.unitName}
                                                    onChange={e => updateItem(idx, 'unitName', e.target.value)}
                                                    tabIndex={-1}
                                                />
                                            </td>

                                            {/* Priority Group 1: Quantity, Batch, Expiry */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-right focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                    placeholder="Số lô"
                                                    value={item.batchNumber}
                                                    onChange={e => updateItem(idx, 'batchNumber', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.expiryDate}
                                                    onChange={e => updateItem(idx, 'expiryDate', e.target.value)}
                                                />
                                            </td>

                                            {/* Priority Group 2: Price, Total */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.price}
                                                    onChange={e => updateItem(idx, 'price', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 text-right bg-gray-50 font-bold">
                                                {item.totalAmount.toLocaleString()}
                                            </td>

                                            {/* VAT & Grand Total */}
                                            <td className="p-2">
                                                <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 text-right" value={item.vatRate} onChange={e => updateItem(idx, 'vatRate', Number(e.target.value))} />
                                            </td>
                                            <td className="p-2 text-right bg-gray-50 text-gray-600">
                                                {item.vatAmount.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right bg-green-50 font-bold text-green-700">
                                                {item.grandTotal.toLocaleString()}
                                            </td>

                                            {/* Extra Info (Bids) */}
                                            <td className="p-2">
                                                <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidDecisionNumber} readOnly tabIndex={-1} placeholder="..." />
                                            </td>
                                            <td className="p-2">
                                                <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidPackageCode} readOnly tabIndex={-1} placeholder="..." />
                                            </td>
                                            <td className="p-2">
                                                <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.bidGroupCode} readOnly tabIndex={-1} placeholder="..." />
                                            </td>
                                            <td className="p-2">
                                                <input type="text" className="w-full border-none bg-transparent text-gray-500 text-sm" value={item.registrationNumber} readOnly tabIndex={-1} placeholder="..." />
                                            </td>

                                            <td className="p-2 text-center sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                                                <button
                                                    onClick={() => removeItemRow(idx)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t flex justify-end gap-3 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Hủy bỏ (Esc)
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 text-base"
                    >
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : 'Lưu phiếu (F11)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierImportCreateModal;
