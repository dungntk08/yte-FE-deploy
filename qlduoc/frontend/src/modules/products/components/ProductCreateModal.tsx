import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { createProduct, getUnits } from '../services/productService';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const ProductCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [typeId, setTypeId] = useState<number>(1); // Default Medicine
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [units, setUnits] = useState<any[]>([]);

    // Common Fields
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [unitName, setUnitName] = useState('');
    const [active, setActive] = useState(true);

    // Medicine Fields
    const [activeIngredient, setActiveIngredient] = useState('');
    const [content, setContent] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [pharmacyType, setPharmacyType] = useState('Thuốc tây y');
    const [pharmacyName, setPharmacyName] = useState('');
    const [activeIngredientCode, setActiveIngredientCode] = useState('');
    const [usageRoute, setUsageRoute] = useState('Uống');
    const [dosage, setDosage] = useState('');
    const [pharmacyCategory, setPharmacyCategory] = useState('Thuốc tân dược');
    const [groupClassification, setGroupClassification] = useState('Thuốc thường');
    const [pharmacyGroup, setPharmacyGroup] = useState('Thuốc khác');
    const [serviceGroupInsurance, setServiceGroupInsurance] = useState('Thuốc trong DMBYT');
    const [materialCode, setMaterialCode] = useState('');
    const [healthMinistryDecision, setHealthMinistryDecision] = useState('');
    const [usage, setUsage] = useState('');
    const [prescriptionUnit, setPrescriptionUnit] = useState('');
    const [productCodeDecision130, setProductCodeDecision130] = useState('');
    const [program, setProgram] = useState('');
    const [fundingSource, setFundingSource] = useState('');

    // Supply Fields
    const [modelCode, setModelCode] = useState('');
    const [technicalStandard, setTechnicalStandard] = useState('');

    // Vaccine Fields
    const [targetDisease, setTargetDisease] = useState('');
    const [storageCondition, setStorageCondition] = useState('');

    // Chemical Fields
    const [referenceCode, setReferenceCode] = useState('');
    const [chemicalFormula, setChemicalFormula] = useState('');
    const [chemConcentration, setChemConcentration] = useState('');
    const [chemRegNumber, setChemRegNumber] = useState('');
    const [chemStandard, setChemStandard] = useState('');

    useEffect(() => {
        getUnits().then(setUnits).catch(console.error);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload: any = {
            code,
            name,
            type_id: typeId,
            unit_name: unitName,
            active,
        };

        if (typeId === 1) {
            payload.active_ingredient = activeIngredient;
            payload.content = content;
            payload.registration_number = registrationNumber;
            payload.pharmacy_type = pharmacyType;
            payload.pharmacy_name = pharmacyName;
            payload.active_ingredient_code = activeIngredientCode;
            payload.usage_route = usageRoute;
            payload.dosage = dosage;
            payload.pharmacy_category = pharmacyCategory;
            payload.group_classification = groupClassification;
            payload.pharmacy_group = pharmacyGroup;
            payload.service_group_insurance = serviceGroupInsurance;
            payload.material_code = materialCode;
            payload.health_ministry_decision = healthMinistryDecision;
            payload.usage = usage;
            payload.prescription_unit = prescriptionUnit;
            payload.product_code_decision_130 = productCodeDecision130;
            payload.program = program;
            payload.funding_source = fundingSource;
        } else if (typeId === 2) {
            payload.model_code = modelCode;
            payload.technical_standard = technicalStandard;
        } else if (typeId === 3) {
            payload.target_disease = targetDisease;
            payload.storage_condition = storageCondition;
        } else if (typeId === 5) {
            payload.reference_code = referenceCode;
            payload.chemical_formula = chemicalFormula;
            payload.concentration = chemConcentration;
            payload.registration_number = chemRegNumber;
            payload.standard = chemStandard;
        }

        try {
            await createProduct(payload);
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">THÊM MỚI SẢN PHẨM</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

                    {/* Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { id: 1, label: 'Thuốc' },
                                { id: 2, label: 'Vật tư y tế' },
                                { id: 3, label: 'Vắc xin' },
                                { id: 5, label: 'Hoá chất' },
                                { id: 4, label: 'Văn phòng phẩm' },
                            ].map((t) => (
                                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={typeId === t.id}
                                        onChange={() => setTypeId(t.id)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={typeId === t.id ? 'font-bold text-blue-700' : 'text-gray-700'}>
                                        {t.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Mã sản phẩm
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="VD: PARA001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Tên sản phẩm
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="VD: Panadol Extra"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-red-500 mr-1">*</span>Đơn vị tính
                            </label>
                            <input
                                list="unit-suggestions"
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                required
                                placeholder="Nhập hoặc chọn đơn vị..."
                            />
                            <datalist id="unit-suggestions">
                                {units.map((u: any) => (
                                    <option key={u.Id} value={u.Name} />
                                ))}
                            </datalist>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-700">Đang hoạt động</span>
                            </label>
                        </div>
                    </div>

                    {/* Specific Fields */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                            {typeId === 1 && 'Thông tin thuốc'}
                            {typeId === 2 && 'Thông tin vật tư'}
                            {typeId === 3 && 'Thông tin vắc xin'}
                            {typeId === 5 && 'Thông tin hoá chất'}
                            {typeId === 4 && 'Thông tin bổ sung'}
                        </h3>

                        {typeId === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại thuốc</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyType} onChange={e => setPharmacyType(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên dược</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã hoạt chất</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={activeIngredientCode} onChange={e => setActiveIngredientCode(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt chất</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={activeIngredient} onChange={e => setActiveIngredient(e.target.value)} placeholder="VD: Paracetamol" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hàm lượng</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={content} onChange={e => setContent(e.target.value)} placeholder="VD: 500mg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đường dùng</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={usageRoute} onChange={e => setUsageRoute(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Liều dùng</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={dosage} onChange={e => setDosage(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại dược</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyCategory} onChange={e => setPharmacyCategory(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phân nhóm dược</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={groupClassification} onChange={e => setGroupClassification(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm dược</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyGroup} onChange={e => setPharmacyGroup(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm DVKT BHYT</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={serviceGroupInsurance} onChange={e => setServiceGroupInsurance(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã DMDC</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={materialCode} onChange={e => setMaterialCode(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên QĐ BYT</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={healthMinistryDecision} onChange={e => setHealthMinistryDecision(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Công dụng</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={usage} onChange={e => setUsage(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ĐVT đơn thuốc</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={prescriptionUnit} onChange={e => setPrescriptionUnit(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã hiệu SP QĐ130</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={productCodeDecision130} onChange={e => setProductCodeDecision130(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={program} onChange={e => setProgram(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn tài trợ</label>
                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={fundingSource} onChange={e => setFundingSource(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {typeId === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ký hiệu / Model</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={modelCode}
                                        onChange={(e) => setModelCode(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu chuẩn kỹ thuật</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={technicalStandard}
                                        onChange={(e) => setTechnicalStandard(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {typeId === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bệnh mục tiêu</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={targetDisease}
                                        onChange={(e) => setTargetDisease(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện bảo quản</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={storageCondition}
                                        onChange={(e) => setStorageCondition(e.target.value)}
                                        placeholder="VD: 2-8 độ C"
                                    />
                                </div>
                            </div>
                        )}

                        {typeId === 5 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham chiếu (CAS)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={referenceCode}
                                        onChange={(e) => setReferenceCode(e.target.value)}
                                        placeholder="VD: 7732-18-5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Công thức hóa học</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={chemicalFormula}
                                        onChange={(e) => setChemicalFormula(e.target.value)}
                                        placeholder="VD: H2O"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nồng độ / Hàm lượng</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={chemConcentration}
                                        onChange={(e) => setChemConcentration(e.target.value)}
                                        placeholder="VD: 99%"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={chemRegNumber}
                                        onChange={(e) => setChemRegNumber(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu chuẩn</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={chemStandard}
                                        onChange={(e) => setChemStandard(e.target.value)}
                                        placeholder="VD: TCCS"
                                    />
                                </div>
                            </div>
                        )}

                        {typeId === 4 && (
                            <div className="text-gray-500 italic">
                                Không có thông tin bổ sung cho văn phòng phẩm.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Đóng (Esc)
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCreateModal;
