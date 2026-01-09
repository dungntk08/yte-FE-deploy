import api from '../../../api/axios';
import { User } from '../models/User';

export const getUsers = async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
};
