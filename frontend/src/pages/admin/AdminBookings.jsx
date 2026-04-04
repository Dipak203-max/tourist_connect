import React, { useEffect, useState } from 'react';
import { 
    CalendarDays, 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    MapPin,
    User,
    Shield
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import { format } from 'date-fns';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [page, status]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };
            if (status) params.status = status;
            const res = await adminApi.getBookings(params);
            setBookings(res.data.bookings);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PAID': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'COMPLETED': return 'bg-surface-100 dark:bg-surface-800 text-gray-600 border-surface-200 dark:border-surface-700';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-surface-100 dark:bg-surface-800 text-gray-500 border-surface-200 dark:border-surface-700';
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        Booking Management
                    </h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                        Total {bookings.length} Bookings on this page
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-hover:text-indigo-600 transition-colors" />
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="pl-12 pr-10 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 shadow-sm hover:shadow-md transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PAID">Paid</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
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
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Tourist</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Guide</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Date/Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-black text-muted">#{booking.id}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{booking.touristName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                                                    <Shield className="w-4 h-4 text-violet-600" />
                                                </div>
                                                <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{booking.guideName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                                                <span className="text-[10px] font-bold text-muted uppercase">Created: {format(new Date(booking.createdAt), 'HH:mm')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-surface-900 dark:text-surface-100">NPR {booking.totalPrice?.toLocaleString()}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-4">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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

export default AdminBookings;
