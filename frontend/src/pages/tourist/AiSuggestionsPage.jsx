import React, { useState, useEffect } from 'react';
import { 
    Sparkles, Utensils, MapPin, Compass, Loader2, RefreshCw, 
    Coffee, GlassWater, Trees, Library, Castle, Milestone, Eye,
    Heart
} from 'lucide-react';
import MapView from '../../components/common/MapView';
import { getAIRecommendations } from '../../api/aiApi';
import { useFavorites } from '../../context/FavoritesContext';

const AiSuggestionsPage = () => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [lastFetchLoc, setLastFetchLoc] = useState(null);
    const [isLive, setIsLive] = useState(true);

    // Distance helper for threshold updates
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const p1 = lat1 * Math.PI/180;
        const p2 = lat2 * Math.PI/180;
        const dp = (lat2-lat1) * Math.PI/180;
        const dl = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(dp/2) * Math.sin(dp/2) +
                  Math.cos(p1) * Math.cos(p2) *
                  Math.sin(dl/2) * Math.sin(dl/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

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
        let watchId = null;
        if (navigator.geolocation && isLive) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const currentLoc = { lat: latitude, lng: longitude };
                    setUserLoc(currentLoc);

                    // Only re-fetch if we haven't fetched yet OR we've moved > 300 meters
                    if (!lastFetchLoc || getDistance(latitude, longitude, lastFetchLoc.lat, lastFetchLoc.lng) > 300) {
                        setLastFetchLoc(currentLoc);
                        fetchRecommendations(latitude, longitude);
                    }
                },
                (err) => {
                    console.error("Location watch error:", err);
                    if (!userLoc) {
                        const defaultLoc = { lat: 27.7172, lng: 85.3240 }; // Kathmandu
                        setUserLoc(defaultLoc);
                        fetchRecommendations(defaultLoc.lat, defaultLoc.lng);
                    }
                },
                { enableHighAccuracy: true, distanceFilter: 100 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isLive, lastFetchLoc]);

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
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight">AI Travel Explorer</h1>
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Updates On</span>
                            </div>
                        </div>
                        <p className="text-gray-500 font-medium text-lg">Deep discovery of your surrounding treasures</p>
                    </div>
                </div>
                {/* Removed manual refresh button as updates are now automatic */}
            </div>

            {/* Status Banner */}
            {!loading && recommendations && !recommendations.is_live && (
                <div className="bg-amber-50/50 dark:bg-amber-900/20 border-2 border-amber-200/50 dark:border-amber-800/50 p-6 rounded-[2.5rem] flex items-center gap-6 animate-pulse-slow">
                    <div className="bg-amber-100 dark:bg-amber-800/50 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Compass className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-amber-900 dark:text-amber-100 font-black text-xl leading-none mb-1">Mapping Service Offline</h4>
                        <p className="text-amber-700 dark:text-amber-300 font-medium text-lg leading-tight">
                            We're having trouble reaching the live map servers in your area. Showing high-quality AI-generated local suggestions instead.
                        </p>
                    </div>
                </div>
            )}

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
                            userLoc={userLoc}
                        />
                        <SuggestionCategory 
                            title="Most Visited Activities" 
                            items={recommendations.activities} 
                            icon={<Compass className="w-6 h-6" />} 
                            accent="green"
                            userLoc={userLoc}
                        />
                        <SuggestionCategory 
                            title="Nearby Places & Icons" 
                            items={recommendations.places} 
                            icon={<MapPin className="w-6 h-6" />} 
                            accent="blue"
                            userLoc={userLoc}
                        />
                    </div>
                )}

                {!loading && recommendations && !recommendations.restaurants?.length && !recommendations.activities?.length && !recommendations.places?.length && (
                    <div className="text-center py-24 bg-surface-100/50 dark:bg-surface-800/50 rounded-[4rem] border-2 border-dashed border-surface-200 dark:border-surface-700">
                        <div className="bg-white dark:bg-surface-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-surface-100">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-3xl font-black text-surface-900 dark:text-surface-100 mb-2">The AI is searching...</h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">We couldn't find specific recommendations in this exact spot. Try moving the map or refreshing the search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuggestionCategory = ({ title, items, icon, accent, userLoc }) => {
    const { toggleFavorite, isFavorite, isPending } = useFavorites();

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

    const getItemIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('cafe') || t.includes('coffee')) return <Coffee className="w-4 h-4" />;
        if (t.includes('restaurant') || t.includes('food')) return <Utensils className="w-4 h-4" />;
        if (t.includes('bar') || t.includes('pub')) return <GlassWater className="w-4 h-4" />;
        if (t.includes('park') || t.includes('garden')) return <Trees className="w-4 h-4" />;
        if (t.includes('museum') || t.includes('gallery')) return <Library className="w-4 h-4" />;
        if (t.includes('historic') || t.includes('monument') || t.includes('castle')) return <Castle className="w-4 h-4" />;
        if (t.includes('temple') || t.includes('worship')) return <Milestone className="w-4 h-4" />;
        if (t.includes('viewpoint')) return <Eye className="w-4 h-4" />;
        return icon;
    };

    if (!items || items.length === 0) return (
        <div className="bg-surface-100/50 dark:bg-surface-800/30 rounded-[3rem] p-10 text-center border-2 border-dashed border-surface-200 dark:border-surface-700 h-full flex flex-col justify-center min-h-[300px]">
            <div className="opacity-20 mb-4 flex justify-center">{icon}</div>
            <p className="text-surface-400 font-extrabold italic uppercase tracking-tighter">No items found here</p>
        </div>
    );

    return (
        <div className="space-y-8 h-full">
            <div className="flex items-center gap-4 px-4">
                <div className={`${textColors[accent]} p-3 bg-surface-50 dark:bg-surface-800 rounded-2xl shadow-sm`}>{icon}</div>
                <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight capitalize leading-tight">
                    {title}
                </h3>
            </div>
            <div className="space-y-5">
                {items.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => {
                            console.log("Navigating from:", userLoc, "to:", item.name, item.lat, item.lon);
                            const origin = userLoc ? `${userLoc.lat},${userLoc.lng}` : '';
                            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${item.lat},${item.lon}`;
                            window.open(url, '_blank');
                        }}
                        className="group bg-white dark:bg-surface-900 p-6 rounded-[2.5rem] border border-surface-100 dark:border-surface-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col gap-3 active:scale-95"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex-1 pr-4">
                                <h4 className="font-black text-surface-900 dark:text-surface-100 group-hover:text-indigo-600 transition-colors text-xl leading-snug mb-2">
                                    {item.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${colors[accent]} transition-all`}>
                                        {getItemIcon(item.type)}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-surface-500 dark:text-surface-400">
                                        {item.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            {item.relevance_score && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-center min-w-[60px]">
                                        <div className="text-[9px] text-indigo-400 dark:text-indigo-500 font-black uppercase tracking-[0.2em] mb-1">Score</div>
                                        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{item.relevance_score.toFixed(1)}</div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(item.name, 'PLACE'); // Using name as ID for AI places
                                        }}
                                        disabled={isPending(item.name, 'PLACE')}
                                        className={`p-2.5 rounded-xl border transition-all ${
                                            isFavorite(item.name, 'PLACE') 
                                            ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' 
                                            : 'bg-surface-50 border-surface-100 text-gray-400 hover:text-rose-400'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite(item.name, 'PLACE') ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Click for Directions →
                            </span>
                        </div>
                        
                        {/* Decorative background icon */}
                        <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-[-15deg] group-hover:rotate-0 duration-700">
                             {React.cloneElement(getItemIcon(item.type), { size: 120 })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiSuggestionsPage;
