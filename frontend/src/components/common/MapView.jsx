import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Utensils, Compass, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const UserIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom DivIcons for Recommendations
const createRecommendationIcon = (category) => {
    let IconComponent = MapPin;
    let color = "#3b82f6"; // Blue for general places

    if (category === 'restaurant') {
        IconComponent = Utensils;
        color = "#ef4444"; // Red for restaurants
    } else if (category === 'activity') {
        IconComponent = Compass;
        color = "#10b981"; // Green for activities
    }

    const iconHtml = renderToStaticMarkup(
        <div style={{ 
            backgroundColor: color, 
            padding: '8px', 
            borderRadius: '50%', 
            border: '2px solid white', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <IconComponent color="white" size={16} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-recommendation-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
};

const MapView = ({ center, zoom = 13, markers = [], selectedMarker, onMarkerClick, userLocation, recommendationMarkers = false }) => {
    const defaultCenter = [27.7172, 85.3240];
    const initialCenter = center ? [center.lat, center.lng] : defaultCenter;

    return (
        <MapContainer
            center={initialCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {center && <RecenterAutomatically lat={center.lat} lng={center.lng} />}

            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                    <Popup>
                        <div className="font-bold text-red-600">You are here</div>
                    </Popup>
                </Marker>
            )}

            {markers.map((marker, idx) => {
                if (!marker.latitude || !marker.longitude) return null;

                // Offset markers with same coordinates to reduce overlap
                const sameLocCount = markers.slice(0, idx).filter(m => 
                    m.latitude === marker.latitude && m.longitude === marker.longitude
                ).length;
                
                const offset = sameLocCount * 0.00012; // Epsilon offset
                const lat = marker.latitude + offset;
                const lng = marker.longitude + offset;

                return (
                    <Marker
                        key={marker.id || `rec-${idx}`}
                        position={[lat, lng]}
                        icon={marker.category ? createRecommendationIcon(marker.category) : DefaultIcon}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(marker),
                        }}
                    >
                        <Popup>
                            <div className="p-2 text-center">
                                <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100 mb-1">{marker.name}</h3>
                                {marker.type && <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">{marker.type.replace('_', ' ')}</p>}
                                {marker.relevance_score && (
                                    <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                                        Score: {marker.relevance_score.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default MapView;
