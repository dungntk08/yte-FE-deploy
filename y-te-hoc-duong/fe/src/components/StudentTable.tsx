import { useState } from 'react';
import { Pencil, Eye, Trash2, FileDown, Plus, UserPlus, Search, ChevronDown, Settings, FileText } from 'lucide-react';
import { EditStudentModal } from './EditStudentModal';
import { AddStudentModal } from './AddStudentModal';
import { ViewStudentModal } from './ViewStudentModal';
import { ExamPeriodModal } from './ExamPeriodModal';
import { HealthReportModal } from './HealthReportModal';

interface Student {
  id: string;
  name: string;
  citizenId: string;
  studentCode: string;
  birthDate: string;
  gender: string;
  class: string;
  status: string;
  healthData?: any;
}

const mockStudents: Student[] = [
  { 
    id: '1', 
    name: 'Bùi Hoàng An', 
    citizenId: '040223002938', 
    studentCode: '2401079943', 
    birthDate: '21/02/2022', 
    gender: 'Nam', 
    class: 'Lớp 2B', 
    status: 'Đã khám',
    healthData: {
      weight: '25.5',
      height: '120.0',
      notify_family: 'Học sinh cần theo dõi thêm về tình trạng cận thị. Vui lòng đưa con đến bác sĩ nhãn khoa để kiểm tra chi tiết.',
      overweight: true,
      myopia_incorrect: true,
    }
  },
  { 
    id: '2', 
    name: 'Bùi Lê Tuấn An', 
    citizenId: '040323022278', 
    studentCode: '', 
    birthDate: '03/08/2023', 
    gender: 'Nữ', 
    class: 'Lớp 2A', 
    status: 'Đã khám',
    healthData: {
      weight: '22.0',
      height: '115.5',
      notify_family: 'Học sinh có sâu răng, cần đến nha khoa để điều trị.',
      cavities: true,
      gingivitis: true,
    }
  },
  { 
    id: '3', 
    name: 'Chu Nguyên Thục An', 
    citizenId: '040320103687', 
    studentCode: '2400708445', 
    birthDate: '06/02/2021', 
    gender: 'Nữ', 
    class: 'Lớp 4C', 
    status: 'Đã khám',
    healthData: {
      weight: '30.2',
      height: '135.0',
      notify_family: 'Học sinh khỏe mạnh, không có vấn đề sức khỏe đáng lưu ý.',
    }
  },
  { 
    id: '4', 
    name: 'Dương Khánh An', 
    citizenId: '040320010432', 
    studentCode: '', 
    birthDate: '26/08/2020', 
    gender: 'Nữ', 
    class: 'Lớp 5B', 
    status: 'Đã khám',
    healthData: {
      weight: '28.0',
      height: '130.5',
      notify_family: 'Học sinh có viêm mũi mãn tính, cần theo dõi và điều trị.',
      nose_inflammation: true,
      throat_inflammation: true,
    }
  },
  { 
    id: '5', 
    name: 'Hoàng Trường An', 
    citizenId: '040218001792', 
    studentCode: '4092834698', 
    birthDate: '01/08/2018', 
    gender: 'Nam', 
    class: 'Lớp 2A', 
    status: 'Đã khám',
    healthData: {
      weight: '27.8',
      height: '125.0',
      notify_family: 'Học sinh có dị ứng da, tránh tiếp xúc với các chất gy dị ứng.',
      skin_allergy: true,
      eczema: true,
    }
  },
  { id: '6', name: 'Hà Trúc An', citizenId: '040322009675', studentCode: '2401079963', birthDate: '22/06/2022', gender: 'Nữ', class: 'Lớp 3B', status: 'Chưa khám' },
  { id: '7', name: 'Hồ Trung An', citizenId: '040223012300', studentCode: '4088580387', birthDate: '10/09/2023', gender: 'Nam', class: '2 Tuổi A1', status: 'Chưa khám' },
  { id: '8', name: 'Hồ Hoá An', citizenId: '042323020349', studentCode: '2409440163', birthDate: '11/01/2021', gender: 'Nữ', class: 'Lớp 4A', status: 'Chưa khám' },
  { id: '9', name: 'Nguyễn Hà An', citizenId: '040320017257', studentCode: '4071283233', birthDate: '18/08/2020', gender: 'Nữ', class: 'Lớp 5A', status: 'Chưa khám' },
  { id: '10', name: 'Nguyễn Lê Trúc An', citizenId: '040223012380', studentCode: '4088028516', birthDate: '11/07/2023', gender: 'Nữ', class: '2 Tuổi A3', status: 'Chưa khám' },
  { id: '11', name: 'Nguyễn Minh An', citizenId: '040320024404', studentCode: '2409431123', birthDate: '25/02/2021', gender: 'Nữ', class: 'Lớp 4A', status: 'Chưa khám' },
];

