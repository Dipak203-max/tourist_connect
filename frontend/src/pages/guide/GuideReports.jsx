import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Calendar,
    Download,
    TrendingUp,
    Briefcase,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Filter,
    ArrowUpRight,
    DollarSign
} from 'lucide-react';

const GuideReports = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState({
        summary: {
            totalRevenue: 0,
            totalCommission: 0,
            totalPayout: 0,
            totalBookings: 0
        },
        bookings: []
    });

    // Date filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '';
            let params = {};

            if (activeTab === 'daily') {
                endpoint = '/guide/reports/daily';
                params = { date: selectedDate };
            } else if (activeTab === 'monthly') {
                endpoint = '/guide/reports/monthly';
                params = { year: selectedYear, month: selectedMonth };
            } else if (activeTab === 'yearly') {
                endpoint = '/guide/reports/yearly';
                params = { year: selectedYear };
            }

            const response = await axiosInstance.get(endpoint, { params });
            setReportData(response.data || {
                summary: { totalRevenue: 0, totalCommission: 0, totalPayout: 0, totalBookings: 0 },
                bookings: []
            });
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedDate, selectedYear, selectedMonth]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleDownload = async () => {
        try {
            let params = { type: activeTab, year: selectedYear };
            if (activeTab === 'daily') {
                const d = new Date(selectedDate);
                params.year = d.getFullYear();
                params.month = d.getMonth() + 1;
            } else if (activeTab === 'monthly') {
                params.month = selectedMonth;
            }

            const response = await axiosInstance.get('/guide/reports/download', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `guide_earnings_${activeTab}_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    const SummaryCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col justify-between transition-all hover:shadow-md h-full">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <span className="text-xs font-medium text-muted">{subtitle}</span>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{value}</p>
            </div>
        </div>
    );

    if (!reportData) return <div className="p-8 text-center text-gray-500">Loading initial data...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">Earnings Report</h1>
                    <p className="text-gray-500 mt-2">Track your revenue and payouts from successful bookings</p>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={!reportData?.summary || loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    <span>Download Earnings PDF</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="card p-1 rounded-xl inline-flex mb-8">
                {['daily', 'monthly', 'yearly'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === tab
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                            }`}
                    >
                        {tab?.charAt?.(0)?.toUpperCase()?.concat(tab?.slice(1)) || tab}
                    </button>
                ))}
            </div>

            {/* Filters ... (Keep unchanged part until Summary Cards) */}
            <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 mb-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-muted" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Period:</span>
                </div>

                {activeTab === 'daily' && (
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                        />
                    </div>
                )}

                {activeTab === 'monthly' && (
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        />
                    </div>
                )}

                {activeTab === 'yearly' && (
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Calculating earnings...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SummaryCard
                            title="Total Revenue"
                            value={`NPR ${(reportData?.summary?.totalRevenue ?? 0).toLocaleString()}`}
                            icon={DollarSign}
                            colorClass="bg-blue-600"
                            subtitle="Gross Amount"
                        />
                        <SummaryCard
                            title="Commission"
                            value={`NPR ${(reportData?.summary?.totalCommission ?? 0).toLocaleString()}`}
                            icon={CreditCard}
                            colorClass="bg-orange-500"
                            subtitle="Admin Share"
                        />
                        <SummaryCard
                            title="Your Net Payout"
                            value={`NPR ${(reportData?.summary?.totalPayout ?? 0).toLocaleString()}`}
                            icon={TrendingUp}
                            colorClass="bg-green-500"
                            subtitle="Take Home"
                        />
                        <SummaryCard
                            title="Paid Bookings"
                            value={reportData?.summary?.totalBookings ?? 0}
                            icon={Briefcase}
                            colorClass="bg-purple-600"
                            subtitle="Total Volume"
                        />
                    </div>

                    {/* Invoices Table */}
                    <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
                        <div className="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-100 dark:bg-surface-800/50">
                            <div>
                                <h2 className="text-lg font-extrabold text-surface-900 dark:text-surface-100">Recent Transactions</h2>
                                <p className="text-xs text-gray-500 mt-1">Detailed list of bookings for the selected period</p>
                            </div>
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                {(reportData?.bookings?.length ?? 0)} BOOKINGS FOUND
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface-100 dark:bg-surface-800 text-gray-500 text-xs font-black uppercase tracking-widest">
                                        <th className="px-6 py-4">Invoice #</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-center">Tourist</th>
                                        <th className="px-6 py-4 text-right">Amount (NPR)</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {reportData?.bookings?.length > 0 ? (
                                        reportData.bookings.map((booking) => (
                                            <tr key={booking?.invoiceNumber || Math.random()} className="hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-surface-900 dark:text-surface-100">{booking?.invoiceNumber || "-"}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {booking?.date ? new Date(booking.date).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {booking?.touristName?.charAt?.(0)?.toUpperCase?.() || "?"}
                                                        </div>
                                                        <span className="text-surface-900 dark:text-surface-100 font-medium">{booking?.touristName || "Unknown"}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-surface-900 dark:text-surface-100">
                                                    {(booking?.amount ?? 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight
                            bg-green-100 text-green-700">
                                                        <ArrowUpRight size={10} />
                                                        {booking?.status || "-"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center text-muted italic">
                                                No successful bookings found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GuideReports;
