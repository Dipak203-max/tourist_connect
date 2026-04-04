import axiosInstance from './axiosInstance';

export const destinationApi = {
    getAllDestinations: (page = 0, size = 6) => axiosInstance.get('/destinations', { params: { page, size } }),
    getDestinationById: (id) => axiosInstance.get(`/destinations/${id}`),
    searchByCity: (city) => axiosInstance.get('/destinations/search', { params: { city } }),

    // Admin Endpoints
    adminAddDestination: (data) => axiosInstance.post('/admin/destinations', data),
    adminUpdateDestination: (id, data) => axiosInstance.put(`/admin/destinations/${id}`, data),
    adminDeleteDestination: (id) => axiosInstance.delete(`/admin/destinations/${id}`)
};

export default destinationApi;