export function StudentTable() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExamPeriodModalOpen, setIsExamPeriodModalOpen] = useState(false);
  const [isHealthReportModalOpen, setIsHealthReportModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(mockStudents);

  const handleHealthDataChange = (studentId: string, field: string, value: boolean) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          healthData: {
            ...student.healthData,
            [field]: value
          }
        };
      }
      return student;
    }));
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedStudents(prev =>
      prev.length === mockStudents.length ? [] : mockStudents.map(s => s.id)
    );
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
  };

  const handleSave = (updatedStudent: Student) => {
    // Here you would typically update the student in your data source
    console.log('Saving student:', updatedStudent);
  };

  const handleAdd = (newStudent: any) => {
    // Here you would typically add the student to your data source
    console.log('Adding new student:', newStudent);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1>Danh sách học sinh</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsExamPeriodModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              <Settings className="w-4 h-4" />
              Quản lý đợt khám
            </button>
            <button 
              onClick={() => setIsHealthReportModalOpen(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              <FileText className="w-4 h-4" />
              Tải biên bản
            </button>
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <FileDown className="w-4 h-4" />
              Import Excel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Thêm học sinh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Đợt khám</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option>Đợt khám học kỳ 1 - 2025</option>
              <option>Đợt khám học kỳ 2 - 2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lớp</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option>Toàn trường</option>
              <option>Lớp 2A</option>
              <option>Lớp 2B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tìm kiếm</label>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, CCCD..."
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Wide Table with Horizontal Scroll */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border border-gray-300 p-2 sticky left-0 bg-blue-700 z-10" rowSpan={3}>TT</th>
                <th className="border border-gray-300 p-2 sticky left-12 bg-blue-700 z-10 min-w-[180px]" rowSpan={3}>Họ và tên học sinh</th>
                
                {/* Ngày đăng nhận sinh */}
                <th className="border border-gray-300 p-2" colSpan={2}>Ngày đăng nhận sinh</th>
                
                {/* Địa chỉ */}
                <th className="border border-gray-300 p-2 min-w-[100px]" rowSpan={3}>Địa chỉ</th>
                
                {/* Sinh lý danh dinh dưỡng các cước */}
                <th className="border border-gray-300 p-2" colSpan={2}>Sinh lý danh dinh dưỡng các cước</th>
                
                {/* Dinh dưỡng */}
                <th className="border border-gray-300 p-2" colSpan={4}>Dinh dưỡng</th>
                
                {/* Mắt */}
                <th className="border border-gray-300 p-2" colSpan={7}>Mắt</th>
                
                {/* Răng */}
                <th className="border border-gray-300 p-2" colSpan={4}>Răng</th>
                
                {/* Tai mũi họng */}
                <th className="border border-gray-300 p-2" colSpan={4}>Tai mũi họng</th>
                
                {/* Cơ xương khớp */}
                <th className="border border-gray-300 p-2" colSpan={3}>Cơ xương khớp</th>
                
                {/* Da liễu */}
                <th className="border border-gray-300 p-2" colSpan={3}>Da liễu</th>
                
                {/* Tâm thần */}
                <th className="border border-gray-300 p-2" colSpan={3}>Tâm thần</th>
                
                {/* Nội khoa */}
                <th className="border border-gray-300 p-2" colSpan={5}>Nội khoa</th>
                
                {/* TB chung */}
                <th className="border border-gray-300 p-2" rowSpan={3}>TB chung</th>
                
                {/* Ghi chú */}
                <th className="border border-gray-300 p-2" rowSpan={3}>Ghi chú</th>
              </tr>
              
              {/* Second row */}
              <tr className="bg-blue-600 text-white">
                {/* Ngày đăng nhận sinh */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Nam</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Nữ</th>
                
                {/* Sinh lý */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Cân</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Cao</th>
                
                {/* Dinh dưỡng */}
                <th className="border border-gray-300 p-1" rowSpan={2}>SDD</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Thừa cân</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Béo phì</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>VK</th>
                
                {/* Mắt */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Cận đúng số</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Cận chưa đúng số</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Viễn thị</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Loạn thị</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Lác</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>TD tật khúc xạ</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>VKM</th>
                
                {/* Răng */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Sâu</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Mất</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Hàn</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Viêm lợi</th>
                
                {/* Tai mũi họng */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Viêm mũi</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Viêm họng</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Viêm tai</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Giảm thính lực</th>
                
                {/* Cơ xương khớp */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Cong CS</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Vẹo CS</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác</th>
                
                {/* Da liễu */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Viêm da</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Vẩy nến</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác</th>
                
                {/* Tâm thần */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Lo âu</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Trầm cảm</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>RLT</th>
                
                {/* Nội khoa */}
                <th className="border border-gray-300 p-1" rowSpan={2}>Hẹp PQ</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Thấp tim</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Bướu cổ</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>DT BS</th>
                <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2 text-center sticky left-0 bg-inherit z-[5]">{index + 1}</td>
                  <td className="border border-gray-300 p-2 sticky left-12 bg-inherit z-[5]">{student.name}</td>
                  
                  {/* Ngày sinh */}
                  <td className="border border-gray-300 p-2 text-center">{student.gender === 'Nam' ? student.birthDate : ''}</td>
                  <td className="border border-gray-300 p-2 text-center">{student.gender === 'Nữ' ? student.birthDate : ''}</td>
                  
                  {/* Địa chỉ */}
                  <td className="border border-gray-300 p-2 text-xs">Khối 6 Phường Đồi Cung</td>
                  
                  {/* Cân Cao */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="text" 
                      value={student.healthData?.weight || ''}
                      onChange={(e) => {
                        setStudents(prev => prev.map(s => 
                          s.id === student.id 
                            ? { ...s, healthData: { ...s.healthData, weight: e.target.value } }
                            : s
                        ));
                      }}
                      className="w-12 text-center border-0 bg-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="text" 
                      value={student.healthData?.height || ''}
                      onChange={(e) => {
                        setStudents(prev => prev.map(s => 
                          s.id === student.id 
                            ? { ...s, healthData: { ...s.healthData, height: e.target.value } }
                            : s
                        ));
                      }}
                      className="w-12 text-center border-0 bg-transparent"
                      placeholder="0"
                    />
                  </td>
                  
                  {/* Dinh dưỡng */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.sdd || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'sdd', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.overweight || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'overweight', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.obesity || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'obesity', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  
                  {/* Mắt */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.myopia_correct || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'myopia_correct', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.myopia_incorrect || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'myopia_incorrect', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.hyperopia || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'hyperopia', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.astigmatism || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'astigmatism', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.strabismus || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'strabismus', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.refractive_error || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'refractive_error', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.vkm || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'vkm', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Răng */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.cavities || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'cavities', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.gingivitis || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'gingivitis', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Tai mũi họng */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.nose_inflammation || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'nose_inflammation', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.throat_inflammation || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'throat_inflammation', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.ear_infection || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'ear_infection', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.hearing_loss || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'hearing_loss', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Cơ xương khớp */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.scoliosis || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'scoliosis', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.flat_feet || student.healthData?.limb_deformity || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'flat_feet', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Da liễu */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.eczema || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'eczema', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.skin_allergy || student.healthData?.fungal_infection || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'skin_allergy', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Tâm thần */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.anxiety || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'anxiety', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.depression || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'depression', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.behavioral_disorder || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'behavioral_disorder', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* Nội khoa */}
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.respiratory_disease || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'respiratory_disease', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.heart_disease || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'heart_disease', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={student.healthData?.digestive_disease || false}
                      onChange={(e) => handleHealthDataChange(student.id, 'digestive_disease', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  
                  {/* TB chung */}
                  <td className="border border-gray-300 p-2 text-center">
                    <select className="text-xs border-0 bg-transparent">
                      <option>Khỏe</option>
                      <option>TB</option>
                      <option>Yếu</option>
                    </select>
                  </td>
                  
                  {/* Ghi chú */}
                  <td className="border border-gray-300 p-2">
                    <input 
                      type="text" 
                      value={student.healthData?.notify_family || ''}
                      onChange={(e) => {
                        setStudents(prev => prev.map(s => 
                          s.id === student.id 
                            ? { ...s, healthData: { ...s.healthData, notify_family: e.target.value } }
                            : s
                        ));
                      }}
                      className="w-full text-xs border-0 bg-transparent"
                      placeholder="Nhập ghi chú..."
                    />
                  </td>
                  
                  {/* Xóa */}
                  <td className="border border-gray-300 p-2 text-center">
                    <button 
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.name}?`)) {
                          setStudents(prev => prev.filter(s => s.id !== student.id));
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hàng trên mỗi trang:</span>
            <select className="border border-gray-300 rounded px-2 py-1">
              <option>50</option>
              <option>100</option>
              <option>200</option>
            </select>
            <span className="ml-4">Tổng số: {students.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              3
            </button>
          </div>
        </div>
      </div>

      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSave}
      />

      <ViewStudentModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
      />

      <ExamPeriodModal
        isOpen={isExamPeriodModalOpen}
        onClose={() => setIsExamPeriodModalOpen(false)}
      />

      <HealthReportModal
        isOpen={isHealthReportModalOpen}
        onClose={() => setIsHealthReportModalOpen(false)}
        students={students}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}