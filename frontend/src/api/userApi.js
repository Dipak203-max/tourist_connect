import axiosInstance from './axiosInstance';

export const searchUsers = async (query) => {
    const response = await axiosInstance.get('/users/search', {
        params: { query }
    });
    return response.data;
};
