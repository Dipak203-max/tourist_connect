import { useState, useCallback, useEffect } from 'react';
import adminApi from '../api/adminApi';
import toast from 'react-hot-toast';

export const useFinancialStats = (dateRange = { start: null, end: null }) => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalCommission: 0,
        totalGuidePayout: 0,
        failedCount: 0,
        totalInvoices: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminApi.getFinancialSummary(dateRange);
            setStats(response.data);
            console.log("Financial API response:", response.data);
        } catch (error) {
            console.error("Error fetching financial stats:", error);
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    }, [dateRange.start, dateRange.end]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refresh: fetchStats };
};

export default useFinancialStats;
