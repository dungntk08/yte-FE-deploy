import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Plus, Edit, Trash2, MapPin, Building, Save, X } from 'lucide-react';

interface MedicalCenter {
    Id: number;
    Name: string;
    Code: string;
    Address: string;
    health_posts_count?: number;
}

interface HealthPost {
    Id: number;
    Name: string;
    Code: string;
    MedicalCenterId: number;
    Address: string;
}

const MedicalCenterManagementPage = () => {
    const [centers, setCenters] = useState<MedicalCenter[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<MedicalCenter | null>(null);
    const [healthPosts, setHealthPosts] = useState<HealthPost[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showCenterModal, setShowCenterModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingCenter, setEditingCenter] = useState<MedicalCenter | null>(null);
    const [editingPost, setEditingPost] = useState<HealthPost | null>(null);

    // Form States
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        if (selectedCenter) {
            fetchHealthPosts(selectedCenter.Id);
        } else {
            setHealthPosts([]);
        }
    }, [selectedCenter]);

    const fetchCenters = async () => {
        setLoading(true);
        try {
            const res = await api.get('/medical-centers');
            setCenters(res.data);
            if (!selectedCenter && res.data.length > 0) {
                setSelectedCenter(res.data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthPosts = async (centerId: number) => {
        try {
            const res = await api.get('/health-posts', { params: { medical_center_id: centerId } });
            setHealthPosts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCenterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCenter) {
                await api.put(`/medical-centers/${editingCenter.Id}`, formData);
            } else {
                await api.post('/medical-centers', formData);
            }
            fetchCenters();
            setShowCenterModal(false);
            setFormData({});
        } catch (error) {
            alert('Lỗi lưu thông tin');
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, MedicalCenterId: selectedCenter?.Id };
            // Allow overriding MedicalCenterId if creating/editing
            if (editingPost) {
                await api.put(`/health-posts/${editingPost.Id}`, formData);
            } else {
                // New post defaults to selected center unless specified
                await api.post('/health-posts', payload);
            }

            if (selectedCenter) fetchHealthPosts(selectedCenter.Id);
            // If we moved a post to another center, refresh centers to update counts maybe?
            if (editingPost && formData.MedicalCenterId !== selectedCenter?.Id) {
                fetchCenters();
            }

            setShowPostModal(false);
            setFormData({});
        } catch (error) {
            alert('Lỗi lưu thông tin');
        }
    };

    const handleDeleteCenter = async (id: number) => {
        if (!window.confirm('Xóa TTYT này?')) return;
        try {
            await api.delete(`/medical-centers/${id}`);
            fetchCenters();
            if (selectedCenter?.Id === id) setSelectedCenter(null);
        } catch (error) {
            alert('Không thể xóa (có thể còn trạm y tế trực thuộc)');
        }
    };

    const handleDeletePost = async (id: number) => {
        if (!window.confirm('Xóa trạm y tế này?')) return;
        try {
            await api.delete(`/health-posts/${id}`);
            if (selectedCenter) fetchHealthPosts(selectedCenter.Id);
            fetchCenters(); // Update counts
        } catch (error) {
            alert('Lỗi xóa trạm y tế');
        }
    };

    const openCenterModal = (center?: MedicalCenter) => {
        setEditingCenter(center || null);
        setFormData(center || { Name: '', Code: '', Address: '' });
        setShowCenterModal(true);
    };

    const openPostModal = (post?: HealthPost) => {
        setEditingPost(post || null);
        setFormData(post || { Name: '', Code: '', Address: '', MedicalCenterId: selectedCenter?.Id });
        setShowPostModal(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left: Medical Centers List */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                        <Building size={20} />
                        Trung Tâm Y Tế
                    </h2>
                    <button onClick={() => openCenterModal()} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <Plus size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {centers.map(center => (
                        <div
                            key={center.Id}
                            onClick={() => setSelectedCenter(center)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedCenter?.Id === center.Id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-gray-800">{center.Name}</div>
                                    <div className="text-sm text-gray-500 mt-1">{center.Code}</div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <MapPin size={12} /> {center.Address || 'Chưa cập nhật địa chỉ'}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 self-start">
                                        {center.health_posts_count || 0} trạm
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); openCenterModal(center); }} className="p-1 hover:text-blue-600">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCenter(center.Id); }} className="p-1 hover:text-red-600">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Health Posts List */}
            <div className="flex-1 flex flex-col bg-gray-50">
                <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">Danh sách Trạm Y Tế</h2>
                        <p className="text-sm text-gray-500">{selectedCenter ? `Trực thuộc: ${selectedCenter.Name}` : 'Chọn TTYT để xem'}</p>
                    </div>
                    {selectedCenter && (
                        <button onClick={() => openPostModal()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                            <Plus size={18} /> Thêm Trạm
                        </button>
                    )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {selectedCenter ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {healthPosts.map(post => (
                                <div key={post.Id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-800 truncate" title={post.Name}>{post.Name}</h3>
                                        <div className="flex gap-1">
                                            <button onClick={() => openPostModal(post)} className="text-gray-400 hover:text-blue-600"><Edit size={16} /></button>
                                            <button onClick={() => handleDeletePost(post.Id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium mb-1">{post.Code}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} /> {post.Address || 'Chưa có địa chỉ'}
                                    </div>
                                </div>
                            ))}
                            {healthPosts.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-400 italic">
                                    Chưa có trạm y tế nào trực thuộc.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Chọn một Trung Tâm Y Tế để xem danh sách trạm.
                        </div>
                    )}
                </div>
            </div>

            {/* Medical Center Modal */}
            {showCenterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold">{editingCenter ? 'Cập nhật TTYT' : 'Thêm mới TTYT'}</h3>
                            <button onClick={() => setShowCenterModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCenterSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã TTYT</label>
                                <input required value={formData.Code || ''} onChange={e => setFormData({ ...formData, Code: e.target.value })} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên TTYT</label>
                                <input required value={formData.Name || ''} onChange={e => setFormData({ ...formData, Name: e.target.value })} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <textarea value={formData.Address || ''} onChange={e => setFormData({ ...formData, Address: e.target.value })} className="w-full border rounded p-2 h-20" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowCenterModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Health Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold">{editingPost ? 'Cập nhật Trạm Y Tế' : 'Thêm mới Trạm Y Tế'}</h3>
                            <button onClick={() => setShowPostModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handlePostSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Trực thuộc TTYT</label>
                                <select
                                    value={formData.MedicalCenterId || selectedCenter?.Id}
                                    onChange={e => setFormData({ ...formData, MedicalCenterId: parseInt(e.target.value) })}
                                    className="w-full border rounded p-2 bg-white"
                                >
                                    {centers.map(c => (
                                        <option key={c.Id} value={c.Id}>{c.Name}</option>
                                    ))}
                                </select>
                                {editingPost && (
                                    <p className="text-xs text-yellow-600 mt-1">⚠️ Thay đổi TTYT sẽ cập nhật tất cả Kho và Nhân viên thuộc trạm này.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã Trạm</label>
                                <input required value={formData.Code || ''} onChange={e => setFormData({ ...formData, Code: e.target.value })} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên Trạm</label>
                                <input required value={formData.Name || ''} onChange={e => setFormData({ ...formData, Name: e.target.value })} className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <textarea value={formData.Address || ''} onChange={e => setFormData({ ...formData, Address: e.target.value })} className="w-full border rounded p-2 h-20" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalCenterManagementPage;
