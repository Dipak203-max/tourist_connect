import axiosInstance from './axiosInstance';

const API_URL = '/stories';


export const createStory = async (formData) => {
    const response = await axiosInstance.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const getMyStories = async () => {
    const response = await axiosInstance.get(`${API_URL}/my-stories`);

    return response.data;
};

export const getPublicFeed = async () => {
    const response = await axiosInstance.get(`${API_URL}/feed`);

    return response.data;
};

export const getFriendFeed = async () => {
    const response = await axiosInstance.get(`${API_URL}/feed-friends`);

    return response.data;
};

export const getUserStories = async (userId) => {
    const response = await axiosInstance.get(`${API_URL}/user/${userId}`);

    return response.data;
};

export const deleteStory = async (storyId) => {
    const response = await axiosInstance.delete(`${API_URL}/${storyId}`);

    return response.data;
};
