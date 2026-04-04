import React, { useState, useEffect, useCallback } from 'react';
import { 
    Calendar, 
    Download, 
    TrendingUp, 
    Users, 
    CreditCard, 
    FileText, 
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    BarChart3
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import StatCard from '../../components/admin/StatCard';

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

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
                endpoint = '/admin/reports/daily';
                params = { date: selectedDate };
            } else if (activeTab === 'monthly') {
                endpoint = '/admin/reports/monthly';
                params = { year: selectedYear, month: selectedMonth };
            } else if (activeTab === 'yearly') {
                endpoint = '/admin/reports/yearly';
                params = { year: selectedYear };
            }

            const response = await axiosInstance.get(endpoint, { params });
            setReportData(response.data);
        } catch (error) {
            toast.error('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedDate, selectedYear, selectedMonth]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleDownload = async () => {
        try {
            let params = { type: activeTab };
            if (activeTab === 'daily') {
                params.date = selectedDate;
                const d = new Date(selectedDate);
                params.year = d.getFullYear();
                params.month = d.getMonth() + 1;
            }
            else if (activeTab === 'monthly') {
                params.year = selectedYear;
                params.month = selectedMonth;
            } else if (activeTab === 'yearly') {
                params.year = selectedYear;
            }

            const response = await axiosInstance.get('/admin/reports/download', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${activeTab}_report_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        Financial Intelligence
                    </h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                        Data-driven insights for platform scaling
                    </p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleDownload}
                        disabled={!reportData || loading}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF report
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-700 w-fit">
                    {['daily', 'monthly', 'yearly'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab 
                                ? 'bg-surface-50 dark:bg-surface-900 text-indigo-600 shadow-md ring-1 ring-gray-100' 
                                : 'text-muted hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
                        <Filter className="w-3.5 h-3.5 text-muted" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Params:</span>
                    </div>

                    {activeTab === 'daily' && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                        />
                    )}

                    {activeTab === 'monthly' && (
                        <>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all appearance-none pr-10 relative cursor-pointer"
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
                                className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 w-24 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                            />
                        </>
                    )}

                    {activeTab === 'yearly' && (
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 w-32 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                        />
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-40 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : reportData ? (
                <>
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Sales" 
                            value={`NPR ${reportData.summary.totalRevenue.toLocaleString()}`}
                            icon={<TrendingUp className="w-6 h-6 text-white" />}
                            color="bg-emerald-600"
                        />
                        <StatCard 
                            title="Platform Cuts" 
                            value={`NPR ${reportData.summary.totalCommission.toLocaleString()}`}
                            icon={<CreditCard className="w-6 h-6 text-white" />}
                            color="bg-blue-600"
                        />
                        <StatCard 
                            title="Distributed" 
                            value={`NPR ${reportData.summary.totalGuidePayout.toLocaleString()}`}
                            icon={<Users className="w-6 h-6 text-white" />}
                            color="bg-amber-600"
                        />
                        <StatCard 
                            title="Invoice Count" 
                            value={reportData.summary.totalInvoices}
                            icon={<FileText className="w-6 h-6 text-white" />}
                            color="bg-violet-600"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Period Transactions</h2>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-full border border-surface-200 dark:border-surface-700">
                                <BarChart3 className="w-3.5 h-3.5 text-muted" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                                    {reportData.invoices.length} entries
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface-100 dark:bg-surface-800/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Invoice ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Date/Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Customer</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted text-right">Amount (NPR)</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reportData.invoices.length > 0 ? (
                                        reportData.invoices.map((inv) => (
                                            <tr key={inv.invoiceNumber} className="hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                                                <td className="px-8 py-6 text-sm font-black text-surface-900 dark:text-surface-100 font-mono tracking-tighter">{inv.invoiceNumber}</td>
                                                <td className="px-8 py-6 text-sm font-bold text-muted">
                                                    {format(new Date(inv.date), 'MMM dd, HH:mm')}
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-gray-600">{inv.customerName}</td>
                                                <td className="px-8 py-6 text-sm font-black text-surface-900 dark:text-surface-100 text-right">
                                                    {inv.amount.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                        ${inv.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center opacity-30">
                                                <FileText className="w-12 h-12 mx-auto mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest">No transactions for this period</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default AdminReports;
