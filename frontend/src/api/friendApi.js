import axiosInstance from './axiosInstance';

export const getFriends = async () => {
    const response = await axiosInstance.get('/friends');
    return response.data;
};

export const getPendingRequests = async () => {
    const response = await axiosInstance.get('/friends/requests');
    return response.data;
};

export const sendFriendRequest = async (receiverId) => {
    const response = await axiosInstance.post(`/friends/request/${receiverId}`);
    return response.data;
};

export const acceptFriendRequest = async (requestId) => {
    const response = await axiosInstance.post(`/friends/accept/${requestId}`);
    return response.data;
};

export const rejectFriendRequest = async (requestId) => {
    const response = await axiosInstance.post(`/friends/reject/${requestId}`);
    return response.data;
};

export const getUserFriends = async (userId) => {
    const response = await axiosInstance.get(`/friends/users/${userId}/friends`);
    return response.data;
};

export const getFriendshipStatus = async (userId) => {
    const response = await axiosInstance.get(`/friends/status/${userId}`);
    return response.data;
};
