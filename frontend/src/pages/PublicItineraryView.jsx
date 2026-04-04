import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'; // Using same icons as ActivityCard partially

const PublicItineraryView = () => {
    const { token } = useParams();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                // Use Public API endpoint based on logic we created but controller path was PublicController
                // PublicController: /api/public/itineraries/{token}
                const response = await axiosInstance.get(`/public/itineraries/${token}`);

                const sorted = response.data;
                if (sorted.days) {
                    sorted.days.sort((a, b) => a.dayNumber - b.dayNumber);
                    sorted.days.forEach(day => {
                        day.items.sort((a, b) => {
                            // Sort logic duplication from ItineraryPlanner
                            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                            const t1 = a.timeSlot || "";
                            const t2 = b.timeSlot || "";
                            return t1.localeCompare(t2);
                        });
                    });
                }
                setItinerary(sorted);
            } catch (err) {
                console.error(err);
                setError('Itinerary not found or invalid link.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchItinerary();
        }
    }, [token]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded-xl shadow-lg text-center max-w-md">
                <div className="text-red-500 text-5xl mb-4">☹️</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    if (!itinerary) return null;

    return (
        <div className="min-h-screen bg-surface-100 dark:bg-surface-800 font-sans">
            {/* Header */}
            <div className="bg-surface-50 dark:bg-surface-900 border-b sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">{itinerary.title}</h1>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <CalendarIcon className="w-4 h-4 mr-1.5" />
                                <span>
                                    {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                    Shared View
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col space-y-8">
                    {itinerary.days.map(day => (
                        <div key={day.id} className="bg-surface-50 dark:bg-surface-900 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-surface-100 dark:bg-surface-800/50 px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                                <h3 className="text-lg font-bold text-gray-800">Day {day.dayNumber}</h3>
                                {day.notes && <p className="text-gray-500 text-sm mt-1">{day.notes}</p>}
                            </div>
                            <div className="divide-y divide-gray-100">
                                {day.items && day.items.length > 0 ? (
                                    day.items.map(item => (
                                        <div key={item.id} className={`p-6 hover:bg-surface-100 dark:hover:bg-surface-800 transition ${item.pinned ? 'bg-yellow-50/30' : ''}`}>
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 w-20 pt-1">
                                                    <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                                                        <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                                        {item.timeSlot || "TBD"}
                                                    </div>
                                                </div>
                                                <div className="flex-1 ml-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-semibold text-surface-900 dark:text-surface-100">{item.description.split(' - ')[0]}</h4>
                                                        {item.pinned && (
                                                            <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                                                Highlight
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description.includes(' - ') && (
                                                        <p className="mt-1 text-gray-600 text-sm">{item.description.split(' - ')[1].split(' @ ')[0]}</p>
                                                    )}
                                                    {item.description.includes(' @ ') && (
                                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                                            <MapPinIcon className="w-4 h-4 mr-1" />
                                                            {item.description.split(' @ ')[1]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted text-sm italic">
                                        No activities planned for this day.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center py-8 text-muted text-sm">
                Powered by TouristConnect
            </div>
        </div>
    );
};

export default PublicItineraryView;
