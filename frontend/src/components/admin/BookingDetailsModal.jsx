import React from 'react';
import { 
    X, 
    Calendar, 
    User, 
    Shield, 
    MapPin, 
    Clock, 
    DollarSign, 
    CheckCircle2, 
    XCircle,
    Info
} from 'lucide-react';
import { format } from 'date-fns';

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PAID': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'COMPLETED': return 'bg-surface-100 text-gray-600 border-surface-200';
            case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-surface-100 text-gray-500 border-surface-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface-50 dark:bg-surface-900 w-full max-w-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-surface-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Info className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Booking Details</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">ID: #{booking.id}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-white rounded-2xl transition-all active:scale-90"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Status & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Status:</span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                                {format(new Date(booking.date), 'MMMM dd, yyyy')}
                            </span>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-surface-100 dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Tourist</span>
                            </div>
                            <h4 className="text-lg font-black text-surface-900 dark:text-surface-100 truncate">{booking.touristName}</h4>
                            <p className="text-xs font-bold text-muted mt-1 uppercase tracking-tight">ID: #{booking.touristId}</p>
                        </div>

                        <div className="p-6 bg-surface-100 dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="w-5 h-5 text-violet-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Guide</span>
                            </div>
                            <h4 className="text-lg font-black text-surface-900 dark:text-surface-100 truncate">{booking.guideName}</h4>
                            <p className="text-xs font-bold text-muted mt-1 uppercase tracking-tight">ID: #{booking.guideId}</p>
                        </div>
                    </div>

                    {/* Financials & Timeline */}
                    <div className="bg-surface-100 dark:bg-surface-800/30 p-6 rounded-[2rem] border border-surface-200 dark:border-surface-700 space-y-4">
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span className="text-muted flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Total Price
                            </span>
                            <span className="text-surface-900 dark:text-surface-100 text-xl font-black">NPR {booking.totalPrice?.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-surface-700" />
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                Booking Created
                            </span>
                            <span className="text-gray-500">{format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-surface-100 dark:bg-surface-800/50 border-t border-gray-100 dark:border-surface-700 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:shadow-md transition-all active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;
