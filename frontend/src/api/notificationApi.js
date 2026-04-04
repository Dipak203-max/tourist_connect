import axiosInstance from './axiosInstance';

export const getNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

export const markAsRead = async (id) => {
    await axiosInstance.put(`/notifications/read/${id}`);
};

export const getUnreadCount = async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
};
