import React, { useEffect } from 'react';
import { 
    Users, 
    Calendar, 
    Banknote, 
    ShieldCheck, 
    Clock,
    RefreshCw,
    TrendingUp,
    Download,
    Terminal
} from 'lucide-react';
import useAdminStore from '../store/adminStore';
import StatCard, { StatCardSkeleton } from '../components/admin/StatCard';
import AdminCharts from '../components/admin/AdminCharts';
import ActivityFeed from '../components/admin/ActivityFeed';
import { format } from 'date-fns';
import { Button, Card } from '../components/ui/BaseComponents';
import { cn } from '../utils/cn';

const AdminDashboard = () => {
    const { 
        stats, 
        activities, 
        charts, 
        loading, 
        lastUpdated, 
        fetchDashboardData,
        refresh 
    } = useAdminStore();

    useEffect(() => {
        fetchDashboardData();

        // Real-time polling every 30 seconds
        const interval = setInterval(() => {
            refresh();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchDashboardData, refresh]);

    return (
        <div className="container mx-auto px-4 py-10 space-y-12">
            {/* Header Section: Improved Alignment & Spacing */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        System Dashboard
                    </h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="uppercase tracking-wide font-medium">Live Status</span>
                        </div>
                        <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Last updated: {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : '--:--:--'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={refresh}
                        isLoading={loading}
                        className="h-10 px-4 min-w-[120px]"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button 
                        variant="primary" 
                        className="h-10 px-4"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* KPI Cards: Clean Grid Structure */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {loading && !stats ? (
                    Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard 
                            title="Total Users" 
                            value={stats?.totalUsers || 0}
                            growth={stats?.userGrowth || 0}
                            trend={stats?.userTrend}
                            icon={<Users />}
                            color="bg-slate-600"
                        />
                        <StatCard 
                            title="Total Revenue" 
                            value={stats?.totalRevenue || 0}
                            prefix="NPR "
                            growth={stats?.revenueGrowth || 0}
                            trend={stats?.revenueTrend}
                            icon={<Banknote />}
                            color="bg-slate-600"
                        />
                        <StatCard 
                            title="Total Bookings" 
                            value={stats?.totalBookings || 0}
                            growth={stats?.bookingGrowth || 0}
                            trend={stats?.bookingTrend}
                            icon={<Calendar />}
                            color="bg-slate-600"
                        />
                        <StatCard 
                            title="Active Guides" 
                            value={stats?.activeGuides || 0}
                            icon={<ShieldCheck />}
                            color="bg-slate-600"
                        />
                        <StatCard 
                            title="Pending" 
                            value={stats?.pendingVerifications || 0}
                            icon={<Clock />}
                            color="bg-slate-600"
                        />
                    </>
                )}
            </section>

            {/* Main Content Area: Balanced Panels */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <Card className="p-6 h-full border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Growth Overview</h3>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                                <TrendingUp className="w-4 h-4" />
                                +12.5%
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <AdminCharts charts={charts} />
                        </div>
                    </Card>
                </div>
                <div>
                    <Card className="p-0 overflow-hidden h-full border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Stream</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Latest platform events</p>
                        </div>
                        <ActivityFeed activities={activities?.slice(0, 8)} />
                    </Card>
                </div>
            </section>
            
            {/* Quick Utility Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-5">
                        <div className="p-3 bg-surface-50 dark:bg-surface-900 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <Banknote className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Detailed Financials</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                Review detailed revenue logs, tax summaries, and payout status reports.
                            </p>
                            <Button variant="secondary" size="sm" className="bg-surface-50 dark:bg-surface-900 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                View Transactions
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-5">
                        <div className="p-3 bg-surface-50 dark:bg-surface-900 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <Terminal className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Audit Logs</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                Monitor administrative actions and system security events globally.
                            </p>
                            <Button variant="secondary" size="sm" className="bg-surface-50 dark:bg-surface-900 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                Open Audit Console
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
