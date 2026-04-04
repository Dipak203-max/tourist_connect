import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/common/MapView';
import { calculateDistance, formatDistance } from '../utils/locationUtils';
import { MapPinIcon, AdjustmentsHorizontalIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Changed to XCircleIcon to match heroicons
import FavoriteButton from '../components/common/FavoriteButton';

const GuideDiscovery = () => {
    const navigate = useNavigate();
    const [allGuides, setAllGuides] = useState([]); // Store all fetched guides
    const [filteredGuides, setFilteredGuides] = useState([]); // Guides to display
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [filters, setFilters] = useState({
        city: '',
        radius: 5, // Default 5km
        language: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Added error state
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        // Get user location on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(loc);
                    setMapCenter(loc);
                    fetchAllGuides(loc);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setPermissionDenied(true);
                    fetchAllGuides(null);
                }
            );
        } else {
            console.error("Geolocation not supported");
            setPermissionDenied(true);
            fetchAllGuides(null);
        }
    }, []);

    // Filter guides whenever filters or allGuides change
    useEffect(() => {
        filterGuides();
    }, [allGuides, filters, userLocation]);

    const fetchAllGuides = async (currentLoc) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                lat: currentLoc?.lat,
                lng: currentLoc?.lng,
                radius: filters.radius || 5
            };

            // Requirement: Fetch guides from backend
            const response = await axiosInstance.get('/guide-profile/search', { params });
            setAllGuides(response.data);
        } catch (error) {
            console.error("Failed to fetch guides", error);
            setError("Unable to load guides. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filterGuides = () => {
        let result = allGuides;

        // 1. Text Filters (City)
        if (filters.city) {
            result = result.filter(g =>
                g.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
                g.locations?.some(l => l.toLowerCase().includes(filters.city.toLowerCase()))
            );
        }

        // 2. Distance Filter (Client-side Haversine)
        if (userLocation && filters.radius) {
            result = result.map(guide => {
                // Calculate and attach distance if guide has coords
                if (guide.latitude && guide.longitude) {
                    const dist = calculateDistance(
                        userLocation.lat, userLocation.lng,
                        guide.latitude, guide.longitude
                    );
                    return { ...guide, distance: dist };
                }
                return guide;
            }).filter(guide => {
                // Keep if distance is within radius OR if guide has no location (fallback)
                // User requirement: "Show guides within 2km, 5km..." implies strict filtering.
                // We'll keep those with valid distance <= radius
                return guide.distance !== undefined && guide.distance !== null && guide.distance <= filters.radius;
            });

            // Sort by distance
            result.sort((a, b) => a.distance - b.distance);
        }

        setFilteredGuides(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleRadiusChange = (r) => {
        setFilters(prev => ({ ...prev, radius: r }));
    };

    const handleMarkerClick = (guide) => {
        setSelectedGuide(guide);
        setMapCenter({ lat: guide.latitude, lng: guide.longitude });
    };

    return (
        <div className="flex h-[calc(100vh-6rem)]">
            {/* Sidebar List */}
            <div className="w-96 bg-surface-50 dark:bg-surface-900 flex flex-col shadow-lg z-10 border-r flex-shrink-0 md:w-80 lg:w-96">
                <div className="p-6 border-b bg-surface-50 dark:bg-surface-900 z-10">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
                        Find a Guide
                    </h2>

                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                name="city"
                                placeholder="Search by city..."
                                value={filters.city}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg md:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-surface-100 dark:bg-surface-800"
                            />
                            <AdjustmentsHorizontalIcon className="w-5 h-5 text-muted absolute left-3 top-2.5" />
                        </div>

                        {/* Radius Toggles */}
                        {userLocation && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                                    Distance ({filters.radius} km)
                                </label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {[2, 5, 10, 50].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleRadiusChange(r)}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${filters.radius === r
                                                ? 'bg-surface-50 dark:bg-surface-900 text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {r === 50 ? '50+' : r}km
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-surface-100 dark:bg-surface-800">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-semibold text-gray-700 text-sm">
                            Nearby Guides ({filteredGuides.length})
                        </h3>
                        {loading && <span className="text-xs text-blue-500 animate-pulse">Updating...</span>}
                    </div>

                    <div className="space-y-3 pb-20">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
                                <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        {loading && filteredGuides.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">Locating...</p>
                            </div>
                        ) : filteredGuides.length > 0 ? (
                            filteredGuides.map(guide => (
                                <div
                                    key={guide.id}
                                    onClick={() => handleMarkerClick(guide)}
                                    className={`p-3 rounded-xl cursor-pointer border transition duration-200 ${selectedGuide?.id === guide.id
                                        ? 'bg-surface-50 dark:bg-surface-900 border-blue-500 shadow-md ring-1 ring-blue-200'
                                        : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-gray-800">{guide.guideName}</div>
                                                <FavoriteButton itemId={guide.userId} itemType="GUIDE" size="w-4 h-4" className="p-1" />
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">{guide.specialization}</div>
                                        </div>
                                        <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                            <span className="text-yellow-500 text-xs mr-1">★</span>
                                            <span className="text-xs font-bold text-gray-700">{guide.rating ? guide.rating.toFixed(1) : 'NEW'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <div className="flex items-center text-gray-500">
                                            {guide.distance !== undefined && (
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${guide.distance < 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                                    }`}>
                                                    {formatDistance(guide.distance)} away
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-blue-600 hover:underline">View on map</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 px-6 bg-surface-50 dark:bg-surface-900 rounded-xl border border-dashed">
                                <MapPinIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium text-sm">No guides found nearby.</p>
                                <p className="text-xs text-muted mt-1">Try increasing the search radius or changing the city filter.</p>
                                {permissionDenied && (
                                    <p className="text-xs text-red-400 mt-3 bg-red-50 p-2 rounded">
                                        Location access was denied. Please enable location or search by city manually.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-gray-100 z-0">
                <MapView
                    center={mapCenter}
                    userLocation={userLocation}
                    markers={filteredGuides}
                    onMarkerClick={handleMarkerClick}
                    selectedMarker={selectedGuide}
                />

                {/* Floating Guide Card (Mobile/Desktop Overlay) */}
                {selectedGuide && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-surface-50 dark:bg-surface-900 p-4 rounded-xl shadow-2xl z-[1000] border border-surface-200 dark:border-surface-700 animate-slide-up">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{selectedGuide.guideName}</h3>
                                <p className="text-xs text-gray-500">{selectedGuide.city}</p>
                            </div>
                            <button onClick={() => setSelectedGuide(null)} className="p-1 rounded-full hover:bg-gray-100 text-muted">×</button>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                {selectedGuide.specialization}
                            </span>
                            {selectedGuide.distance !== undefined && (
                                <span className="text-muted text-xs">• {formatDistance(selectedGuide.distance)} away</span>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/guide-profile/${selectedGuide.userId}`)}
                            className="w-full bg-blue-600 text-white text-sm py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm active:scale-95 transform"
                        >
                            View Full Profile
                        </button>
                    </div>
                )}

                {/* Status Toasts */}
                {!userLocation && !loading && !permissionDenied && (
                    <div className="absolute top-4 right-4 bg-surface-50 dark:bg-surface-900 px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center space-x-2 z-[1000] animate-fade-in">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-medium text-gray-600">Locating...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideDiscovery;
