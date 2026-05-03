import axiosInstance from './axiosInstance';

export const getToursByGuide = async (guideId) => {
    const response = await axiosInstance.get(`/tours/guide/${guideId}`);
    return response.data;
};

export const createTourPackage = async (tourData) => {
    const response = await axiosInstance.post('/tours', tourData);
    return response.data;
};

export const deleteTourPackage = async (id) => {
    await axiosInstance.delete(`/tours/${id}`);
};
