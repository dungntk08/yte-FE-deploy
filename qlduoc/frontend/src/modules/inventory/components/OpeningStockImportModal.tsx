import React, { useState } from 'react';
import { X, Upload, Download, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadSample, importOpeningStock, parseOpeningStock } from '../../inventory/services/inventoryService';

interface OpeningStockImportModalProps {
    warehouseId: string;
    onClose: () => void;
    onSuccess: (data?: any[]) => void;
}

const OpeningStockImportModal: React.FC<OpeningStockImportModalProps> = ({ warehouseId, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ message: string; errors?: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleDownloadSample = async () => {
        try {
            await downloadSample();
        } catch (error) {
            console.error(error);
            alert('Không thể tải file mẫu');
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const parsedData = await parseOpeningStock(file);
            setResult({ message: 'Đọc file thành công!', errors: [] });
            setTimeout(() => {
                onSuccess(parsedData); // Passing data
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error(error);
            setResult({
                message: 'Có lỗi xảy ra khi nhập dữ liệu',
                errors: [error.response?.data?.message || error.message || 'Lỗi không xác định']
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileUp className="text-blue-600" size={20} />
                        Nhập tồn đầu từ Excel
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Step 1: Download Sample */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            1. Tải file mẫu
                        </h3>
                        <p className="text-sm text-blue-600 mb-3">
                            Tải file mẫu để điền số lượng tồn đầu và hạn sử dụng.
                        </p>
                        <button
                            onClick={handleDownloadSample}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm"
                        >
                            <Download size={16} />
                            Tải file mẫu
                        </button>
                    </div>

                    {/* Step 2: Upload File */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">2. Tải lên file dữ liệu</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-1">
                                    <Upload size={24} />
                                </div>
                                {file ? (
                                    <>
                                        <p className="font-medium text-green-600">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-gray-700">Kéo thả file vào đây hoặc click để chọn</p>
                                        <p className="text-xs text-gray-500">Hỗ trợ định dạng: .xlsx, .xls, .csv</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className={`p-3 rounded-lg ${result.errors && result.errors.length > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
                            <div className="flex items-start gap-2">
                                {result.errors && result.errors.length > 0 ? <AlertCircle size={20} className="mt-0.5" /> : <CheckCircle size={20} className="mt-0.5" />}
                                <div>
                                    <p className="font-bold">{result.message}</p>
                                    {result.errors && result.errors.length > 0 && (
                                        <ul className="list-disc list-inside text-sm mt-1 max-h-32 overflow-y-auto">
                                            {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="justify-end gap-3 p-4 border-t bg-gray-50 flex">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Đóng</button>
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-bold transition ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        <Upload size={18} />
                        Tiến hành nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpeningStockImportModal;
