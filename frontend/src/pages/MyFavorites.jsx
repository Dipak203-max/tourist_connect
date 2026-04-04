import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { getGuideProfileByUserId } from '../api/guideApi';
import { destinationApi } from '../api/destinationApi';
import GuideCard from '../components/GuideCard';
import DestinationCard from '../components/DestinationCard';
import { Heart, MapPin, Users, Luggage, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyFavorites = () => {
    const navigate = useNavigate();
    const { favorites, loading: favoritesLoading } = useFavorites();
    const [detailedFavorites, setDetailedFavorites] = useState({
        GUIDE: [],
        DESTINATION: [],
        EXPERIENCE: [],
        ITINERARY: []
    });
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            if (favorites.length === 0) {
                setDetailedFavorites({
                    GUIDE: [],
                    DESTINATION: [],
                    EXPERIENCE: [],
                    ITINERARY: []
                });
                return;
            }

            try {
                setLoadingDetails(true);
                const grouped = {
                    GUIDE: [],
                    DESTINATION: [],
                    EXPERIENCE: [],
                    ITINERARY: []
                };

                const detailsPromises = favorites.map(async (fav) => {
                    try {
                        let details = null;
                        if (fav.itemType === 'GUIDE') {
                            details = await getGuideProfileByUserId(fav.itemId);
                        } else if (fav.itemType === 'DESTINATION') {
                            const res = await destinationApi.getDestinationById(fav.itemId);
                            details = res.data;
                        }

                        if (details) {
                            grouped[fav.itemType].push({ ...fav, details });
                        }
                    } catch (err) {
                        console.error(`Failed to fetch details for ${fav.itemType} ${fav.itemId}`, err);
                    }
                });

                await Promise.all(detailsPromises);
                setDetailedFavorites(grouped);
            } catch (err) {
                console.error("Failed to load favorite details", err);
                toast.error("Could not load your favorite details.");
            } finally {
                setLoadingDetails(false);
            }
        };

        loadDetails();
    }, [favorites]);

    const hasAnyFavorites = Object.values(detailedFavorites).some(list => list.length > 0);
    const loading = favoritesLoading || (loadingDetails && !hasAnyFavorites);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-100 dark:bg-surface-800/50 p-8 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Curating your collection...</p>
            </div>
        );
    }

    if (!hasAnyFavorites && !loadingDetails) {
        return (
            <div className="min-h-screen bg-surface-100 dark:bg-surface-800/50 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-surface-50 dark:bg-surface-900 rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mb-8 animate-bounce">
                    <Heart className="w-10 h-10 text-gray-200 fill-current" />
                </div>
                <h2 className="text-3xl font-black text-surface-900 dark:text-surface-100 mb-4">Your collection is empty</h2>
                <p className="text-gray-500 max-w-sm mb-10 font-medium">
                    Exploration is calling! Start saving guides and destinations to build your dream adventure here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/find-guides')}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Discover Guides
                    </button>
                    <button
                        onClick={() => navigate('/tourist')}
                        className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all flex items-center gap-2"
                    >
                        <MapPin className="w-4 h-4" /> Top Destinations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-100 dark:bg-surface-800/50 p-8">
            <header className="max-w-7xl mx-auto mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Personal Collection</span>
                </div>
                <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight">My Favorites</h1>
            </header>

            <div className="max-w-7xl mx-auto space-y-16">
                {/* Guides Section */}
                {detailedFavorites.GUIDE.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-100 rounded-xl">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Professional Guides</h2>
                            <span className="ml-2 px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg text-xs font-black tracking-tight">
                                {detailedFavorites.GUIDE.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {detailedFavorites.GUIDE.map(item => (
                                <GuideCard
                                    key={`guide-${item.itemId}`}
                                    guide={item.details}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Destinations Section */}
                {detailedFavorites.DESTINATION.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-100 rounded-xl">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Dream Destinations</h2>
                            <span className="ml-2 px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg text-xs font-black tracking-tight">
                                {detailedFavorites.DESTINATION.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {detailedFavorites.DESTINATION.map(item => (
                                <DestinationCard
                                    key={`dest-${item.itemId}`}
                                    destination={item.details}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Experiences Section - Placeholder */}
                {detailedFavorites.EXPERIENCE.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-amber-100 rounded-xl">
                                <Luggage className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Unique Experiences</h2>
                        </div>
                        <div className="p-12 bg-surface-50 dark:bg-surface-900 rounded-[2rem] border border-dashed border-gray-200 text-center">
                            <p className="text-muted font-medium italic">Experience details coming soon!</p>
                        </div>
                    </section>
                )}

                {/* Itineraries Section - Placeholder */}
                {detailedFavorites.ITINERARY.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-blue-100 rounded-xl">
                                < Luggage className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Saved Itineraries</h2>
                        </div>
                        <div className="p-12 bg-surface-50 dark:bg-surface-900 rounded-[2rem] border border-dashed border-gray-200 text-center">
                            <p className="text-muted font-medium italic">Itinerary details coming soon!</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MyFavorites;
