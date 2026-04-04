import React, { useState, useEffect } from 'react';
import {
    Calendar,
    User,
    CheckCircle2,
    Clock,
    DollarSign,
    Star,
    Download
} from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import ReviewModal from '../reviews/ReviewModal';

const BookingCard = ({ booking, payWithKhalti, cancelBooking, handleDownloadInvoice, getStatusColor }) => {
    const [hasReviewed, setHasReviewed] = useState(false);
    const [submittedRating, setSubmittedRating] = useState(null);
    const [isCheckingReview, setIsCheckingReview] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (booking.status === 'COMPLETED') {
                setIsCheckingReview(true);
                try {
                    const res = await reviewApi.checkIfReviewed(booking.id);
                    setHasReviewed(res.data);
                } catch (error) {
                    console.error("Error checking review status:", error);
                } finally {
                    setIsCheckingReview(false);
                }
            }
        };
        checkStatus();
    }, [booking.id, booking.status]);

    const handleReviewSubmitted = (rating) => {
        setHasReviewed(true);
        if (rating) setSubmittedRating(rating);
        setIsModalOpen(false);
    };

    return (
        <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'COMPLETED' ? 'bg-blue-500' :
                booking.status === 'CONFIRMED' ? 'bg-emerald-500' :
                    booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-gray-300'
                }`} />

            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                            <User className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-surface-900 dark:text-surface-100 text-xl uppercase tracking-tight">{booking.guideName}</h3>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-bold">
                                <span className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-800 px-3 py-1 rounded-lg border border-surface-200 dark:border-surface-700">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-emerald-700">
                                    <DollarSign className="w-4 h-4" />
                                    ${booking.totalPrice}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    Booked {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 self-end lg:self-center">
                        {/* Rating Display for Reviewed Bookings */}
                        {hasReviewed && submittedRating && (
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="font-bold text-sm">{submittedRating}</span>
                            </div>
                        )}

                        {booking.status === 'COMPLETED' && (
                            isCheckingReview ? (
                                <div className="text-gray-400 text-sm font-medium animate-pulse flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                    Checking...
                                </div>
                            ) : hasReviewed ? (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-bold text-sm flex items-center gap-2 animate-in fade-in select-none">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    Reviewed
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 transform active:scale-95"
                                >
                                    <Star className="w-4 h-4 fill-white" />
                                    Write Review
                                </button>
                            )
                        )}

                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button
                                onClick={() => cancelBooking(booking.id)}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                            >
                                Cancel Booking
                            </button>
                        )}

                        {booking.status === 'CONFIRMED' && (
                            <button
                                onClick={() => payWithKhalti(booking.id)}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                Pay with Khalti
                            </button>
                        )}

                        {booking.status === 'PAID' && (
                            <button
                                onClick={() => handleDownloadInvoice(booking.paymentId)}
                                className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-2 font-bold text-sm hover:bg-emerald-100 transition-all transform active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                Invoice
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ReviewModal 
                    bookingId={booking.id} 
                    guideName={booking.guideName}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)} 
                    onReviewSubmitted={handleReviewSubmitted} 
                />
            )}
        </div>
    );
};

export default BookingCard;
