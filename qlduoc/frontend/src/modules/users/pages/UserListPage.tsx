import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import TableHeader from '../../../components/common/Table/TableHeader';
import { getUsers } from '../services/userService';
import { User } from '../models/User';

const UserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Danh sách Nhân viên</h1>
                <p className="text-gray-500 mt-1">Quản lý nhân viên trong đơn vị</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <TableHeader columns={[
                            { key: 'Index', label: 'STT', width: '50px', align: 'center' },
                            { key: 'Username', label: 'Tên đăng nhập' },
                            { key: 'FullName', label: 'Họ và tên' },
                            { key: 'Email', label: 'Email' },
                            { key: 'PhoneNumber', label: 'Số điện thoại' },
                        ]} />
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">Đang tải...</td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr key={user.Id} className="hover:bg-gray-50">
                                        <td className="px-2 py-4 text-center text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-4 font-medium text-gray-900">{user.Username}</td>
                                        <td className="px-4 py-4 text-gray-900">{user.FullName}</td>
                                        <td className="px-4 py-4 text-gray-600">{user.Email || '---'}</td>
                                        <td className="px-4 py-4 text-gray-600">{user.PhoneNumber || '---'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Chưa có nhân viên nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserListPage;
