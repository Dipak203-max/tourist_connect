import axiosInstance from './axiosInstance';

const API_URL = '/profile';

export const getMyProfile = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await axiosInstance.post(API_URL, profileData);
    return response.data;
};

export const getUserProfile = async (userId) => {
    const response = await axiosInstance.get(`${API_URL}/${userId}`);
    return response.data;
};
