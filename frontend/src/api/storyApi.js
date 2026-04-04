import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stories';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createStory = async (storyData) => {
    const response = await axios.post(API_URL, storyData, {
        headers: getAuthHeaders()
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
