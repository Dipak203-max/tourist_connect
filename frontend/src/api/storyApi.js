import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stories';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createStory = async (formData) => {
    const response = await axios.post(API_URL, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getMyStories = async () => {
    const response = await axios.get(`${API_URL}/my-stories`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const getPublicFeed = async () => {
    const response = await axios.get(`${API_URL}/feed`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const getFriendFeed = async () => {
    const response = await axios.get(`${API_URL}/feed-friends`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const getUserStories = async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const deleteStory = async (storyId) => {
    const response = await axios.delete(`${API_URL}/${storyId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};
