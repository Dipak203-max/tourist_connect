import { create } from 'zustand';
import adminApi from '../api/adminApi';

const useAdminStore = create((set, get) => ({
    stats: null,
    activities: [],
    charts: null,
    loading: false,
    error: null,
    lastUpdated: null,

    fetchDashboardData: async () => {
        set({ loading: true });
        try {
            const [statsRes, activityRes, chartsRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getActivity(),
                adminApi.getChartData()
            ]);
            
            set({ 
                stats: statsRes.data, 
                activities: activityRes.data, 
                charts: chartsRes.data,
                loading: false,
                lastUpdated: new Date()
            });
        } catch (error) {
            set({ error: 'Failed to fetch dashboard data', loading: false });
        }
    },

    fetchStats: async () => {
        try {
            const res = await adminApi.getStats();
            set({ stats: res.data, lastUpdated: new Date() });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    },

    fetchActivities: async () => {
        try {
            const res = await adminApi.getActivity();
            set({ activities: res.data });
        } catch (error) {
            console.error('Failed to fetch activities', error);
        }
    },

    // Refresh everything
    refresh: () => get().fetchDashboardData()
}));

export default useAdminStore;
