import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Eye, Search, Calendar, X, Package, FileText, Plus } from 'lucide-react';

import SupplierImportCreateModal from './SupplierImportCreateModal';
import OpeningStockCreateModal from './OpeningStockCreateModal';
import InternalExportCreatePage from '../pages/InternalExportCreatePage'; // Check path

interface Props {
    type: 'import' | 'export';
    subType?: string;
}

const InventoryNoteList: React.FC<Props> = ({ type, subType }) => {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubType, setSelectedSubType] = useState(subType || '');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOpeningStockModal, setShowOpeningStockModal] = useState(false);
    const [showInternalExportModal, setShowInternalExportModal] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);

    useEffect(() => {
        setSelectedSubType(subType || '');
    }, [subType]);

    useEffect(() => {
        fetchNotes();
    }, [type, selectedSubType, page, limit]); // React to filter changes
    // Date changes usually require manual search trigger or debounce, but implicit feels okay if user picks date.
    // However, usually date range is chosen then button clicked. Let's keep it manual or affect specific effect?
    // User requested "Filter", usually implies Search button click for dates.
    // But fetchNotes is called by effect on page/limit.
    // I will add them to params in fetchNotes but NOT to dependency array to strictly auto-trigger,
    // UNLESS I want instant update. Let's make it instant for UX.
    useEffect(() => {
        if (startDate && endDate) fetchNotes();
        // Only if both are present? Or valid?
        // Let's rely on the "Tìm kiếm" button for dates to avoid excessive reloads while picking,
        // OR add to dependency array. "Tìm kiếm" button already calls fetchNotes.
        // I will NOT add to dependency array to avoid double fetch if user is typing date.
        // Wait, current effect [type, subType, page, limit] calls fetchNotes.
        // If I change date, I might want to Search.
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/notes', {
                params: {
                    type,
                    sub_type: selectedSubType, // Use local state
                    page,
                    limit,
                    from_date: startDate,
                    to_date: endDate,
                    code: searchTerm
                }
            });
            // Backend pagination wrap: { current_page, data, last_page, ... }
            setNotes(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Error fetching inventory notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNoteDetail = async (id: string) => {
        setLoadingDetail(true);
        try {
            const response = await api.get(`/inventory/notes/${id}`);
            setSelectedNote(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching note detail:', error);
            alert('Không thể tải chi tiết phiếu');
        } finally {
            setLoadingDetail(false);
        }
    };

    const getStatusBadge = (status: string | number) => {
        // Backend Status is string: 'Approved', 'Pending'
        const s = String(status).toLowerCase();
        switch (s) {
            case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Hoàn thành</span>;
            case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Tạm lưu</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Đã hủy</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
        }
    };

    const getSubTypeLabel = (note: any) => {
        // Logic to determine sub_type from backend data if not explicit
        // Backend: VoucherType, PartnerId
        const voucherType = note.VoucherType;
        const hasPartner = !!note.PartnerId;

        if (voucherType === 'Import') {
            if (hasPartner) return 'Nhà cung cấp';
            if (note.SourceWarehouseId) return 'Nội bộ';
            return 'Tồn đầu kỳ'; // Fallback
        }
        if (voucherType === 'Export') {
            if (note.TargetWarehouseId || note.target_warehouse) return 'Xuất nội bộ';
            // Consumable / Manual Export: Check Description for Reason
            const desc = note.Description || '';
            if (desc.startsWith('Xuất hàng tồn')) return 'Xuất hàng tồn';
            if (desc.startsWith('Xuất hàng hỏng')) return 'Xuất hàng hỏng';
            if (desc.startsWith('Xuất trả hàng')) return 'Xuất trả hàng';
            if (desc.startsWith('Xuất tiêu hao')) return 'Xuất tiêu hao';
            return 'Xuất khác'; // Default consumable
        }
        if (voucherType === 'Prescription') return 'Xuất đơn';

        return voucherType;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const importFilters = [
        { value: '', label: 'Tất cả phiếu nhập' },
        { value: 'supplier', label: 'Nhập từ NCC' },
        { value: 'opening', label: 'Nhập tồn đầu' },
        { value: 'internal', label: 'Nhập nội bộ' },
        { value: 'return', label: 'Khách trả lại' },
    ];

    const exportFilters = [
        { value: '', label: 'Tất cả phiếu xuất' },
        { value: 'prescription', label: 'Xuất đơn thuốc' },
        { value: 'retail', label: 'Bán lẻ' },
        { value: 'internal', label: 'Xuất nội bộ' },
        { value: 'damaged', label: 'Hủy/Hỏng' },
        { value: 'consumable', label: 'Tiêu hao' },
    ];

    const handleStatusAction = async (action: 'approve' | 'revert' | 'cancel') => {
        if (!selectedNote) return;
        if (!confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'duyệt' : action === 'revert' ? 'hoàn tác' : 'hủy'} phiếu này?`)) return;

        let status = 'Pending';
        if (action === 'approve') status = 'Approved';
        if (action === 'cancel') status = 'Cancelled';
        // action 'revert' -> 'Pending'

        try {
            await api.post(`/inventory/notes/${selectedNote.Id}/status`, { status });
            alert('Thao tác thành công');
            setShowDetailModal(false);
            fetchNotes();
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (note: any) => {
        if (getSubTypeLabel(note) === 'Nhà cung cấp' || note.PartnerId) {
            setEditingNote(note);
            setShowDetailModal(false);
        } else {
            alert('Chức năng sửa cho loại phiếu này đang phát triển...');
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Type Filter - Only show if no fixed subType is passed */}
                {!subType && (
                    <div className="w-full sm:w-48">
                        <select
                            className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedSubType}
                            onChange={(e) => {
                                setSelectedSubType(e.target.value);
                                setPage(1); // Reset to page 1
                            }}
                        >
                            {(type === 'import' ? importFilters : exportFilters).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="date"
                        className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title="Từ ngày"
                    />
                    <span className="self-center hidden sm:inline">-</span>
                    <input
                        type="date"
                        className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title="Đến ngày"
                    />
                </div>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm mã phiếu, số chứng từ..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchNotes()}
                    />
                </div>
                <button
                    onClick={fetchNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tìm kiếm
                </button>

                {/* Create Button Logic */}
                {type === 'import' && (selectedSubType === 'opening' || selectedSubType === 'opening_stock') && (
                    <button
                        onClick={() => setShowOpeningStockModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nhập tồn đầu
                    </button>
                )}
                {type === 'import' && (selectedSubType === 'supplier' || selectedSubType === '' || !selectedSubType) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nhập từ NCC
                    </button>
                )}

                {/* Export Buttons */}
                {type === 'export' && (selectedSubType === 'internal') && (
                    <button
                        onClick={() => setShowInternalExportModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Thêm phiếu xuất
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                        <tr>
                            <th className="p-4">Ngày tạo</th>
                            <th className="p-4">Mã phiếu</th>
                            <th className="p-4">Số chứng từ</th>
                            <th className="p-4">Loại</th>
                            <th className="p-4">Kho</th>
                            <th className="p-4">Người tạo</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : notes.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">Không tìm thấy phiếu nào</td></tr>
                        ) : (
                            notes.map((note) => (
                                <tr
                                    key={note.Id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onDoubleClick={() => fetchNoteDetail(note.Id)}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={14} />
                                            {/* Handle PascalCase CreatedAt */}
                                            {note.CreatedAt ? new Date(note.CreatedAt).toLocaleDateString('vi-VN') : '---'}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono font-medium text-blue-600">{note.Code}</td>
                                    <td className="p-4 text-gray-700">{note.InvoiceNo || '---'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${type === 'import' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {getSubTypeLabel(note)}
                                        </span>
                                    </td>
                                    {/* Warehouse: Target for Import, Source for Export? Or just show target */}
                                    <td className="p-4 font-medium">
                                        {/* API returns snake_case for relationships by default in Laravel */}
                                        {note.target_warehouse?.Name || note.source_warehouse?.Name || '---'}
                                    </td>
                                    <td className="p-4 text-gray-500">{note.creator?.FullName || '---'}</td>
                                    <td className="p-4">{getStatusBadge(note.Status)}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => fetchNoteDetail(note.Id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Hiển thị</span>
                        <select
                            className="border rounded p-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={50}>50</option>
                        </select>
                        <span>kết quả</span>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded ${page === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modals */}
            {showCreateModal && type === 'import' && (
                <SupplierImportCreateModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchNotes();
                        setShowCreateModal(false);
                    }}
                />
            )}

            {showOpeningStockModal && (
                <OpeningStockCreateModal
                    onClose={() => setShowOpeningStockModal(false)}
                    onSuccess={() => {
                        fetchNotes();
                        setShowOpeningStockModal(false);
                    }}
                />
            )}

            {/* Edit Modal */}
            {editingNote && (
                <SupplierImportCreateModal
                    initialData={editingNote}
                    onClose={() => setEditingNote(null)}
                    onSuccess={() => {
                        fetchNotes();
                        setEditingNote(null);
                    }}
                />
            )}

            {/* Internal Export Create Modal */}
            {showInternalExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                        <div className="bg-white p-2 sticky top-0 z-10 flex justify-end border-b">
                            <button onClick={() => setShowInternalExportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <InternalExportCreatePage
                            isEmbed={true}
                            onClose={() => setShowInternalExportModal(false)}
                            onSuccess={() => {
                                fetchNotes();
                                setShowInternalExportModal(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b bg-white text-gray-900">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText size={24} className="text-blue-600" />
                                        <h2 className="text-2xl font-bold">
                                            {getSubTypeLabel(selectedNote) === 'Nội bộ' ? 'Chi tiết phiếu nhập nội bộ' : `Chi tiết phiếu ${type === 'import' ? 'nhập' : 'xuất'}`}
                                        </h2>
                                    </div>
                                    <p className="text-gray-500 text-sm">Mã phiếu: {selectedNote.Code}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetail ? (
                                <div className="text-center py-12 text-gray-400">Đang tải chi tiết...</div>
                            ) : (
                                <>
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Số chứng từ</p>
                                            <p className="font-semibold">{selectedNote.InvoiceNo || '---'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Loại phiếu</p>
                                            <p className="font-semibold">{getSubTypeLabel(selectedNote)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Kho</p>
                                            <p className="font-semibold">{selectedNote.target_warehouse?.Name || selectedNote.source_warehouse?.Name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Người tạo</p>
                                            <p className="font-semibold">{selectedNote.creator?.FullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                                            <p className="font-semibold">{selectedNote.CreatedAt ? new Date(selectedNote.CreatedAt).toLocaleString('vi-VN') : ''}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                                            <div>{getStatusBadge(selectedNote.Status)}</div>
                                        </div>
                                        {selectedNote.partner && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Nhà cung cấp</p>
                                                <p className="font-semibold">{selectedNote.partner.Name}</p>
                                            </div>
                                        )}
                                        {selectedNote.Description && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
                                                <p className="text-gray-700">{selectedNote.Description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Products Table */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package size={20} className="text-blue-600" />
                                            <h3 className="text-lg font-bold">Danh sách sản phẩm</h3>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-3 text-left">STT</th>
                                                        <th className="p-3 text-left">Tên sản phẩm</th>
                                                        <th className="p-3 text-left">Số lô</th>
                                                        <th className="p-3 text-left">Hạn dùng</th>
                                                        <th className="p-3 text-right">Số lượng</th>
                                                        <th className="p-3 text-right">Đơn giá</th>
                                                        <th className="p-3 text-right">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {selectedNote.details?.map((detail: any, index: number) => (
                                                        <tr key={detail.Id} className="hover:bg-gray-50">
                                                            <td className="p-3">{index + 1}</td>
                                                            {/* Assuming detail has product relationship loaded */}
                                                            <td className="p-3 font-medium">{detail.product?.Name || 'N/A'}</td>
                                                            <td className="p-3 font-mono text-xs">{detail.BatchNumber || '---'}</td>
                                                            <td className="p-3 text-xs">
                                                                {detail.ExpiryDate ? new Date(detail.ExpiryDate).toLocaleDateString('vi-VN') : '---'}
                                                            </td>
                                                            <td className="p-3 text-right font-semibold">{detail.Quantity} {detail.UnitName || ''}</td>
                                                            <td className="p-3 text-right">{formatCurrency(detail.Price || 0)}</td>
                                                            <td className="p-3 text-right font-semibold text-blue-600">
                                                                {formatCurrency((detail.Quantity || 0) * (detail.Price || 0))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50 font-bold">
                                                    <tr>
                                                        <td colSpan={4} className="p-3 text-right">Tổng cộng:</td>
                                                        <td className="p-3 text-right">
                                                            {selectedNote.details?.reduce((sum: number, d: any) => sum + (d.Quantity || 0), 0)}
                                                        </td>
                                                        <td className="p-3"></td>
                                                        <td className="p-3 text-right text-blue-600 text-lg">
                                                            {formatCurrency(
                                                                selectedNote.details?.reduce((sum: number, d: any) =>
                                                                    sum + ((d.Quantity || 0) * (d.Price || 0)), 0
                                                                ) || 0
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>


                        <div className="p-4 border-t bg-gray-50 flex justify-end sticky bottom-0 z-10">
                            <div className="flex gap-2">
                                {(() => {
                                    const isInternalImport = getSubTypeLabel(selectedNote) === 'Nội bộ';
                                    return (
                                        <>
                                            {selectedNote.Status === 'Pending' && (
                                                <>
                                                    {!isInternalImport && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusAction('cancel')}
                                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium border border-red-200"
                                                            >
                                                                Hủy phiếu
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(selectedNote)}
                                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium border border-blue-200"
                                                            >
                                                                Sửa phiếu
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleStatusAction('approve')}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                                    >
                                                        {isInternalImport ? 'Xác nhận nhập kho' : 'Duyệt phiếu'}
                                                    </button>
                                                </>
                                            )}
                                            {selectedNote.Status === 'Approved' && !isInternalImport && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusAction('revert')}
                                                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium border border-yellow-200"
                                                    >
                                                        Hoàn tác (Sửa)
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusAction('cancel')}
                                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium border border-red-200"
                                                    >
                                                        Hủy phiếu
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setShowDetailModal(false)}
                                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                            >
                                                Đóng
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryNoteList;
