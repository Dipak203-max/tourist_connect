import axiosInstance from './axiosInstance';

const API_URL = '/guide-profile';
const DOC_API_URL = '/guide';

export const updateGuideProfile = async (profileData) => {
    const response = await axiosInstance.post(API_URL, profileData);
    return response.data;
};

export const getMyGuideProfile = async () => {
    const response = await axiosInstance.get(`${API_URL}/me`);
    return response.data;
};

export const getGuideProfileByUserId = async (userId) => {
    const response = await axiosInstance.get(`${API_URL}/${userId}`);
    return response.data;
};

export const getDetailedGuideProfile = async (userId) => {
    const response = await axiosInstance.get(`${API_URL}/detailed/${userId}`);
    return response.data;
};

export const uploadDocuments = async (formData) => {
    const response = await axiosInstance.post(`${DOC_API_URL}/upload-documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}
