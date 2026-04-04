import React, { useState, useEffect } from 'react';
import { 
    Download, 
    Filter, 
    Banknote, 
    TrendingUp, 
    Users, 
    AlertCircle, 
    Search, 
    ChevronLeft, 
    ChevronRight,
    FileText,
    CreditCard
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import StatCard from '../../components/admin/StatCard';
import useFinancialStats from '../../hooks/useFinancialStats';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const { stats, refresh: refreshStats } = useFinancialStats();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [page, statusFilter]);

    // Add Polling for auto-refresh (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Auto-refreshing payments...");
            fetchPayments();
        }, 30000);
        return () => clearInterval(interval);
    }, [page, statusFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getPayments({
                page,
                size: 10,
                status: statusFilter || undefined
            });
            
            // 🛡️ Normalized data extraction (handles both wrapped and unwrapped data)
            const data = response.data || response;
            console.log("RAW PAYMENTS RESPONSE:", response);
            console.log("TABLE DATA:", data);

            const paymentsArray = data.payments || [];
            setPayments(paymentsArray);
            setTotalPages(data.totalPages || 0);
            
            console.log("PAYMENTS COUNT:", paymentsArray.length);
            refreshStats(); // Sync stats with list updates
        } catch (error) {
            toast.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (paymentId, invoiceNumber) => {
        try {
            const response = await axiosInstance.get(`/admin/payments/${paymentId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download invoice');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-surface-100 dark:bg-surface-800 text-muted border-surface-200 dark:border-surface-700';
        }
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        Financial Overview
                    </h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                        Monitor revenue, commissions, and transaction health
                    </p>
                </div>

                <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-[2rem] border border-surface-200 dark:border-surface-700">
                    {['', 'SUCCESS', 'PENDING', 'FAILED'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(0); }}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === status 
                                ? 'bg-surface-50 dark:bg-surface-900 text-indigo-600 shadow-md ring-1 ring-gray-100' 
                                : 'text-muted hover:text-gray-600'
                            }`}
                        >
                            {status || 'ALL'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Gross Revenue" 
                    value={`NPR ${stats.totalRevenue.toLocaleString()}`}
                    icon={<Banknote className="w-6 h-6 text-white" />}
                    color="bg-indigo-600"
                />
                <StatCard 
                    title="Platform Commission" 
                    value={`NPR ${stats.totalCommission.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    color="bg-emerald-600"
                />
                <StatCard 
                    title="Guide Payouts" 
                    value={`NPR ${stats.totalGuidePayout.toLocaleString()}`}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-violet-600"
                />
                <StatCard 
                    title="Failed Transactions" 
                    value={stats.failedCount}
                    icon={<AlertCircle className="w-6 h-6 text-white" />}
                    color="bg-rose-600"
                />
            </div>

            {/* Table */}
            <div className="bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[500px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-100 dark:bg-surface-800/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Transaction ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Commission</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Guide Payout</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {Array.isArray(payments) && payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-surface-900 dark:text-surface-100 leading-tight">#{payment.id}</span>
                                                    <span className="text-[10px] font-bold text-muted font-mono mt-0.5">{payment.transactionId || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-surface-900 dark:text-surface-100">NPR {payment.amount?.toLocaleString() || '0'}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-gray-500">NPR {payment.commissionAmount?.toLocaleString() || '0'}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-indigo-600">NPR {payment.guideAmount?.toLocaleString() || '0'}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-muted">
                                                {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy') : '---'}
                                            </td>
                                            <td className="px-8 py-6">
                                                {payment.status === 'SUCCESS' ? (
                                                    <button 
                                                        onClick={() => handleDownloadInvoice(payment.id, payment.invoiceNumber)}
                                                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 shadow-sm group-hover:shadow-md"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <div className="w-10 h-10 flex items-center justify-center text-gray-200">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-6 bg-surface-100 dark:bg-surface-800 rounded-[2rem]">
                                                    <Search className="w-12 h-12 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-black text-muted uppercase tracking-widest">No transactions found</p>
                                                <p className="text-xs text-gray-300">Try adjusting your filters or checking back later.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 pt-4">
                    <button 
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2.5xl shadow-sm hover:shadow-md transition-all active:scale-90 disabled:opacity-30 group"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-muted">
                        Page <span className="text-surface-900 dark:text-surface-100">{page + 1}</span> of <span className="text-surface-900 dark:text-surface-100">{totalPages}</span>
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2.5xl shadow-sm hover:shadow-md transition-all active:scale-90 disabled:opacity-30 group"
                    >
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-indigo-600 transition-colors" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
