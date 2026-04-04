import axios from './axiosInstance';

export const getAIRecommendations = async (lat, lng) => {
    try {
        const response = await axios.get(`/ai/recommend?lat=${lat}&lng=${lng}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        throw error;
    }
};
