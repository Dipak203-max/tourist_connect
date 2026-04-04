import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Filter,
    ArrowRight
} from 'lucide-react';

const GuideBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); 
    const fetchBookings = async () => {
        try {
            const response = await axiosInstance.get('/bookings/guide');
            setBookings(response.data);
        } catch (error) {
            toast.error('Failed to fetch bookings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (bookingId, status) => {
        const promise = axiosInstance.put(`/bookings/${bookingId}/status?status=${status}`);

        toast.promise(promise, {
            loading: `Updating booking to ${status}...`,
            success: () => {
                // Update state locally for instant UI refresh
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: status } : b));
                fetchBookings();
                return `Booking ${status.toLowerCase()}ed successfully!`;
            },
            error: (err) => err.response?.data || `Failed to update booking status`
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredBookings = bookings.filter(b =>
        filter === 'ALL' || b.status === filter
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Booking Requests</h1>
                    <p className="text-gray-500 mt-1">Manage your tour schedule and client requests</p>
                </div>

                <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-gray-200">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f
                                ? 'bg-surface-50 dark:bg-surface-900 text-indigo-600 shadow-sm border border-surface-200 dark:border-surface-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 p-16 text-center shadow-sm">
                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">No bookings found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-surface-50 dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                                        <User className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-surface-900 dark:text-surface-100 text-lg">{booking.touristName}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5 ring-1 ring-gray-200 px-2 py-0.5 rounded-md">
                                                <Calendar className="w-4 h-4 text-muted" />
                                                {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5 ring-1 ring-emerald-100 bg-emerald-50 px-2 py-0.5 rounded-md text-emerald-700">
                                                <DollarSign className="w-4 h-4" />
                                                {booking.totalPrice} Per Day
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end lg:self-center">
                                    {booking.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(booking.id, 'REJECTED')}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Confirm Booking
                                            </button>
                                        </>
                                    )}
                                    {(booking.status === 'CONFIRMED' || booking.status === 'PAID') && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'COMPLETED')}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors"
                                        >
                                            Mark as Completed
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                    {booking.status === 'COMPLETED' && (
                                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Successfully Processed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuideBookings;
