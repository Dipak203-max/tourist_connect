import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, MapPin, Compass, Loader2, RefreshCw } from 'lucide-react';
import MapView from '../../components/common/MapView';
import { getAIRecommendations } from '../../api/aiApi';

const AiSuggestionsPage = () => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);
    const [userLoc, setUserLoc] = useState(null);

    const getLocationAndFetch = () => {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLoc({ lat: latitude, lng: longitude });
                    fetchRecommendations(latitude, longitude);
                },
                (err) => {
                    setError("Failed to get location. Using default Kathmandu location.");
                    const defaultLat = 27.7172;
                    const defaultLng = 85.3240;
                    setUserLoc({ lat: defaultLat, lng: defaultLng });
                    fetchRecommendations(defaultLat, defaultLng);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocationAndFetch();
    }, []);

    const fetchRecommendations = async (lat, lng) => {
        try {
            const data = await getAIRecommendations(lat, lng);
            setRecommendations(data);
        } catch (err) {
            setError("Failed to fetch AI suggestions. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const allMarkers = recommendations ? [
        ...(recommendations.restaurants || []).map(r => ({ ...r, category: 'restaurant', latitude: r.lat, longitude: r.lon })),
        ...(recommendations.activities || []).map(a => ({ ...a, category: 'activity', latitude: a.lat, longitude: a.lon })),
        ...(recommendations.places || []).map(p => ({ ...p, category: 'place', latitude: p.lat, longitude: p.lon }))
    ] : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-[2rem] shadow-lg shadow-indigo-200">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight">AI Travel Explorer</h1>
                        <p className="text-gray-500 font-medium text-lg">Deep discovery of your surrounding treasures</p>
                    </div>
                </div>
                <button 
                    onClick={getLocationAndFetch}
                    disabled={loading}
                    className="flex items-center gap-2 bg-surface-50 dark:bg-surface-900 border-2 border-surface-200 dark:border-surface-700 text-gray-700 font-bold px-6 py-3 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 hover:border-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Results
                </button>
            </div>

            {/* Main Content Layout */}
            <div className="space-y-10">
                {/* Map Section */}
                <div className="bg-surface-50 dark:bg-surface-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100/50 h-[600px] border border-surface-200 dark:border-surface-700 relative group">
                    <MapView 
                        center={userLoc} 
                        userLocation={userLoc} 
                        markers={allMarkers}
                        recommendationMarkers={true} 
                    />
                    {loading && (
                        <div className="absolute inset-0 bg-surface-50 dark:bg-surface-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 border border-indigo-50">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                <p className="font-bold text-surface-900 dark:text-surface-100">Scouring the area...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories Table/List */}
                {error && <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold border border-red-100 text-center">{error}</div>}
                
                {!loading && recommendations && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SuggestionCategory 
                            title="Top Restaurants & Cafes" 
                            items={recommendations.restaurants} 
                            icon={<Utensils className="w-6 h-6" />} 
                            accent="red"
                        />
                        <SuggestionCategory 
                            title="Must-Visit Activities" 
                            items={recommendations.activities} 
                            icon={<Compass className="w-6 h-6" />} 
                            accent="green"
                        />
                        <SuggestionCategory 
                            title="Nearby Places & Icons" 
                            items={recommendations.places} 
                            icon={<MapPin className="w-6 h-6" />} 
                            accent="blue"
                        />
                    </div>
                )}

                {!loading && recommendations && !recommendations.restaurants?.length && !recommendations.activities?.length && !recommendations.places?.length && (
                    <div className="text-center py-20 bg-surface-100 dark:bg-surface-800 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-muted">No suggestions available nearby</h3>
                        <p className="text-muted font-medium">Try moving to a more populated area and refresh.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuggestCategory = ({ title, items, icon, accent }) => {
    const colors = {
        red: "bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white",
        green: "bg-green-50 text-green-600 border-green-100 group-hover:bg-green-600 group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white"
    };

    const textColors = {
        red: "text-red-600",
        green: "text-green-600",
        blue: "text-blue-600"
    };

    if (!items || items.length === 0) return (
        <div className="bg-surface-100 dark:bg-surface-800/50 rounded-[2.5rem] p-8 text-center border-2 border-dashed border-surface-200 dark:border-surface-700 h-full flex flex-col justify-center">
            <p className="text-muted font-bold italic">No {title.split(' ')[1].toLowerCase()} found</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className={`${textColors[accent]} opacity-80`}>{icon}</div>
                <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">{title}</h3>
            </div>
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div 
                        key={idx} 
                        className="group bg-surface-50 dark:bg-surface-900 p-6 rounded-[2rem] border-2 border-gray-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-surface-900 dark:text-surface-100 group-hover:text-indigo-600 transition-colors text-lg leading-tight">
                                    {item.name}
                                </h4>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[accent]} transition-all`}>
                                    {item.type.replace('_', ' ')}
                                </span>
                            </div>
                            {item.relevance_score && (
                                <div className="text-right">
                                    <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Score</div>
                                    <div className="text-xl font-black text-indigo-600 leading-none">{item.relevance_score.toFixed(1)}</div>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-y-2 translate-x-2">
                             {icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SuggestionCategory = SuggestCategory; // Alias for consistency in render

export default AiSuggestionsPage;
