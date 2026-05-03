import axiosInstance from './axiosInstance';

const adminApi = {
    // Dashboard Stats
    getStats: () => axiosInstance.get('/admin/dashboard/stats'),
    
    // Activity Feed
    getActivity: () => axiosInstance.get('/admin/dashboard/activity'),
    
    // Chart Data
    getChartData: () => axiosInstance.get('/admin/dashboard/charts'),
    getFinancialSummary: (params) => axiosInstance.get('/admin/dashboard/financial-summary', { params }),
    
    // Bookings
    getBookings: (params) => axiosInstance.get('/admin/bookings', { params }),
    
    // Users
    getUsers: () => axiosInstance.get('/admin/users'),
    blockUser: (id) => axiosInstance.put(`/admin/users/${id}/block`),
    unblockUser: (id) => axiosInstance.put(`/admin/users/${id}/unblock`),
    deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
    
    // Guides
    getGuides: (status) => axiosInstance.get(`/admin/guides${status ? `?status=${status}` : ''}`),
    verifyGuide: (id, formData) => axiosInstance.post(`/admin/guides/${id}/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    rejectGuide: (id, reason) => axiosInstance.post(`/admin/guides/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
    
    // Payments
    getPayments: (params) => axiosInstance.get('/admin/payments', { params }),
};

export default adminApi;
