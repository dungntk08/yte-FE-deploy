import React, { useState, useEffect } from 'react';
import { getUnits, createProduct, updateProduct } from '../services/productService';
import { Product } from '../models/Product';
import { Plus, Trash2, Check } from 'lucide-react';

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Product;
    mode?: 'create' | 'edit';
}

interface Bid {
    active_ingredient_code: string;
    insurance_name: string;
    decision_number: string;
    package_code: string;
    group_code: string;
    bid_price: number;
    winning_date: string;
    approval_order: string;
    is_priority: boolean;
}

const ProductForm: React.FC<Props> = ({ onSuccess, onCancel, initialData, mode = 'create' }) => {
    const [typeId, setTypeId] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'bids'>('info');
    const [units, setUnits] = useState<any[]>([]);

    // Common Fields
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [unitName, setUnitName] = useState('');
    const [active, setActive] = useState(true);
    const [packingRule, setPackingRule] = useState(''); // Quy cách
    const [manufacturer, setManufacturer] = useState('');
    const [countryOfOrigin, setCountryOfOrigin] = useState('');

    // Medicine Fields
    const [activeIngredient, setActiveIngredient] = useState('');
    const [content, setContent] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [pharmacyType, setPharmacyType] = useState('Thuốc tây y');
    const [activeIngredientCode, setActiveIngredientCode] = useState('');
    const [usageRoute, setUsageRoute] = useState('Uống');
    const [dosage, setDosage] = useState('');
    const [pharmacyCategory, setPharmacyCategory] = useState('A. Thuốc Tân Dược');
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
    const [insurancePaymentRate, setInsurancePaymentRate] = useState('');

    // Supply Fields
    const [modelCode, setModelCode] = useState(''); // Mã hiệu
    const [declarationNumber, setDeclarationNumber] = useState(''); // Công bố
    const [supplyGroup, setSupplyGroup] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [groupName, setGroupName] = useState('');
    const [technicalStandard, setTechnicalStandard] = useState('');


    // Bids
    const [bids, setBids] = useState<Bid[]>([]);

    useEffect(() => {
        getUnits().then(setUnits).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            setTypeId(initialData.ProductTypeId);
            setCode(initialData.Code);
            setName(initialData.Name);
            setUnitName(initialData.UnitName || initialData.unit?.Name || '');
            setActive(initialData.IsActive ?? true);
            setPackingRule(initialData.PackingRule || '');
            setManufacturer(initialData.Manufacturer || '');
            setCountryOfOrigin(initialData.CountryOfOrigin || '');

            if (initialData.medicine) {
                const m = initialData.medicine;
                setActiveIngredient(m.ActiveIngredientName || '');
                setContent(m.Content || '');
                setRegistrationNumber(m.RegistrationNumber || '');
                setPharmacyType(m.PharmacyType || 'Thuốc tây y');
                setActiveIngredientCode(m.ActiveIngredientCode || '');
                setUsageRoute(m.UsageRoute || 'Uống');
                setDosage(m.Dosage || '');
                setPharmacyCategory(m.PharmacyCategory || 'A. Thuốc Tân Dược');
                setGroupClassification(m.GroupClassification || 'Thuốc thường');
                setPharmacyGroup(m.PharmacyGroup || 'Thuốc khác');
                setServiceGroupInsurance(m.ServiceGroupInsurance || 'Thuốc trong DMBYT');
                setMaterialCode(m.MaterialCode || '');
                setHealthMinistryDecision(m.HealthMinistryDecision || '');
                setUsage(m.Usage || '');
                setPrescriptionUnit(m.PrescriptionUnit || '');
                setProductCodeDecision130(m.ProductCodeDecision130 || '');
                setProgram(m.Program || '');
                setFundingSource(m.FundingSource || '');
                setInsurancePaymentRate(m.InsurancePaymentRate ? m.InsurancePaymentRate.toString() : '');
            } else if (initialData.supply) {
                const s = initialData.supply;
                setModelCode(s.ModelCode || '');
                setDeclarationNumber(s.DeclarationNumber || '');
                setSupplyGroup(s.SupplyGroup || '');
                setGroupCode(s.GroupCode || '');
                setGroupName(s.GroupName || '');
                setTechnicalStandard(s.TechnicalStandard || '');
            }

            if (initialData.bids && Array.isArray(initialData.bids)) {
                setBids(initialData.bids.map((b: any) => ({
                    active_ingredient_code: b.ActiveIngredientCode,
                    insurance_name: b.InsuranceName,
                    decision_number: b.DecisionNumber,
                    package_code: b.PackageCode,
                    group_code: b.GroupCode,
                    bid_price: b.BidPrice,
                    winning_date: b.WinningDate ? b.WinningDate.split('T')[0] : '',
                    approval_order: b.ApprovalOrder,
                    is_priority: b.IsPriority
                })));
            }
        }
    }, [initialData]);

    const handleAddBid = () => {
        setBids([...bids, {
            active_ingredient_code: '',
            insurance_name: '',
            decision_number: '',
            package_code: '',
            group_code: '',
            bid_price: 0,
            winning_date: '',
            approval_order: '',
            is_priority: false
        }]);
    };

    const handleRemoveBid = (index: number) => {
        const newBids = [...bids];
        newBids.splice(index, 1);
        setBids(newBids);
    };

    const updateBid = (index: number, field: keyof Bid, value: any) => {
        const newBids = [...bids];
        newBids[index] = { ...newBids[index], [field]: value };
        if (field === 'is_priority' && value === true) {
            newBids.forEach((b, i) => {
                if (i !== index) b.is_priority = false;
            });
        }
        setBids(newBids);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            code,
            name,
            type_id: typeId,
            unit_name: unitName,
            active,
            packing_rule: packingRule,
            manufacturer: manufacturer,
            country_of_origin: countryOfOrigin,
            // Bids apply to all types now
            bids: bids
        };

        if (typeId === 1) {
            payload.active_ingredient = activeIngredient;
            payload.content = content;
            payload.registration_number = registrationNumber;
            payload.pharmacy_type = pharmacyType;
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
            payload.insurance_payment_rate = insurancePaymentRate;
        } else if (typeId === 2) {
            payload.model_code = modelCode; // Mã hiệu
            payload.declaration_number = declarationNumber;
            payload.supply_group = supplyGroup;
            payload.group_code = groupCode;
            payload.group_name = groupName;
            payload.technical_standard = technicalStandard;
        }

        try {
            if (mode === 'edit' && initialData) {
                await updateProduct(initialData.Id, payload);
            } else {
                await createProduct(payload);
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            } else if (e.key === 'F11') {
                e.preventDefault();
                const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                handleSubmit(fakeEvent);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel, handleSubmit]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="font-bold text-gray-700">Thông tin sản phẩm</div>
                {/* Active Checkbox moved to bottom in Medical Supply design, but keeps it here for consistency in header or we can duplicate bottom placement */}
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-2 text-xs font-medium text-gray-700">Đang hoạt động</span>
                </label>
            </div>

            {/* Inner Tabs (Available for Medicine (1) and Supply (2)) */}
            {(typeId === 1 || typeId === 2) && (
                <div className="flex border-b bg-gray-50 px-4">
                    <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin chi tiết
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'bids' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('bids')}
                    >
                        Danh sách thầu
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
                {/* Medicine Form (Type 1) */}
                {typeId === 1 && activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Row 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại vật tư</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100" value={typeId} onChange={(e) => setTypeId(Number(e.target.value))} disabled>
                                <option value={1}>Thuốc</option>
                                <option value={2}>Vật tư y tế</option>
                                <option value={3}>Vắc xin</option>
                                <option value={5}>Hoá chất</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại thuốc</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyType} onChange={e => setPharmacyType(e.target.value)}>
                                <option value="Thuốc tây y">Thuốc tây y</option>
                                <option value="Thuốc đông y">Thuốc đông y</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã dược</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={code} onChange={e => setCode(e.target.value)} required />
                        </div>

                        {/* Row 2 */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dược</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                            <input
                                list="unit-suggestions-form-med"
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                required
                            />
                            <datalist id="unit-suggestions-form-med">
                                {units.map((u: any) => (
                                    <option key={u.Id} value={u.Name} />
                                ))}
                            </datalist>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hàm lượng</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={content} onChange={e => setContent(e.target.value)} placeholder="" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt chất</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={activeIngredient} onChange={e => setActiveIngredient(e.target.value)} placeholder="" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã hoạt chất</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={activeIngredientCode} onChange={e => setActiveIngredientCode(e.target.value)} />
                        </div>

                        {/* Row 4 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đường dùng</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={usageRoute} onChange={e => setUsageRoute(e.target.value)}>
                                <option value="Uống">Uống</option>
                                <option value="Tiêm">Tiêm</option>
                                <option value="Bôi">Bôi</option>
                                <option value="Đặt">Đặt</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Liều dùng</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={dosage} onChange={e => setDosage(e.target.value)} />
                        </div>

                        {/* Row 5 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại dược</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyCategory} onChange={e => setPharmacyCategory(e.target.value)}>
                                <option value="A. Thuốc Tân Dược">A. Thuốc Tân Dược</option>
                                <option value="B. Chế phẩm YHCT">B. Chế phẩm YHCT</option>
                                <option value="C. Vị thuốc YHCT">C. Vị thuốc YHCT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phân nhóm dược</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={groupClassification} onChange={e => setGroupClassification(e.target.value)}>
                                <option value="Thuốc thường">Thuốc thường</option>
                                <option value="Thuốc phối hợp">Thuốc phối hợp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm dược</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={pharmacyGroup} onChange={e => setPharmacyGroup(e.target.value)}>
                                <option value="Thuốc khác">Thuốc khác</option>
                                <option value="Thuốc kháng sinh">Thuốc kháng sinh</option>
                            </select>
                        </div>

                        {/* Row 6 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">* Nhóm DVKT Bảo hiểm Y tế</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={serviceGroupInsurance} onChange={e => setServiceGroupInsurance(e.target.value)}>
                                <option value="Thuốc trong DMBYT">Thuốc trong DMBYT</option>
                                <option value="Thuốc điều trị ung thư, chống thải ghép">Thuốc điều trị ung thư, chống thải ghép</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã DMDC</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={materialCode} onChange={e => setMaterialCode(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên QĐ BYT</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={healthMinistryDecision} onChange={e => setHealthMinistryDecision(e.target.value)} />
                        </div>

                        {/* Row 7 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quy cách</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={packingRule} onChange={e => setPackingRule(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={program} onChange={e => setProgram(e.target.value)}>
                                <option value=""></option>
                                <option value="CTMT">CTMT</option>
                                <option value="TCMR">TCMR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Công dụng</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={usage} onChange={e => setUsage(e.target.value)} />
                        </div>

                        {/* Row 8 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ đúng tuyến thanh toán BHYT</label>
                            <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={insurancePaymentRate} onChange={e => setInsurancePaymentRate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã hàng hóa</label>
                            {/* Placeholder */}
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" disabled placeholder="" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ĐVT đơn thuốc</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={prescriptionUnit} onChange={e => setPrescriptionUnit(e.target.value)}>
                                <option value=""></option>
                                <option value="Viên">Viên</option>
                                <option value="Hộp">Hộp</option>
                            </select>
                        </div>

                        {/* Row 9 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã hiệu sản phẩm QĐ130</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={productCodeDecision130} onChange={e => setProductCodeDecision130(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn tài trợ</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={fundingSource} onChange={e => setFundingSource(e.target.value)}>
                                <option value=""></option>
                                <option value="Ngân sách">Ngân sách</option>
                                <option value="Viện trợ">Viện trợ</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Supply Form (Type 2) */}
                {typeId === 2 && activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên VTYT (*)</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị (*)</label>
                                <input
                                    list="unit-suggestions-form-sup"
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={unitName}
                                    onChange={(e) => setUnitName(e.target.value)}
                                    required
                                />
                                <datalist id="unit-suggestions-form-sup">
                                    {units.map((u: any) => (
                                        <option key={u.Id} value={u.Name} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quy cách</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={packingRule} onChange={e => setPackingRule(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã hiệu</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={modelCode} onChange={e => setModelCode(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nước SX</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hãng SX</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
                            </div>
                            {/* "Nhà thầu", "Số quyết định" skipped in main info as they belong to Bids tabs */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Công bố</label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={declarationNumber} onChange={e => setDeclarationNumber(e.target.value)} />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại thuốc</label>
                                <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100" value={typeId} disabled>
                                    <option value={2}>Vật tư y tế</option>
                                </select>
                            </div>
                            {/* "Loại thầu", "Th.tin thầu", "Giá thầu", "Số lượng", "Mã VTYT BV", "Tên VTYT BV", "Giá bán", "Định mức" skipped/deferred to Bids or Future */}

                        </div>

                        {/* Group Section (Full width) */}
                        <div className="col-span-1 md:col-span-2 pt-4 border-t mt-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 w-24">Nhóm VTYT</span>
                                    <input className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Gõ để tìm kiếm..." value={supplyGroup} onChange={e => setSupplyGroup(e.target.value)} />
                                    <label className="flex items-center gap-1 text-sm text-gray-600">
                                        <input type="checkbox" className="rounded" /> Đa hoạt chất
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 w-24">Mã nhóm (*)</span>
                                    <input className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={groupCode} onChange={e => setGroupCode(e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 w-24">Tên nhóm (*)</span>
                                    <input className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={groupName} onChange={e => setGroupName(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Simplified layout for other types (3, 4, 5) */}
                {typeId > 2 && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại vật tư</label>
                            <select className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={typeId} onChange={(e) => setTypeId(Number(e.target.value))}>
                                <option value={1}>Thuốc</option>
                                <option value={2}>Vật tư y tế</option>
                                <option value={3}>Vắc xin</option>
                                <option value={5}>Hoá chất</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã hiệu</label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={code} onChange={e => setCode(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                            <input
                                list="unit-suggestions-form-other"
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                required
                            />
                            <datalist id="unit-suggestions-form-other">
                                {units.map((u: any) => (
                                    <option key={u.Id} value={u.Name} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                )}

                {/* Bids Tab (Common) */}
                {(typeId === 1 || typeId === 2) && activeTab === 'bids' && (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-500 italic">Nhập thông tin thầu (nếu có)</div>
                            <button type="button" onClick={handleAddBid} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                <Plus size={16} /> Thêm thầu
                            </button>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse border border-gray-200 min-w-[1000px]">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 w-[50px] text-center">STT</th>
                                        <th className="border p-2 w-[100px]">Mã HC/VTYT</th>
                                        <th className="border p-2">Tên BHYT</th>
                                        <th className="border p-2 w-[120px]">Số QĐ thầu</th>
                                        <th className="border p-2 w-[80px]">Gói thầu</th>
                                        <th className="border p-2 w-[80px]">Nhóm thầu</th>
                                        <th className="border p-2 w-[120px]">Đơn giá</th>
                                        <th className="border p-2 w-[120px]">Ngày T.Thầu</th>
                                        <th className="border p-2 w-[80px]">Số TT P.Duyệt</th>
                                        <th className="border p-2 w-[80px] text-center">Ưu tiên</th>
                                        <th className="border p-2 w-[50px] text-center">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bids.map((bid, index) => (
                                        <tr key={index}>
                                            <td className="border p-2 text-center">{index + 1}</td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.active_ingredient_code} onChange={e => updateBid(index, 'active_ingredient_code', e.target.value)} placeholder="..." />
                                            </td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.insurance_name} onChange={e => updateBid(index, 'insurance_name', e.target.value)} placeholder="..." />
                                            </td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.decision_number} onChange={e => updateBid(index, 'decision_number', e.target.value)} />
                                            </td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.package_code} onChange={e => updateBid(index, 'package_code', e.target.value)} />
                                            </td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.group_code} onChange={e => updateBid(index, 'group_code', e.target.value)} />
                                            </td>
                                            <td className="border p-1">
                                                <input type="number" className="w-full border-none outline-none bg-transparent text-right" value={bid.bid_price} onChange={e => updateBid(index, 'bid_price', e.target.value)} />
                                            </td>
                                            <td className="border p-1">
                                                <input type="date" className="w-full border-none outline-none bg-transparent" value={bid.winning_date} onChange={e => updateBid(index, 'winning_date', e.target.value)} />
                                            </td>
                                            <td className="border p-1">
                                                <input className="w-full border-none outline-none bg-transparent" value={bid.approval_order} onChange={e => updateBid(index, 'approval_order', e.target.value)} />
                                            </td>
                                            <td className="border p-1 text-center">
                                                <button type="button" onClick={() => updateBid(index, 'is_priority', !bid.is_priority)}>
                                                    {bid.is_priority ? <Check size={18} className="text-green-600 mx-auto" strokeWidth={3} /> : <div className="w-4 h-4 border border-gray-300 rounded mx-auto"></div>}
                                                </button>
                                            </td>
                                            <td className="border p-1 text-center">
                                                <button type="button" onClick={() => handleRemoveBid(index)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {bids.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="p-4 text-center text-gray-400">Chưa có thông tin thầu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                <div className="mr-auto text-xs text-gray-500 flex items-center gap-4">
                    <span><kbd className="px-2 py-1 bg-white border rounded shadow-sm">Esc</kbd> Huỷ</span>
                    <span><kbd className="px-2 py-1 bg-white border rounded shadow-sm">F11</kbd> Lưu</span>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Huỷ
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Lưu sản phẩm (F11)'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
