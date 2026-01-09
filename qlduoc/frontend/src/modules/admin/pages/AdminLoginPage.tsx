import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/admin/login', { username, password });

            console.log('Admin login success:', response.data);
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.admin));

            navigate('/admin/medical-centers');

        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Đăng nhập quản trị thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-900 items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Administrator</h1>
                    <p className="text-sm text-slate-500">Hệ thống quản trị tập trung</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-slate-500 focus:border-slate-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-md border-gray-300 border p-2 focus:ring-slate-500 focus:border-slate-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang xác thực...' : 'Đăng nhập quản trị'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
