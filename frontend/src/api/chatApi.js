import axiosInstance from './axiosInstance';

export const getPrivateHistory = async (otherUserId) => {
    const response = await axiosInstance.get(`/chat/private/${otherUserId}`);
    return response.data;
};

export const getGroupHistory = async (groupId) => {
    const response = await axiosInstance.get(`/chat/group/${groupId}`);
    return response.data;
};

export const getUnreadCounts = async () => {
    const response = await axiosInstance.get('/chat/unread');
    return response.data;
};

export const markMessagesAsRead = async (senderId) => {
    const response = await axiosInstance.put(`/chat/read/${senderId}`);
    return response.data;
};

export const getConversations = async () => {
    const response = await axiosInstance.get('/chat/conversations');
    return response.data;
};

export const getOrCreateConversation = async (receiverId) => {
    const response = await axiosInstance.post(`/chat/conversation`, { receiverId, isGroup: false });
    return response.data;
};
