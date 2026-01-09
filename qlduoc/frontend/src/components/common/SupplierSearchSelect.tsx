import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Supplier, getSuppliers } from '../../modules/suppliers/services/supplierService';
import { Search, Loader, X } from 'lucide-react';

interface SupplierSearchSelectProps {
    value?: string;
    initialDisplayName?: string;
    onSelect: (supplier: Supplier) => void;
    placeholder?: string;
    className?: string;
}

const SupplierSearchSelect: React.FC<SupplierSearchSelectProps> = ({
    value,
    initialDisplayName,
    onSelect,
    placeholder = 'Chọn Nhà cung cấp...',
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState(initialDisplayName || '');
    const [results, setResults] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialDisplayName) {
            setKeyword(initialDisplayName);
        }
    }, [initialDisplayName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                const dropdown = document.getElementById('supplier-search-dropdown');
                if (dropdown && dropdown.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };

        const handleScroll = (event: Event) => {
            if (isOpen) {
                const dropdown = document.getElementById('supplier-search-dropdown');
                if (dropdown && dropdown.contains(event.target as Node)) {
                    return;
                }
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const updatePosition = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + rect.height, // Position BELOW
                left: rect.left,
                width: rect.width
            });
        }
    };

    const handleSearch = async (term: string) => {
        setKeyword(term);
        // If empty, fetch default list or clear?
        // Let's fetch default list if empty

        updatePosition();
        setLoading(true);
        setIsOpen(true);
        try {
            // Using existing service which accepts { search: string, page: number, per_page: number }
            const response = await getSuppliers({ search: term, page: 1, per_page: 20 });
            // Service returns response.data which is array or paginated object?
            // In SupplierListPage it was response.data. In getSuppliers it returns response.data directly.
            // If API returns Laravel pagination: { data: [...], ... }
            // Let's safe check based on SupplierListPage usage: setSuppliers(response.data)

            const list = Array.isArray(response) ? response : (response.data || []);
            setResults(list);
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (supplier: Supplier) => {
        onSelect(supplier);
        setKeyword(supplier.Name);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setKeyword('');
        // Maybe trigger onSelect with null/empty? user didn't ask for clear but good UX.
        // For now just clear input.
        handleSearch('');
    };

    const dropdownContent = (
        <div
            id="supplier-search-dropdown"
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1"
            style={{
                left: coords.left,
                width: coords.width,
                top: coords.top
            }}
        >
            {results.length > 0 ? (
                results.map((supplier) => (
                    <div
                        key={supplier.Id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 text-sm transition-colors"
                        onClick={() => handleSelect(supplier)}
                    >
                        <div className="font-medium text-gray-800">{supplier.Name}</div>
                        <div className="text-gray-500 text-xs flex justify-between">
                            <span>Mã: {supplier.Code}</span>
                            <span>SĐT: {supplier.Phone || '---'}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader size={16} className="animate-spin" />
                            <span>Đang tải...</span>
                        </div>
                    ) : 'Không tìm thấy kết quả'}
                </div>
            )}
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                    value={keyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => {
                        updatePosition();
                        handleSearch(keyword);
                    }}
                    onClick={updatePosition}
                    autoComplete="off"
                    placeholder={placeholder}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {loading ? (
                    <Loader size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
                ) : keyword ? (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                        <X size={14} />
                    </button>
                ) : null}
            </div>

            {isOpen &&
                createPortal(dropdownContent, document.body)
            }
        </div>
    );
};

export default SupplierSearchSelect;
