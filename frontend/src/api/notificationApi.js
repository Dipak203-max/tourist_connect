import axiosInstance from './axiosInstance';

export const getNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

export const markAsRead = async (id) => {
    await axiosInstance.put(`/notifications/read/${id}`);
};

export const markGroupAsRead = async (groupId) => {
    await axiosInstance.put(`/notifications/read-group/${groupId}`);
};

export const getUnreadCount = async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
};

export const getGroupUnreadCount = async () => {
    const response = await axiosInstance.get('/notifications/unread-group-count');
    return response.data;
};

export const getGroupUnreadCountsMap = async () => {
    const response = await axiosInstance.get('/notifications/unread-group-counts-map');
    return response.data;
};
