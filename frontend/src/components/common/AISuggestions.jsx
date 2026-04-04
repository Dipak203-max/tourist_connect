import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Utensils, MapPin, Compass, Loader2 } from 'lucide-react';
import MapView from './MapView';
import { getAIRecommendations } from '../../api/aiApi';

const AISuggestions = () => {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [error, setError] = useState(null);
    const [userLoc, setUserLoc] = useState(null);

    useEffect(() => {
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
        }
    }, []);

    const fetchRecommendations = async (lat, lng) => {
        setLoading(true);
        try {
            const data = await getAIRecommendations(lat, lng);
            setRecommendations(data);
        } catch (err) {
            setError("Failed to fetch AI suggestions.");
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-surface-900 dark:text-surface-100 tracking-tight">AI Travel Suggestions</h2>
                        <p className="text-gray-500 font-medium">Personalized recommendations near you</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {loading && <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />}
                    <NavLink 
                        to="/tourist/ai-suggestions" 
                        className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 transition-all hover:shadow-lg"
                    >
                        View Full AI Suggestions
                        <Sparkles className="w-4 h-4" />
                    </NavLink>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map Section */}
                <div className="lg:col-span-2 bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-indigo-100/50 h-[500px] border border-surface-200 dark:border-surface-700">
                    <MapView 
                        center={userLoc} 
                        userLocation={userLoc} 
                        markers={allMarkers}
                        recommendationMarkers={true} 
                    />
                </div>

                {/* Suggestions List */}
                <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {recommendations && (
                        <>
                            <SuggestionGroup title="Restaurants" items={recommendations.restaurants} icon={<Utensils className="w-5 h-5" />} />
                            <SuggestionGroup title="Activities" items={recommendations.activities} icon={<Compass className="w-5 h-5" />} />
                            <SuggestionGroup title="Places" items={recommendations.places} icon={<MapPin className="w-5 h-5" />} />
                        </>
                    )}
                    {!loading && !recommendations && !error && (
                        <p className="text-muted text-center py-10 italic">No recommendations found for this area.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const SuggestionGroup = ({ title, items, icon }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-surface-900 dark:text-surface-100 font-bold px-1">
                {icon}
                <span>{title}</span>
            </div>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-surface-50 dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all cursor-pointer group">
                        <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{item.type.replace('_', ' ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AISuggestions;
