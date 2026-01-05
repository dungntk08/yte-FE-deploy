import { X } from 'lucide-react';
import { useState } from 'react';
import { HealthIndicatorsForm } from './HealthIndicatorsForm';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: any) => void;
}

export function AddStudentModal({ isOpen, onClose, onAdd }: AddStudentModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Nam',
    dob: '',
    address: '',
    identity_number: '',
    weight: '',
    height: '',
    notify_family: '',
  });

  const [healthData, setHealthData] = useState({
    sdd: false,
    overweight: false,
    obesity: false,
    myopia_correct: false,
    myopia_incorrect: false,
    hyperopia: false,
    astigmatism: false,
    strabismus: false,
    refractive_error: false,
    vkm: false,
    ear_infection: false,
    hearing_loss: false,
    nose_inflammation: false,
    throat_inflammation: false,
    cavities: false,
    gingivitis: false,
    malocclusion: false,
    scoliosis: false,
    flat_feet: false,
    limb_deformity: false,
    eczema: false,
    fungal_infection: false,
    skin_allergy: false,
    anxiety: false,
    depression: false,
    behavioral_disorder: false,
    heart_disease: false,
    respiratory_disease: false,
    digestive_disease: false,
  });

  const handleSubmit = () => {
    onAdd({ ...formData, healthData });
    setFormData({
      full_name: '',
      gender: 'Nam',
      dob: '',
      address: '',
      identity_number: '',
      weight: '',
      height: '',
      notify_family: '',
    });
    setHealthData({
      sdd: false,
      overweight: false,
      obesity: false,
      myopia_correct: false,
      myopia_incorrect: false,
      hyperopia: false,
      astigmatism: false,
      strabismus: false,
      refractive_error: false,
      vkm: false,
      ear_infection: false,
      hearing_loss: false,
      nose_inflammation: false,
      throat_inflammation: false,
      cavities: false,
      gingivitis: false,
      malocclusion: false,
      scoliosis: false,
      flat_feet: false,
      limb_deformity: false,
      eczema: false,
      fungal_infection: false,
      skin_allergy: false,
      anxiety: false,
      depression: false,
      behavioral_disorder: false,
      heart_disease: false,
      respiratory_disease: false,
      digestive_disease: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-blue-600">
            <span>Năm học (2025-2026)</span>{' '}
            <span>Thêm học sinh</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">i</span>
            </div>
            <p className="text-blue-700 text-sm">Thêm thông tin học sinh khám sức khỏe</p>
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <h3 className="mb-4">
              <span>Thông tin học sinh</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  CCCD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.identity_number}
                  onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                  placeholder="Nhập số CCCD"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Nhập cân nặng"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Chiều cao (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Nhập chiều cao"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Thông báo gia đình</label>
                <textarea
                  value={formData.notify_family}
                  onChange={(e) => setFormData({ ...formData, notify_family: e.target.value })}
                  placeholder="Nhập thông báo gửi gia đình"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Health Check Results */}
          <HealthIndicatorsForm
            formData={formData}
            setFormData={setFormData}
            healthData={healthData}
            setHealthData={setHealthData}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Thêm mới
          </button>
        </div>
      </div>
    </div>
  );
}