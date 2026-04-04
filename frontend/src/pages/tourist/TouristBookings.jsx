import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import BookingCard from '../../components/bookings/BookingCard';
import { useRealTime } from '../../hooks/useRealTime';
import {
    Calendar,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Search,
    History,
    Star,
    Download,
    CreditCard,
    X
} from 'lucide-react';

const TouristBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Centralized Real-Time Event Handling
    useRealTime('BOOKING_UPDATED', (payload) => {
        setBookings(prev => prev.map(booking => 
            booking.id === payload.bookingId 
                ? { ...booking, status: payload.status }
                : booking
        ));
    });

    const fetchBookings = async () => {
        try {
            const response = await axiosInstance.get('/bookings/tourist');
            setBookings(response.data);
        } catch (error) {
            toast.error('Failed to fetch your bookings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        const promise = axiosInstance.put(`/bookings/${bookingId}/status?status=CANCELLED`);

        toast.promise(promise, {
            loading: 'Cancelling booking...',
            success: () => {
                // The RealTime system will handle the status update via WebSocket
                // But we can keep the optimistic update for ultra-snappiness
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
                return 'Booking cancelled successfully';
            },
            error: (err) => err.response?.data || 'Failed to cancel booking'
        });
    };

    const handleDownloadInvoice = async (paymentId) => {
        try {
            const response = await axiosInstance.get(`/payments/${paymentId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download invoice');
        }
    };

    const payWithKhalti = async (bookingId) => {
        try {
            const response = await axiosInstance.post(`/payments/initiate/${bookingId}`);
            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                toast.error('Payment initiation failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment initiation failed');
        }
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
        b.guideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your booking history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-indigo-600" />
                        My Bookings
                    </h1>
                    <p className="text-gray-500 mt-1">Track your requested tours and booking history</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Search by guide or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm shadow-sm"
                    />
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 p-16 text-center shadow-sm">
                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">No bookings found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">You haven't made any bookings yet. Start exploring guides to begin your journey!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            payWithKhalti={payWithKhalti}
                            cancelBooking={cancelBooking}
                            handleDownloadInvoice={handleDownloadInvoice}
                            getStatusColor={getStatusColor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TouristBookings;
