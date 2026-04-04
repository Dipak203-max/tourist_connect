import axiosInstance from './axiosInstance';

export const createGroup = async (name) => {
    const response = await axiosInstance.post('/groups/create', null, {
        params: { name }
    });
    return response.data;
};

export const getMyGroups = async () => {
    const response = await axiosInstance.get('/groups/my-groups');
    return response.data;
};

export const getGroups = getMyGroups;

export const addMember = async (groupId, userId) => {
    const response = await axiosInstance.post(`/groups/${groupId}/add-member/${userId}`);
    return response.data;
};

export const removeMember = async (groupId, userId) => {
    const response = await axiosInstance.post(`/groups/${groupId}/remove-member/${userId}`);
    return response.data;
};

export const getGroupHistory = async (groupId) => {
    const response = await axiosInstance.get(`/chat/group/${groupId}`);
    return response.data;
};
