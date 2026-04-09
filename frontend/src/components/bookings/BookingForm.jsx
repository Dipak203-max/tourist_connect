import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { getGuideProfileByUserId } from '../../api/guideApi';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, CheckCircle, ArrowLeft, X } from 'lucide-react';

import { getOrCreateConversation } from '../../api/chatApi';

const BookingForm = () => {
    const { guideId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [guideName, setGuideName] = useState('Guide');
    const [tourId, setTourId] = useState(Number(location.state?.tourId) || null);
    const [date, setDate] = useState(location.state?.date || '');
    const [travelers, setTravelers] = useState(Number(location.state?.guests) || 1);
    const [tours, setTours] = useState([]);
    const [selectedTour, setSelectedTour] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const guideRes = await getGuideProfileByUserId(guideId);
                setGuideName(guideRes.guideName || 'Guide');

                const toursRes = await axiosInstance.get(`/tours/guide/${guideId}`);
                setTours(toursRes.data);

                // FIXED LOGIC
                if (tourId) {
                    const matched = toursRes.data.find(t => t.id === tourId);
                    if (matched) {
                        setSelectedTour(matched);
                        setTourId(matched.id);
                    }
                } else {
                    // GUIDE ONLY MODE (no auto-selection)
                    setSelectedTour(null);
                    setTourId(null);
                }

            } catch (err) {
                console.error("Failed to fetch guide or tours details", err);
            }
        };

        if (guideId) fetchData();
    }, [guideId, tourId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Booking payload:", {
            guideId,
            tourId,
            date,
            travelers
        });

        if (!date) {
            toast.error("Please select date");
            return;
        }

        if (travelers < 1) {
            toast.error('Must have at least 1 traveler');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (date < today) {
            toast.error('Cannot book for a past date');
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post('/bookings', {
                guideId: Number(guideId),
                tourId: tourId ? Number(tourId) : null,
                date,
                travelers
            });
            
            try {
                await getOrCreateConversation(guideId);
                toast.success(`Booking request sent to ${guideName}!`);
                setTimeout(() => navigate('/chat', { state: { openChatWith: guideId } }), 1000);
            } catch (chatErr) {
                console.error(chatErr);
                toast.success(`Booking request sent to ${guideName}!`);
                toast.error("Failed to start chat. Redirecting to bookings...");
                setTimeout(() => navigate('/tourist/bookings'), 1500);
            }
            
        } catch (err) {
            const message = err.response?.data || 'Failed to send booking request';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
            </button>

            <div className="bg-surface-50 dark:bg-surface-900 rounded-3xl shadow-xl p-8 border border-surface-200 dark:border-surface-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Book this Guide</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" /> Booking with {guideName}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Tour Package
                        </label>
                        
                        {/* 🔥 STEP 2: Guide Only selectable option */}
                        <div
                            onClick={() => {
                                setSelectedTour(null);
                                setTourId(null);
                            }}
                            className={`p-4 border rounded-xl cursor-pointer transition-all mb-3 ${
                                selectedTour === null
                                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200"
                                    : "bg-white border-gray-200 hover:border-emerald-300"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Guide Only (No Tour)</span>
                                {selectedTour === null && (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Base rate will apply (guide's standard fee)
                            </p>
                        </div>

                        {/* 🔥 STEP 1: Show Guide Only indicator when active */}
                        {selectedTour === null && (
                            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Guide Only booking selected (Base rate will apply)
                            </div>
                        )}

                        {/* 🔥 STEP 3: Hide tours when guide-only (optional but BEST) */}
                        {selectedTour !== null && (
                            <>
                                {!tours.length ? (
                                    <p className="text-sm text-gray-500 p-4 border border-dashed rounded-xl bg-gray-50">No tours available for this guide</p>
                                ) : (
                                    <div className="grid gap-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                        {tours.map(tour => (
                                            <div
                                                key={tour.id}
                                                onClick={() => {
                                                    setSelectedTour(tour);
                                                    setTourId(tour.id);
                                                }}
                                                className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedTour?.id === tour.id ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20" : "bg-white border-gray-200 hover:border-indigo-300"}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900">{tour.title}</span>
                                                    <span className="font-bold text-indigo-600">${tour.pricePerPerson || tour.price} <span className="text-xs text-gray-500 font-normal">/person</span></span>
                                                </div>
                                                {tour.duration && (
                                                    <p className="text-xs text-gray-500 mt-1">Duration: {tour.duration}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {selectedTour && selectedTour !== null && (
                            <div className="mt-3 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Selected: {selectedTour.title}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="block w-full px-4 py-3 bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="travelers" className="block text-sm font-semibold text-gray-700 mb-2">
                                Travelers
                            </label>
                            <input
                                type="number"
                                id="travelers"
                                min="1"
                                max="20"
                                value={travelers}
                                onChange={(e) => setTravelers(Number(e.target.value))}
                                className="block w-full px-4 py-3 bg-surface-100 dark:bg-surface-800 border border-gray-200 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Price calculation - only show if tour is selected */}
                    {selectedTour && selectedTour !== null ? (
                        <div className="mt-8 p-6 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
                            <div className="flex justify-between text-sm font-bold text-surface-600 dark:text-surface-400 mb-4 uppercase tracking-widest">
                                <span>${selectedTour?.pricePerPerson || selectedTour?.price || 0} x {travelers} guests</span>
                                <span>${(selectedTour?.pricePerPerson || selectedTour?.price || 0) * travelers}</span>
                            </div>
                            <div className="pt-4 border-t border-surface-200 dark:border-surface-700 flex justify-between items-end">
                                <span className="text-lg font-black uppercase tracking-tight text-surface-900 dark:text-surface-100">Total</span>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    ${(selectedTour?.pricePerPerson || selectedTour?.price || 0) * travelers}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-lg font-black uppercase tracking-tight text-surface-900 dark:text-surface-100">Guide Only Booking</span>
                                    <p className="text-sm text-gray-600 mt-1">Price will be confirmed by guide</p>
                                </div>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    Custom pricing applies
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Once submitted, the guide will review your request. You'll receive a notification when they accept or reject.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !date || travelers < 1}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold text-base transition-all duration-300 transform active:scale-[0.98] ${(loading || !date || travelers < 1)
                            ? 'bg-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Confirm Booking Request
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;