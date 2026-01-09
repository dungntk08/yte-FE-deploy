import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../models/Product';
import ProductForm from './ProductForm';
import { getProducts } from '../services/productService';

interface Props {
    onClose: () => void;
    typeId: number;
    onSuccess: () => void;
    initialProductId?: number | string | null;
}

const ProductDetailModal: React.FC<Props> = ({ onClose, typeId, onSuccess, initialProductId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadProducts();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [typeId, search]);

    const loadProducts = async () => {
        try {
            const data = await getProducts(1, search, typeId);
            setProducts(data.data);

            // If initialProductId is provided, find and select it.
            if (initialProductId && !selectedProduct) {
                const found = data.data.find((p: Product) => p.Id == initialProductId);
                if (found) {
                    setSelectedProduct(found);
                } else {
                    // If not in first page, might need to fetch individually or search. 
                    // For now, let's strictly fetch it if not found? 
                    // Or just assume it works for top items.
                    // Better: Fetch individual if not found.
                    const product = await import('../services/productService').then(m => m.getProductById(initialProductId));
                    if (product) setSelectedProduct(product);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-[95vw] h-[95vh] shadow-xl flex overflow-hidden">
                {/* Left Column: Master List */}
                <div className="w-1/3 bg-gray-50 border-r flex flex-col">
                    <div className="p-4 border-b bg-white">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-bold text-gray-800">Danh sách sản phẩm</h2>
                            <button
                                onClick={() => { setIsCreating(true); setSelectedProduct(null); }}
                                className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                                + Thêm
                            </button>
                        </div>
                        <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {products.map(p => (
                            <div
                                key={p.Id}
                                onClick={() => { setSelectedProduct(p); setIsCreating(false); }}
                                className={`p-3 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedProduct?.Id === p.Id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div className="font-medium text-gray-800">{p.Name}</div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>{p.Code}</span>
                                    <span>{p.UnitName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detail / Form */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isCreating ? 'Thêm mới sản phẩm' : (selectedProduct ? selectedProduct.Name : 'Chọn sản phẩm')}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {(selectedProduct || isCreating) ? (
                            <ProductForm
                                onSuccess={() => {
                                    loadProducts();
                                    if (isCreating) setIsCreating(false);
                                    onSuccess(); // Trigger parent refresh
                                }}
                                onCancel={() => {
                                    setIsCreating(false);
                                    setSelectedProduct(null);
                                    // User requested Esc to close popup
                                    onClose();
                                }}
                                initialData={selectedProduct || undefined}
                                mode={isCreating ? 'create' : 'edit'}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Chọn một sản phẩm để xem chi tiết hoặc thêm mới
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
