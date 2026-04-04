import axiosInstance from './axiosInstance';

export const reviewApi = {
    submitReview: (data) => axiosInstance.post('/reviews', data),
    getGuideReviews: (guideId) => axiosInstance.get(`/public/guides/${guideId}/reviews`),
    getGuideRatingSummary: (guideId) => axiosInstance.get(`/public/guides/${guideId}/rating-summary`),
    checkIfReviewed: (bookingId) => axiosInstance.get(`/reviews/check/${bookingId}`)
};

export default reviewApi;
