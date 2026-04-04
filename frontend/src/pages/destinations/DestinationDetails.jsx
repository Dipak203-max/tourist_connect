import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { destinationApi } from '../../api/destinationApi';
import { offlineDb } from '../../utils/indexedDb';
import FavoriteButton from '../../components/common/FavoriteButton';
import {
    MapPinIcon,
    ArrowLeftIcon,
    CalendarIcon,
    StarIcon,
    ShareIcon,
    CloudIcon,
    TicketIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const DestinationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await destinationApi.getDestinationById(id);
                setDestination(response.data);
                await offlineDb.saveDestination(response.data);
            } catch (error) {
                console.error("Failed to fetch destination details:", error);
                const cached = await offlineDb.getDestination(id);
                if (cached) {
                    setDestination(cached);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 animate-pulse">
                <div className="h-[500px] bg-gray-100 rounded-[3rem]" />
                <div className="space-y-4">
                    <div className="h-12 bg-gray-100 rounded-xl w-1/3" />
                    <div className="h-6 bg-gray-100 rounded-xl w-1/2" />
                </div>
            </div>
        );
    }

    if (!destination) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Place Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 bg-surface-50 dark:bg-surface-900 px-6 py-3 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all font-bold text-gray-700 hover:-translate-x-1"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-blue-600" />
                    Back to Explore
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-3 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                        <ShareIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <FavoriteButton
                        itemId={destination.id}
                        itemType="DESTINATION"
                        className="bg-surface-50 dark:bg-surface-900 p-3 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm"
                    />
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl shadow-indigo-100/50">
                <img
                    src={destination.imageUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa'}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                            {destination.country || 'Nepal'}
                        </span>
                        <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-900/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold">
                            <StarIconSolid className="w-4 h-4 text-yellow-400" />
                            4.8 (120+ Reviews)
                        </div>
                    </div>
                    <h1 className="text-6xl font-black tracking-tight mb-4">{destination.name}</h1>
                    <div className="flex items-center gap-6 text-indigo-50 font-medium">
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-red-500" />
                            {destination.city}, {destination.country || 'Nepal'}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                            Best time: Oct - Mar
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-3xl font-black text-surface-900 dark:text-surface-100 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            About this Place
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed font-medium">
                            {destination.description}
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[2.5rem]">
                            <TicketIcon className="w-8 h-8 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-black text-surface-900 dark:text-surface-100 mb-2">Activities</h3>
                            <ul className="text-gray-600 font-medium space-y-2">
                                <li>• Cultural Sightseeing</li>
                                <li>• Photography Workshops</li>
                                <li>• Local Food Tasting</li>
                            </ul>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem]">
                            <CloudIcon className="w-8 h-8 text-emerald-600 mb-4" />
                            <h3 className="text-xl font-black text-surface-900 dark:text-surface-100 mb-2">Climate Info</h3>
                            <p className="text-gray-600 font-medium">
                                Mild temperatures with clear skies during the peak season. Average 15°C - 25°C.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-100/10">
                        <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 mb-6">Plan Your Trip</h3>
                        <p className="text-gray-500 font-medium mb-8">Ready to explore {destination.name}? Connect with expert guides who live there.</p>
                        <button
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 uppercase tracking-widest text-xs"
                            onClick={() => navigate('/find-guides')}
                        >
                            Find Local Guides
                        </button>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black mb-4">Traveler Tip</h4>
                            <p className="text-muted font-medium leading-relaxed">
                                Don't forget to visit during the golden hour to capture the most stunning photos of this landscape.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetails;
